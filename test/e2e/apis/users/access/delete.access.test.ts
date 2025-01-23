import axios, { AxiosError } from "axios";
import { handleAxiosError } from "../../../helpers/handlers/axios-error.handler";
import { createAdmin } from "../../../helpers/admin/create-admin";

describe('Access', () => {
    describe('Delete user', () => {
        describe('Token not provided', () => {
            test('can not access this feature (401 UNAUTHORIZED)', async () => {
                const expectedStatus = 401;
                try {
                    await axios.delete(`${global.USERS_PATH}/12345`);
                } catch (error) {
                    const axiosError = error as AxiosError;
                    expect(axiosError.status).toBe(expectedStatus);
                }
            });
        });

        describe('Readonly users', () => {
            test('can delete themselves (204 NO CONTENT)', async () => {
                try {
                    const status = 204;

                    // create user
                    const created = await axios.post(global.REGISTER_USER_PATH, {
                        name: global.DATA_GENERATOR.name(),
                        email: global.DATA_GENERATOR.email(),
                        password: global.DATA_GENERATOR.password()
                    });

                    const id = created.data.user.id;
                    const token = created.data.token;

                    // delete it
                    const deleted = await axios.delete(`${global.USERS_PATH}/${id}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });

                    expect(deleted.status).toBe(status);

                } catch (error) {
                    handleAxiosError(error);
                }
            });

            test('can not delete another user (403 FORBIDDEN)', async () => {
                try {
                    const status = 403;

                    // register both
                    const [user1Created, user2Created] = await Promise.all([
                        axios.post(global.REGISTER_USER_PATH, {
                            name: global.DATA_GENERATOR.name(),
                            email: global.DATA_GENERATOR.email(),
                            password: global.DATA_GENERATOR.password(),
                        }),
                        axios.post(global.REGISTER_USER_PATH, {
                            name: global.DATA_GENERATOR.name(),
                            email: global.DATA_GENERATOR.email(),
                            password: global.DATA_GENERATOR.password(),
                        })
                    ]);

                    const user1Token = user1Created.data.token;
                    const user2Id = user2Created.data.user.id;

                    // try to delete user2 with user1's token        
                    try {
                        await axios.delete(`${global.USERS_PATH}/${user2Id}`, {
                            headers: {
                                'Authorization': `Bearer ${user1Token}`
                            }
                        });

                        expect(true).toBeFalsy();

                    } catch (error) {
                        const axiosError = error as AxiosError;
                        expect(axiosError.response?.status).toBe(status);
                    }

                } catch (error) {
                    handleAxiosError(error);
                }
            });
        });

        describe('Admin users', () => {
            test('can delete any "non-admin" user (204 NO CONTENT)', async () => {
                try {
                    const status = 204;

                    // create a readonly user
                    const created = await axios.post(global.REGISTER_USER_PATH, {
                        name: global.DATA_GENERATOR.name(),
                        email: global.DATA_GENERATOR.email(),
                        password: global.DATA_GENERATOR.password(),
                    });
                    const userId = created.data.user.id;

                    // delete it with admin's token                
                    const deleted = await axios.delete(`${global.USERS_PATH}/${userId}`, {
                        headers: {
                            'Authorization': `Bearer ${global.ADMIN_TOKEN}`
                        }
                    });

                    expect(deleted.status).toBe(status);

                } catch (error) {
                    handleAxiosError(error);
                }
            });

            test('can not delete another admin (403 FORBIDDEN)', async () => {
                try {
                    const expectedStatus = 403;

                    // admin created by server 
                    const anotherAdmin = await createAdmin();

                    try {
                        await axios.delete(`${global.USERS_PATH}/${anotherAdmin.id}`, {
                            headers: {
                                'Authorization': `Bearer ${global.ADMIN_TOKEN}`
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
});