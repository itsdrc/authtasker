import axios from "axios";
import { handleAxiosError } from "../../helpers/handlers/axios-error.handler";

describe('Find task by id', () => {
    describe('Response to client', () => {
        test('should contain the task data (200 OK)', async () => {
            try {
                const expectedStatus = 200;

                // create a task
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
                const createdTaskData = createdTask.data;

                // find the task
                const taskFound = await axios.get(`${global.TASKS_PATH}/${taskId}`, {
                    headers: {
                        Authorization: `Bearer ${global.ADMIN_TOKEN}`
                    }
                });

                expect(taskFound.status).toBe(expectedStatus);
                expect(createdTask.data).toStrictEqual({
                    name: createdTaskData.name.toLowerCase().trim(),
                    description: createdTaskData.description,
                    status: createdTaskData.status,
                    priority: createdTaskData.priority,
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
});