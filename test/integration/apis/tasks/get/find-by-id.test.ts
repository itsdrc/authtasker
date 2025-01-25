import request from "supertest";
import { getSessionToken } from "../../../helpers/token/session.token";
import { Types } from "mongoose";

describe('GET/', () => {
    describe('Find task by id', () => {
        describe('Task is found', () => {
            test('should return the expected task and status 200 OK', async () => {
                const expectedStatus = 200;

                // create a user
                const createdUser = await global.USER_MODEL.create({
                    name: global.USER_DATA_GENERATOR.name(),
                    email: global.USER_DATA_GENERATOR.email(),
                    password: global.USER_DATA_GENERATOR.password()
                });

                // create a task using the user id
                const createdTask = await global.TASKS_MODEL.create({
                    user: createdUser.id,
                    name: global.TASKS_DATA_GENERATOR.name(),
                    description: global.TASKS_DATA_GENERATOR.description(),
                    status: global.TASKS_DATA_GENERATOR.status(),
                    priority: global.TASKS_DATA_GENERATOR.priority(),
                });

                const taskId = createdTask.id;

                // a session token is needed
                const token = getSessionToken(createdUser.id);

                // use the api to find the task
                const taskFound = await request(global.SERVER_APP)
                    .get(`${global.TASKS_PATH}/${taskId}`)
                    .set('Authorization', `Bearer ${token}`)
                    .expect(expectedStatus);

                expect(taskFound.body.name).toBe(createdTask.name);
                expect(taskFound.body.description).toBe(createdTask.description);
                expect(taskFound.body.status).toBe(createdTask.status);
                expect(taskFound.body.priority).toBe(createdTask.priority);
            });
        });

        // ensures roles middleware is applied
        describe('Token not provided', () => {
            test('should return status 401 UNAUTHORIZED', async () => {
                const expectedStatus = 401;

                await request(global.SERVER_APP)
                    .get(`${global.USERS_PATH}/123`)
                    .expect(expectedStatus);
            });
        });

        describe('Task is not found', () => {
            test('should return status 404 NOT FOUND', async () => {
                const expectedStatus = 404;

                // generate a valid mongo id
                const validMongoId = new Types.ObjectId();

                // create a user in order to use a valid token
                const createdUser = await global.USER_MODEL.create({
                    name: global.USER_DATA_GENERATOR.name(),
                    email: global.USER_DATA_GENERATOR.email(),
                    password: global.USER_DATA_GENERATOR.password()
                });

                // a session token is needed
                const token = getSessionToken(createdUser.id);

                const taskFound = await request(global.SERVER_APP)
                    .get(`${global.USERS_PATH}/${validMongoId}`)
                    .set('Authorization', `Bearer ${token}`)
                    .expect(expectedStatus);
            });
        });

        describe('Provided id is not valid', () => {
            test('should return status 404 NOT FOUND', async () => {
                const expectedStatus = 404;

                // generate a valid mongo id
                const invalidMongoId = '123';

                // create a user in order to use a valid token
                const createdUser = await global.USER_MODEL.create({
                    name: global.USER_DATA_GENERATOR.name(),
                    email: global.USER_DATA_GENERATOR.email(),
                    password: global.USER_DATA_GENERATOR.password()
                });

                // a session token is needed
                const token = getSessionToken(createdUser.id);

                const taskFound = await request(global.SERVER_APP)
                    .get(`${global.USERS_PATH}/${invalidMongoId}`)
                    .set('Authorization', `Bearer ${token}`)
                    .expect(expectedStatus);
            });
        });
    });
});