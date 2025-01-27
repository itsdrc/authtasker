import axios from "axios";
import { handleAxiosError } from "../../helpers/handlers/axios-error.handler";

describe('Create task', () => {
    describe('Response to client', () => {
        test('response should contain the task data (201 CREATED)', async () => {
            try {
                const expectedStatus = 201;

                const task = {
                    name: global.TASKS_DATA_GENERATOR.name(),
                    description: global.TASKS_DATA_GENERATOR.description(),
                    status: global.TASKS_DATA_GENERATOR.status(),
                    priority: global.TASKS_DATA_GENERATOR.priority()
                };

                const createdTask = await axios.post(
                    global.CREATE_TASK_PATH,
                    task, {
                    headers: {
                        Authorization: `Bearer ${global.ADMIN_TOKEN}`
                    }
                });

                expect(createdTask.status).toBe(expectedStatus);
                expect(createdTask.data).toStrictEqual({
                    name: task.name.toLowerCase().trim(),
                    description: task.description,
                    status: task.status,
                    priority: task.priority,
                    id: expect.any(String),
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                    user: expect.any(String),
                });

            } catch (error) {
                handleAxiosError(error);
            }
        });
    });

    describe('Workflow', () => {
        test('task should be successfully found after creation', async () => {
            try {
                // create a task using the admin token
                const createdTask = await axios.post(global.CREATE_TASK_PATH, {
                    name: global.TASKS_DATA_GENERATOR.name(),
                    description: global.TASKS_DATA_GENERATOR.description(),
                    status: global.TASKS_DATA_GENERATOR.status(),
                    priority: global.TASKS_DATA_GENERATOR.priority(),
                }, {
                    headers: {
                        Authorization: `Bearer ${global.ADMIN_TOKEN}`
                    }
                });

                const taskId = createdTask.data.id;

                // find task
                await axios.get(`${global.TASKS_PATH}/${taskId}`, {
                    headers: {
                        Authorization: `Bearer ${global.ADMIN_TOKEN}`
                    }
                });

            } catch (error) {
                handleAxiosError(error);
            }
        });
    });
});