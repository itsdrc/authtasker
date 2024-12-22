import axios from "axios";
import { handleAxiosError } from "../../../helpers/handlers/axios-error.handler";

describe('Update user workflow', () => {
    describe('When a user is updated', () => {
        test('data must be updated when user is found', async () => {
            try {
                // create user            
                const created = await axios.post(global.REGISTER_USER_PATH, {
                    name: global.DATA_GENERATOR.name(),
                    email: global.DATA_GENERATOR.email(),
                    password: global.DATA_GENERATOR.password()
                });

                const userId = created.data.user.id;
                const userToken = created.data.token

                // update
                const userNewData = {
                    name: global.DATA_GENERATOR.name(),
                    email: global.DATA_GENERATOR.email(),
                };

                await axios.patch(`${global.USERS_PATH}/${userId}`,
                    userNewData, {
                    headers: {
                        Authorization: `Bearer ${userToken}`
                    }
                });

                // find by id
                const response = await axios.get(`${global.USERS_PATH}/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${userToken}`
                    }
                });

                expect(response.data).toMatchObject({
                    name: userNewData.name.toLowerCase(),
                    email: userNewData.email,
                });

            } catch (error) {
                handleAxiosError(error);
            }
        });

        test('can login with new data', async () => {
            try {
                const expectedStatus = 200;

                // create user            
                const created = await axios.post(global.REGISTER_USER_PATH, {
                    name: global.DATA_GENERATOR.name(),
                    email: global.DATA_GENERATOR.email(),
                    password: global.DATA_GENERATOR.password()
                });

                const userId = created.data.user.id;
                const userToken = created.data.token

                // update
                const userNewData = {
                    name: global.DATA_GENERATOR.name(),
                    email: global.DATA_GENERATOR.email(),
                    password: global.DATA_GENERATOR.password(),
                };

                await axios.patch(`${global.USERS_PATH}/${userId}`,
                    userNewData, {
                    headers: {
                        Authorization: `Bearer ${userToken}`
                    }
                });

                // login
                const response = await axios.post(global.LOGIN_USER_PATH, {
                    email: userNewData.email,
                    password: userNewData.password
                });

                expect(response.status).toBe(expectedStatus);

            } catch (error) {
                handleAxiosError(error);
            }
        });
    });
});