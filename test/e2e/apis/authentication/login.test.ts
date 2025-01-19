import axios from "axios";
import { handleAxiosError } from "../../helpers/handlers/axios-error.handler";

describe('Authentication', () => {
    describe('Login', () => {
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