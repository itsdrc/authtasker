import axios, { AxiosError } from "axios";
import { handleAxiosError } from "../../../helpers/handlers/axios-error.handler";

describe('Access', () => {
    describe('Find task by id', () => {
        describe('Token not provided', () => {
            test('user should not be able to access this feature 401 UNAUTHORIZED', async () => {
                const expectedStatus = 401;
                try {
                    await axios.get(`${global.USERS_PATH}/12345`);
                    expect(false).toBeTruthy();

                } catch (error) {
                    const axiosError = error as AxiosError;
                    expect(axiosError.status).toBe(expectedStatus);
                }
            });
        });

        describe('Readonly users', () => {
            test('can access this feature', async () => {
                try {
                    // create a user, readonly by default
                    const readonlyUser = await axios.post(global.REGISTER_USER_PATH, {
                        name: global.DATA_GENERATOR.name(),
                        email: global.DATA_GENERATOR.email(),
                        password: global.DATA_GENERATOR.password()
                    });

                    const userToken = readonlyUser.data.token;

                    try {
                        // sending an invalid id. I expect the error to not be a 401
                        // due to permissions
                        const found = await axios.get(`${global.TASKS_PATH}/123`, {
                            headers: {
                                Authorization: `Bearer ${userToken}`
                            }
                        });
                        expect(true).toBeFalsy();

                    } catch (error) {
                        const axiosError = error as AxiosError;
                        expect(axiosError.status).not.toBe(401);
                    }

                } catch (error) {
                    handleAxiosError(error);
                }
            });
        });
    });
});