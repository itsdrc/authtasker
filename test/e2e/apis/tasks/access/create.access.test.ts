import axios, { AxiosError } from "axios";

describe('Access', () => {
    describe('Create task', () => {
        describe('Token not provided', () => {
            test('should not be able to access this feature (401 UNAUTHORIZED)', async () => {
                const expectedStatus = 401;
                try {
                    await axios.post(`${global.CREATE_TASK_PATH}`, {
                        name: global.TASKS_DATA_GENERATOR.name(),
                        description: global.TASKS_DATA_GENERATOR.description(),
                        status: global.TASKS_DATA_GENERATOR.status(),
                        priority: global.TASKS_DATA_GENERATOR.priority(),
                    });
                } catch (error) {
                    const axiosError = error as AxiosError;
                    expect(axiosError.status).toBe(expectedStatus);
                }
            });
        });

        describe('Readonly user', () => {
            test('should not be able to access this feature (403 FORBIDDEN)', async () => {
                const expectedStatus = 403;

                // create a user (readonly by default)
                const userCreated = await axios.post(`${global.REGISTER_USER_PATH}`, {
                    name: global.DATA_GENERATOR.name(),
                    email: global.DATA_GENERATOR.email(),
                    password: global.DATA_GENERATOR.password()
                });

                const token = userCreated.data.token;

                try {
                    await axios.post(`${global.CREATE_TASK_PATH}`, {
                        name: global.TASKS_DATA_GENERATOR.name(),
                        description: global.TASKS_DATA_GENERATOR.description(),
                        status: global.TASKS_DATA_GENERATOR.status(),
                        priority: global.TASKS_DATA_GENERATOR.priority(),
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                } catch (error) {
                    const axiosError = error as AxiosError;
                    expect(axiosError.status).toBe(expectedStatus);
                }
            });
        });
    });
});