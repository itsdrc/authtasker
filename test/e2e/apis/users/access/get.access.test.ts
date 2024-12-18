import axios, { AxiosError } from "axios";

describe('Users - GET/ Access', () => {
    describe('Find by id', () => {
        test('can not access if token is not provided (401 UNAUTHORIZED)', async () => {
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

    describe('Find', () => {
        test('can not access if token is not provided (401 UNAUTHORIZED)', async () => {
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