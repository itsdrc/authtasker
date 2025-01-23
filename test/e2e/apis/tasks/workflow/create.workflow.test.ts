import axios from "axios";

describe('Workflow', () => {
    describe('Create task', () => {
        test('task should be successfully found after creation', async () => {
            const expectedStatus = 200;

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
            const taskFound = await axios.get(`${global.TASKS_PATH}/${taskId}`, {
                headers: {
                    Authorization: `Bearer ${global.ADMIN_TOKEN}`
                }
            });

            expect(taskFound.status).toBe(expectedStatus);
        });
    });
});