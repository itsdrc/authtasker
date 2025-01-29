import axios from "axios";
import { handleAxiosError } from "../../helpers/handlers/axios-error.handler";

describe('Update task', () => {
    describe('Response to client', () => {
        test('should contain the updated data', async () => {
            try {
                // create a task using the admin token
                const createdTask = await axios.post(
                    global.CREATE_TASK_PATH, {
                    name: global.TASKS_DATA_GENERATOR.name(),
                    description: global.TASKS_DATA_GENERATOR.description(),
                    status: global.TASKS_DATA_GENERATOR.status(),
                    priority: global.TASKS_DATA_GENERATOR.priority()
                }, {
                    headers: {
                        Authorization: `Bearer ${global.ADMIN_TOKEN}`
                    }
                });

                const taskId = createdTask.data.id;

                const newTaskProperties = {
                    name: global.TASKS_DATA_GENERATOR.name(),
                    description: global.TASKS_DATA_GENERATOR.description(),
                    status: global.TASKS_DATA_GENERATOR.status(),
                    priority: global.TASKS_DATA_GENERATOR.priority()
                };

                // update the task
                const updatedTask = await axios.patch(
                    `${global.TASKS_PATH}/${taskId}`,
                    newTaskProperties, {
                    headers: {
                        Authorization: `Bearer ${global.ADMIN_TOKEN}`
                    }
                });

                expect(updatedTask.data).toMatchObject(newTaskProperties);

            } catch (error) {
                handleAxiosError(error);
            }
        });
    });

    describe('Workflow', () => {
        test('data should be updated when task is found after update', async () => {
            try {
                // create a task using the admin token
                const createdTask = await axios.post(
                    global.CREATE_TASK_PATH, {
                    name: global.TASKS_DATA_GENERATOR.name(),
                    description: global.TASKS_DATA_GENERATOR.description(),
                    status: global.TASKS_DATA_GENERATOR.status(),
                    priority: global.TASKS_DATA_GENERATOR.priority()
                }, {
                    headers: {
                        Authorization: `Bearer ${global.ADMIN_TOKEN}`
                    }
                });

                const taskId = createdTask.data.id;

                const newTaskProperties = {
                    name: global.TASKS_DATA_GENERATOR.name(),
                    description: global.TASKS_DATA_GENERATOR.description(),
                    status: global.TASKS_DATA_GENERATOR.status(),
                    priority: global.TASKS_DATA_GENERATOR.priority()
                };

                // update the task
                const updatedTask = await axios.patch(
                    `${global.TASKS_PATH}/${taskId}`,
                    newTaskProperties, {
                    headers: {
                        Authorization: `Bearer ${global.ADMIN_TOKEN}`
                    }
                });

                // find the task
                const taskFound = await axios.get(`${global.TASKS_PATH}/${taskId}`, {
                    headers: {
                        Authorization: `Bearer ${global.ADMIN_TOKEN}`
                    }
                });

                expect(taskFound.data).toMatchObject(newTaskProperties);

            } catch (error) {
                handleAxiosError(error);
            }
        });
    });
});