import axios, { AxiosError } from "axios";
import { handleAxiosError } from "../../../helpers/handlers/axios-error.handler";

describe('Workflow', () => {
    describe('Delete user', () => {
        describe('When a user is deleted', () => {
            test('can not be found anymore (404 NOT FOUND)', async () => {
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
});