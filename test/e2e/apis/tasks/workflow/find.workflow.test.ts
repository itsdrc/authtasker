import axios from "axios";
import { handleAxiosError } from "../../../helpers/handlers/axios-error.handler";

describe('Workflow', () => {
    describe('Find task by id', () => {
        describe('When a task is created', () => {
            test('should be successfully found and contain the same data', async () => {
                try {
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

                    // find the task
                    const taskFound = await axios.get(`${global.TASKS_PATH}/${taskId}`, {
                        headers: {
                            Authorization: `Bearer ${global.ADMIN_TOKEN}`
                        }
                    });

                    expect(createdTask.data.name).toBe(taskFound.data.name);
                    expect(createdTask.data.description).toBe(taskFound.data.description);
                    expect(createdTask.data.status).toBe(taskFound.data.status);
                    expect(createdTask.data.priority).toBe(taskFound.data.priority);

                } catch (error) {
                    handleAxiosError(error);
                }
            });
        });
    });
});