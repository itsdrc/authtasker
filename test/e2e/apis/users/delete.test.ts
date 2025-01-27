import axios, { AxiosError } from "axios";
import { handleAxiosError } from "../../helpers/handlers/axios-error.handler";

describe('Delete user', () => {
    describe('Response to client', () => {
        test('should not contain data (204 NO CONTENT)', async () => {
            try {
                const expectedStatus = 204;

                // create user
                const created = await axios.post(global.REGISTER_USER_PATH, {
                    name: global.DATA_GENERATOR.name(),
                    email: global.DATA_GENERATOR.email(),
                    password: global.DATA_GENERATOR.password()
                });

                const userId = created.data.user.id;

                // delete
                const deleteResponse = await axios.delete(`${global.USERS_PATH}/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${global.ADMIN_TOKEN}`
                    }
                });
                
                expect(deleteResponse.status).toBe(expectedStatus);

            } catch (error) {
                handleAxiosError(error);
            }
        });
    });

    describe('Workflow', () => {
        test('deleted user should not be found anymore', async () => {
            try {
                const expectedStatus = 404;

                // create user
                const created = await axios.post(global.REGISTER_USER_PATH, {
                    name: global.DATA_GENERATOR.name(),
                    email: global.DATA_GENERATOR.email(),
                    password: global.DATA_GENERATOR.password()
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