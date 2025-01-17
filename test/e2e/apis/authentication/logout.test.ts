import axios, { AxiosError } from "axios";
import { handleAxiosError } from "../../helpers/handlers/axios-error.handler";

describe('Authentication', () => {
    describe('Logout', () => {
        test('can not access other resources after a logout (401 UNAUTHORIZED)', async () => {
            try {
                const expectedStatus = 401;

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
                    const response = await axios.get(global.USERS_PATH, {
                        headers: {
                            Authorization: `Bearer ${sessionToken}`
                        }
                    });
                    expect(true).toBeFalsy();

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