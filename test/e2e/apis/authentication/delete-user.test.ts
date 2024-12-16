import axios, { AxiosError } from "axios";
import { UserRequest } from "@root/types/user/user-request.type";
import * as dataGenerator from "../../helpers/generators/user-info.generator";
import { handleAxiosError } from "../../helpers/handlers/axios-error.handler";
import { ConfigService } from "@root/services/config.service";

describe('Users Authentication', () => {    
    describe('DELETE', () => {
        describe('Readonly users...', () => {
            test('can delete themselves', async () => {
                try {
                    const expectedStatus = 204;
                    const user: UserRequest = {
                        name: dataGenerator.name(),
                        email: dataGenerator.email(),
                        password: dataGenerator.password(),
                    };

                    // register
                    const response = await axios.post(global.CREATE_USER_PATH, user);
                    const id = response.data.user.id;
                    const token = response.data.token;

                    // delete                    
                    const deletionResponse = await axios.delete(`${global.DELETE_USER_PATH}/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    expect(deletionResponse.status).toBe(expectedStatus);

                } catch (error) {
                    handleAxiosError(error);
                }
            });

            test('can not delete another user', async () => {
                try {
                    const expectedStatus = 401;
                    const user1: UserRequest = {
                        name: dataGenerator.name(),
                        email: dataGenerator.email(),
                        password: dataGenerator.password(),
                    };

                    const user2: UserRequest = {
                        name: dataGenerator.name(),
                        email: dataGenerator.email(),
                        password: dataGenerator.password(),
                    };

                    // register both
                    const [user1CreatedResponse, user2CreatedResponse] = await Promise.all([
                        axios.post(global.CREATE_USER_PATH, user1),
                        axios.post(global.CREATE_USER_PATH, user2)
                    ]);

                    const user1Token = user1CreatedResponse.data.token;
                    const user2Id = user2CreatedResponse.data.user.id;

                    // try to delete user2 with user1's token        
                    try {
                        await axios.delete(`${global.DELETE_USER_PATH}/${user2Id}`, {
                            headers: {
                                'Authorization': `Bearer ${user1Token}`
                            }
                        });

                    } catch (error) {
                        const axiosError = error as AxiosError;
                        expect(axiosError.response?.status).toBe(expectedStatus);
                    }

                } catch (error) {
                    handleAxiosError(error);
                }
            });
        });
    });
});