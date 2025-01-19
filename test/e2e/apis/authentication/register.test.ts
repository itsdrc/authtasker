import axios from "axios";
import { handleAxiosError } from "../../helpers/handlers/axios-error.handler";

describe('Authentication', () => {
    describe('Register', () => {
        test('user should be able to access other resources using the provided token', async () => {
            try {
                const response = await axios.post(global.REGISTER_USER_PATH, {
                    name: global.DATA_GENERATOR.name(),
                    email: global.DATA_GENERATOR.email(),
                    password: global.DATA_GENERATOR.password()
                });

                const token = response.data.token;

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

        test('user should be successfully found after creation', async () => {
            try {
                const response = await axios.post(global.REGISTER_USER_PATH, {
                    name: global.DATA_GENERATOR.name(),
                    email: global.DATA_GENERATOR.email(),
                    password: global.DATA_GENERATOR.password()
                });

                const userId = response.data.user.id;
                const token = response.data.token;

                // findOne                
                const findOneResponse = await axios.get(`${global.USERS_PATH}/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                expect(findOneResponse.status).toBe(200);

            } catch (error) {
                handleAxiosError(error);
            }
        });
    });
});