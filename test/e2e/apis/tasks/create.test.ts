import axios from "axios";
import { handleAxiosError } from "../../helpers/handlers/axios-error.handler";

describe('Create task', () => {
    describe('Task created successfullly', () => {
        test('should be successfully found', async () => {
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