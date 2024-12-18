import axios, { AxiosError } from "axios";
import * as dataGenerator from "../../../helpers/generators/user-info.generator";
import { handleAxiosError } from "../../../helpers/handlers/axios-error.handler";
import { createAdmin } from "../../../helpers/admin/create-admin";

describe('Users - DELETE/ Access', () => {
    describe('Readonly users', () => {
        test('can delete themselves (204 NO CONTENT)', async () => {
            try {
                const status = 204;

                // create user
                const created = await axios.post(global.REGISTER_USER_PATH, {
                    name: dataGenerator.name(),
                    email: dataGenerator.email(),
                    password: dataGenerator.password()
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

        test('can not delete another user (401 Unauthorized)', async () => {
            try {
                const status = 401;

                // register both
                const [user1Created, user2Created] = await Promise.all([
                    axios.post(global.REGISTER_USER_PATH, {
                        name: dataGenerator.name(),
                        email: dataGenerator.email(),
                        password: dataGenerator.password(),
                    }),
                    axios.post(global.REGISTER_USER_PATH, {
                        name: dataGenerator.name(),
                        email: dataGenerator.email(),
                        password: dataGenerator.password(),
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
                    name: dataGenerator.name(),
                    email: dataGenerator.email(),
                    password: dataGenerator.password(),
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

        test('can not delete another admin (401 Unauthorized)', async () => {
            try {
                const expectedStatus = 401;

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