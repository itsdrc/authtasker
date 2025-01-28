import axios, { AxiosError } from "axios";
import { handleAxiosError } from "../../helpers/handlers/axios-error.handler";

describe('Delete task', () => {
    describe('Response to client', () => {
        test('should not contain data (204 NO CONTENT)', async () => {
            try {
                // create a task using the admin token
                const createdTaskResponse = await axios.post(global.CREATE_TASK_PATH, {
                    name: global.TASKS_DATA_GENERATOR.name(),
                    description: global.TASKS_DATA_GENERATOR.description(),
                    status: global.TASKS_DATA_GENERATOR.status(),
                    priority: global.TASKS_DATA_GENERATOR.priority()
                }, {
                    headers: {
                        Authorization: `Bearer ${global.ADMIN_TOKEN}`
                    }
                });

                const taskId = createdTaskResponse.data.id;

                // delete task using the token provided
                const deletedTaskResponse = await axios.delete(`${global.TASKS_PATH}/${taskId}`, {
                    headers: {
                        Authorization: `Bearer ${global.ADMIN_TOKEN}`
                    }
                });

                expect(deletedTaskResponse.status).toBe(204);

            } catch (error) {
                handleAxiosError(error);
            }
        });
    });

    describe('Workflow', () => {
        test('deleted task should not be found anymore', async () => {
            try {
                // create a task using the admin token
                const createdTaskResponse = await axios.post(global.CREATE_TASK_PATH, {
                    name: global.TASKS_DATA_GENERATOR.name(),
                    description: global.TASKS_DATA_GENERATOR.description(),
                    status: global.TASKS_DATA_GENERATOR.status(),
                    priority: global.TASKS_DATA_GENERATOR.priority()
                }, {
                    headers: {
                        Authorization: `Bearer ${global.ADMIN_TOKEN}`
                    }
                });

                const taskId = createdTaskResponse.data.id;

                // delete task using the token provided
                await axios.delete(`${global.TASKS_PATH}/${taskId}`, {
                    headers: {
                        Authorization: `Bearer ${global.ADMIN_TOKEN}`
                    }
                });

                try {
                    // find by id
                    await axios.get(`${global.TASKS_PATH}/${taskId}`, {
                        headers: {
                            Authorization: `Bearer ${global.ADMIN_TOKEN}`
                        }
                    });

                } catch (error) {
                    expect((error as AxiosError).status).toBe(404);
                }

            } catch (error) {
                handleAxiosError(error);
            }
        });
    });
});