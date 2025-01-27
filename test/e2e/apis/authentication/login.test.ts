import axios from "axios";
import { handleAxiosError } from "../../helpers/handlers/axios-error.handler";

describe('Authentication', () => {
    describe('Login', () => {
        describe('Response to client', () => {
            test('should contain user data and token (200 OK)', async () => {
                try {
                    const expectedStatus = 200;

                    const user = {
                        name: global.DATA_GENERATOR.name(),
                        email: global.DATA_GENERATOR.email(),
                        password: global.DATA_GENERATOR.password()
                    };

                    // create user
                    await axios.post(global.REGISTER_USER_PATH, user);

                    // login user
                    const loginResponse = await axios.post(global.LOGIN_USER_PATH, {
                        email: user.email,
                        password: user.password
                    });

                    expect(loginResponse.status).toBe(expectedStatus);
                    expect(loginResponse.data.token).toBeDefined();
                    expect(loginResponse.data.user).toStrictEqual({
                        name: user.name.toLowerCase().trim(),
                        email: user.email,
                        role: 'readonly',
                        emailValidated: false,
                        id: expect.any(String),
                        createdAt: expect.any(String),
                        updatedAt: expect.any(String),
                    });

                } catch (error) {
                    handleAxiosError(error);
                }
            });
        });

        describe('Workfloww', () => {
            test('user should be able to access other resources using the provided token', async () => {
                try {
                    const user = {
                        name: global.DATA_GENERATOR.name(),
                        email: global.DATA_GENERATOR.email(),
                        password: global.DATA_GENERATOR.password()
                    };

                    // register a user
                    await axios.post(global.REGISTER_USER_PATH, user);

                    // login
                    const loginResponse = await axios.post(global.LOGIN_USER_PATH, {
                        email: user.email,
                        password: user.password
                    });

                    const token = loginResponse.data.token;

                    // findAll
                    const findAllResponse = await axios.get(global.USERS_PATH, {
                        headers: { Authorization: `Bearer ${token}` },
                        params: { limit: 1, page: 1 },
                    });

                    expect(findAllResponse.status).toBe(200);

                } catch (error) {
                    handleAxiosError(error);
                }
            });
        });
    });
});