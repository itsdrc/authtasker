import axios from "axios";
import { handleAxiosError } from "../../helpers/handlers/axios-error.handler";

describe('Authentication', () => {
    describe('Logout', () => {
        describe('User successfully logged out', () => {
            test('can not access other resources with their token (401 UNAUTHORIZED)', async () => {
                try {
                    const expectedStatus = 401;

                    // create a user
                    const userCreated = await axios.post(global.REGISTER_USER_PATH, {
                        name: global.DATA_GENERATOR.name(),
                        email: global.DATA_GENERATOR.email(),
                        password: global.DATA_GENERATOR.password()
                    });

                    // get token
                    const sessionToken = userCreated.data.token;

                    // request logout
                    await axios.post(`${global.USERS_PATH}/logout`, {}, {
                        headers: {
                            Authorization: `Bearer ${sessionToken}`
                        }
                    });

                    try {
                        // try to access another resource (findAll api)                        
                        await axios.get(global.USERS_PATH, {
                            headers: {
                                Authorization: `Bearer ${sessionToken}`
                            }
                        });
                        expect(true).toBeFalsy();

                    } catch (error: any) {
                        expect(error.response?.status).toBe(expectedStatus);
                        expect(error.response.data.error).toBe('Invalid bearer token');
                    }

                } catch (error) {
                    handleAxiosError(error);
                }
            });
        });
    });
});