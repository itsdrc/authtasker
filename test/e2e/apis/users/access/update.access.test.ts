import axios, { AxiosError } from "axios";
import { handleAxiosError } from "../../../helpers/handlers/axios-error.handler";
import { createAdmin } from "../../../helpers/admin/create-admin";

describe('Access', () => {
    describe('Update user', () => {
        describe('Token not provided', () => {
            test('can not access this feature (401 UNAUTHORIZED)', async () => {
                const expectedStatus = 401;
                try {
                    await axios.patch(`${global.USERS_PATH}/12345`);
                } catch (error) {
                    const axiosError = error as AxiosError;
                    expect(axiosError.status).toBe(expectedStatus);
                }
            });
        });

        describe('Readonly users', () => {
            test('can update themselves (200 OK)', async () => {
                try {
                    const status = 200;

                    // create user
                    const created = await axios.post(global.REGISTER_USER_PATH, {
                        name: global.DATA_GENERATOR.name(),
                        email: global.DATA_GENERATOR.email(),
                        password: global.DATA_GENERATOR.password()
                    });

                    const id = created.data.user.id;
                    const token = created.data.token;

                    // update
                    const updated = await axios.patch(
                        `${global.USERS_PATH}/${id}`,
                        { name: global.DATA_GENERATOR.name() },
                        {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    );

                    expect(updated.status).toBe(status);

                } catch (error) {
                    handleAxiosError(error);
                }
            });

            test('can not update another user (403 FORBIDDEN)', async () => {
                try {
                    const expectedStatus = 403;

                    // create user
                    const user1Created = await axios.post(global.REGISTER_USER_PATH, {
                        name: global.DATA_GENERATOR.name(),
                        email: global.DATA_GENERATOR.email(),
                        password: global.DATA_GENERATOR.password()
                    });

                    // create another user
                    const user2Created = await axios.post(global.REGISTER_USER_PATH, {
                        name: global.DATA_GENERATOR.name(),
                        email: global.DATA_GENERATOR.email(),
                        password: global.DATA_GENERATOR.password()
                    });

                    const user2Id = user2Created.data.user.id;
                    const user1Token = user1Created.data.token;

                    try {
                        await axios.patch(
                            `${global.USERS_PATH}/${user2Id}`,
                            { name: global.DATA_GENERATOR.name() },
                            {
                                headers: {
                                    Authorization: `Bearer ${user1Token}`
                                }
                            }
                        );

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

        describe('Admin users', () => {
            test('can update any "non-admin" user (200 OK)', async () => {
                try {
                    const expectedStatus = 200;

                    // create user
                    const created = await axios.post(global.REGISTER_USER_PATH, {
                        name: global.DATA_GENERATOR.name(),
                        email: global.DATA_GENERATOR.email(),
                        password: global.DATA_GENERATOR.password()
                    });

                    const userCreatedId = created.data.user.id;

                    // update with admin's token
                    const updated = await axios.patch(
                        `${global.USERS_PATH}/${userCreatedId}`
                        , { name: global.DATA_GENERATOR.name() },
                        {
                            headers: {
                                Authorization: `Bearer ${global.ADMIN_TOKEN}`
                            }
                        }
                    );

                    expect(updated.status).toBe(expectedStatus);

                } catch (error) {
                    handleAxiosError(error);
                }
            });

            test('can not update another admin (403 FORBIDDEN)', async () => {
                try {
                    const expectedStatus = 403;

                    // simulate admin created by server
                    const newAdmin = await createAdmin();
                    const newAdminId = newAdmin.id;

                    try {
                        // update with admin's token
                        await axios.patch(
                            `${global.USERS_PATH}/${newAdminId}`,
                            { name: global.DATA_GENERATOR.name() },
                            {
                                headers: {
                                    Authorization: `Bearer ${global.ADMIN_TOKEN}`
                                }
                            }
                        );

                        expect(false).toBeTruthy();

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