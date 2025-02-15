import axios from "axios";
import { handleAxiosError } from "../../helpers/handlers/axios-error.handler";

describe('Delete task', () => {
    describe('Task successfully deleted', () => {
        test('should not be found anymore (404 NOT FOUND)', async () => {
            try {
                const expectedStatus = 404;

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

                } catch (error: any) {
                    expect(error.response.status).toBe(expectedStatus);
                    expect(error.response?.data.error)
                        .toBe(`Task with id ${taskId} not found`)
                }

            } catch (error) {
                handleAxiosError(error);
            }
        });
    });
});