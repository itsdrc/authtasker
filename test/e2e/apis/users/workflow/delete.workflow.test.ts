import axios, { AxiosError } from "axios";
import * as dataGenerator from "../../../helpers/generators/user-info.generator";
import { handleAxiosError } from "../../../helpers/handlers/axios-error.handler";

describe('Users - DELETE/ Workflow', () => {
    describe('A deleted user', () => {
        test('can not be found anymore (404 NOT FOUND)', async () => {
            try {
                const expectedStatus = 404;

                // create user
                const created = await axios.post(global.REGISTER_USER_PATH, {
                    name: dataGenerator.name(),
                    email: dataGenerator.email(),
                    password: dataGenerator.password()
                });

                const userId = created.data.user.id;

                // delete
                await axios.delete(`${global.USERS_PATH}/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${global.ADMIN_TOKEN}`
                    }
                });

                try {
                    // find by id
                    await axios.get(`${global.USERS_PATH}/${userId}`, {
                        headers: {
                            Authorization: `Bearer ${global.ADMIN_TOKEN}`
                        }
                    });

                    expect(true).toBeFalsy();

                } catch (error) {
                    const axiosError = error as AxiosError;                    
                    expect(axiosError.status).toBe(expectedStatus);
                }

            } catch (error) {
                handleAxiosError(error);
            }
        });
    });
});