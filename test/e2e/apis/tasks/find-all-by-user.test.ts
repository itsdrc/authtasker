import axios from "axios";
import { handleAxiosError } from "../../helpers/handlers/axios-error.handler";

describe('Find all tasks by user', () => {
    describe('User task is deleted', () => {
        test('should not appear in the tasks belonging to the user', async () => {
            try {
                // create a task using the admin token
                const createdTask = await axios.post(global.CREATE_TASK_PATH, {
                    name: global.TASKS_DATA_GENERATOR.name(),
                    description: global.TASKS_DATA_GENERATOR.description(),
                    status: global.TASKS_DATA_GENERATOR.status(),
                    priority: global.TASKS_DATA_GENERATOR.priority()
                }, {
                    headers: {
                        Authorization: `Bearer ${global.ADMIN_TOKEN}`
                    }
                });

                const createdTaskId = createdTask.data.name;
                const adminId = createdTask.data.user;

                // delete the task
                await axios.delete(`${global.TASKS_PATH}/${createdTask.data.id}`, {
                    headers: {
                        Authorization: `Bearer ${global.ADMIN_TOKEN}`
                    }
                });

                // find all the tasks
                const allAdminTasks = await axios.get(`${global.TASKS_PATH}/allBYUser/${adminId}`, {
                    headers: {
                        Authorization: `Bearer ${global.ADMIN_TOKEN}`
                    }
                });

                const tasks = allAdminTasks.data as Array<any>;
                tasks.forEach(task => {
                    expect(task).not.toBe(expect.objectContaining({
                        id: createdTaskId
                    }))
                });

            } catch (error) {
                handleAxiosError(error);
            }
        }); 
    });
});