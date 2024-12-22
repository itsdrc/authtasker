import axios, { AxiosError } from "axios";
import { handleAxiosError } from "../../../helpers/handlers/axios-error.handler";

describe('FIND USER/S ACCESS', () => {
    describe('Find by id', () => {
        describe('Token not provided', () => {
            test('can not access this feature (401 UNAUTHORIZED)', async () => {
                const expectedStatus = 401;
                try {
                    await axios.get(`${global.USERS_PATH}/12345`);
                    expect(false).toBeTruthy();

                } catch (error) {
                    const axiosError = error as AxiosError;
                    expect(axiosError.status).toBe(expectedStatus);
                }
            });
        });

        describe('Readonly users', () => {
            test('can access this feature (200 OK)', async () => {
                try {
                    const expectedStatus = 200;

                    const user1Created = await axios.post(global.REGISTER_USER_PATH, {
                        name: global.DATA_GENERATOR.name(),
                        email: global.DATA_GENERATOR.email(),
                        password: global.DATA_GENERATOR.password()
                    });

                    const user1Token = user1Created.data.token;

                    const user2Created = await axios.post(global.REGISTER_USER_PATH, {
                        name: global.DATA_GENERATOR.name(),
                        email: global.DATA_GENERATOR.email(),
                        password: global.DATA_GENERATOR.password()
                    });

                    const user2Id = user2Created.data.user.id;

                    const found = await axios.get(`${global.USERS_PATH}/${user2Id}`, {
                        headers: {
                            Authorization: `Bearer ${user1Token}`
                        }
                    });

                    expect(found.status).toBe(expectedStatus);

                } catch (error) {
                    handleAxiosError(error);
                }
            });
        });
    });

    describe('Find many by pagination', () => {
        describe('Token not provided', () => {
            test('can not access this feature (401 UNAUTHORIZED)', async () => {
                const expectedStatus = 401;
                try {
                    await axios.get(`${global.USERS_PATH}`);
                    expect(false).toBeTruthy();

                } catch (error) {
                    const axiosError = error as AxiosError;
                    expect(axiosError.status).toBe(expectedStatus);
                }
            });
        });
    });
});