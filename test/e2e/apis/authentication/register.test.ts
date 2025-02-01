import axios from "axios";
import { handleAxiosError } from "../../helpers/handlers/axios-error.handler";

describe('Authentication', () => {
    describe('Register user', () => {
        test('created user can login', async () => {
            try {
                const user = {
                    name: global.DATA_GENERATOR.name(),
                    email: global.DATA_GENERATOR.email(),
                    password: global.DATA_GENERATOR.password()
                }

                // create user
                await axios.post(
                    global.REGISTER_USER_PATH,
                    user
                );

                // login
                await axios.post(global.LOGIN_USER_PATH, {
                    email: user.email,
                    password: user.password
                });

            } catch (error) {
                handleAxiosError(error);
            }
        });

        test('user should be able to access other resources using the provided token', async () => {
            try {
                const response = await axios.post(global.REGISTER_USER_PATH, {
                    name: global.DATA_GENERATOR.name(),
                    email: global.DATA_GENERATOR.email(),
                    password: global.DATA_GENERATOR.password()
                });

                const token = response.data.token;

                // access to findAll
                await axios.get(global.USERS_PATH, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { limit: 1, page: 1 },
                });

            } catch (error) {
                handleAxiosError(error);
            }
        });

        test('user should be successfully found after creation', async () => {
            try {                
                const response = await axios.post(global.REGISTER_USER_PATH, {
                    name: global.DATA_GENERATOR.name(),
                    email: global.DATA_GENERATOR.email(),
                    password: global.DATA_GENERATOR.password()
                });

                const userId = response.data.user.id;
                const token = response.data.token;

                // find the user created
                await axios.get(`${global.USERS_PATH}/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

            } catch (error) {
                handleAxiosError(error);
            }
        });
    });
});