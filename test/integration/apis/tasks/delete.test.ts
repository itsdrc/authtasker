import request from "supertest";
import { getSessionToken } from "../../helpers/token/session.token";
import mongoose from "mongoose";

describe('DELETE/', () => {
    describe('Delete one', () => {
        describe('Authentication/Authorization', () => {
            describe('No token provided', () => {
                test('should return status (401 UNAUTHORIZED)', async () => {
                    const expectedStatus = 401;

                    await request(global.SERVER_APP)
                        .delete(`${global.TASKS_PATH}/123`)
                        .expect(expectedStatus);
                });
            });

            describe('User role is readonly', () => {
                test('should not be able to delete another readonly user task (403 FORBIDDEN)', async () => {
                    const expectedStatus = 403;

                    // create a readonly user
                    const readonlyUser1 = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: 'secret-password',
                        role: 'readonly'
                    });

                    // create another readonly user
                    const readonlyUser2 = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: 'secret-password',
                        role: 'readonly'
                    });

                    // create a task for readonlyUser2
                    const readonlyUser1Task = await global.TASKS_MODEL.create({
                        name: global.TASKS_DATA_GENERATOR.name(),
                        description: global.TASKS_DATA_GENERATOR.description(),
                        status: global.TASKS_DATA_GENERATOR.status(),
                        priority: global.TASKS_DATA_GENERATOR.priority(),
                        user: readonlyUser2.id,
                    });

                    // attemp to delete readonlyUser2 task using the readonlyUser1 token
                    const readonlyUser1Token = getSessionToken(readonlyUser1.id);
                    const readonlyUser2TaskId = readonlyUser1Task.id;

                    await request(global.SERVER_APP)
                        .delete(`${global.TASKS_PATH}/${readonlyUser2TaskId}`)
                        .set('Authorization', `Bearer ${readonlyUser1Token}`)
                        .expect(expectedStatus);
                });

                test('should not be able to delete an editor user task (403 FORBIDDEN)', async () => {
                    const expectedStatus = 403;

                    // create a readonly user
                    const readonlyUser = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: 'secret-password',
                        role: 'readonly',
                    });

                    // create an editor user
                    const editorUser = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: 'secret-password',
                        role: 'editor',
                    });

                    // create a task for the editor user
                    const editorTask = await global.TASKS_MODEL.create({
                        name: global.TASKS_DATA_GENERATOR.name(),
                        description: global.TASKS_DATA_GENERATOR.description(),
                        status: global.TASKS_DATA_GENERATOR.status(),
                        priority: global.TASKS_DATA_GENERATOR.priority(),
                        user: editorUser.id,
                    });

                    // attempt to delete editorUser's task using readonlyUser's token
                    const readonlyUserToken = getSessionToken(readonlyUser.id);
                    const editorTaskId = editorTask.id;

                    await request(global.SERVER_APP)
                        .delete(`${global.TASKS_PATH}/${editorTaskId}`)
                        .set('Authorization', `Bearer ${readonlyUserToken}`)
                        .expect(expectedStatus);
                });

                test('should not be able to delete an administrator user task (403 FORBIDDEN)', async () => {
                    const expectedStatus = 403;

                    // create a readonly user
                    const readonlyUser = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: 'secret-password',
                        role: 'readonly',
                    });

                    // create an administrator user
                    const adminUser = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: 'secret-password',
                        role: 'admin',
                    });

                    // create a task for the administrator user
                    const adminTask = await global.TASKS_MODEL.create({
                        name: global.TASKS_DATA_GENERATOR.name(),
                        description: global.TASKS_DATA_GENERATOR.description(),
                        status: global.TASKS_DATA_GENERATOR.status(),
                        priority: global.TASKS_DATA_GENERATOR.priority(),
                        user: adminUser.id,
                    });

                    // attempt to delete adminUser's task using readonlyUser's token
                    const readonlyUserToken = getSessionToken(readonlyUser.id);
                    const adminTaskId = adminTask.id;

                    await request(global.SERVER_APP)
                        .delete(`${global.TASKS_PATH}/${adminTaskId}`)
                        .set('Authorization', `Bearer ${readonlyUserToken}`)
                        .expect(expectedStatus);
                });
            });

            describe('User role is editor', () => {
                test('should be able to delete their own task', async () => {
                    const expectedStatus = 204;

                    // create an editor user
                    const editorUser = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: 'secret-password',
                        role: 'editor',
                    });

                    // create a task for the editor user
                    const task = await global.TASKS_MODEL.create({
                        name: global.TASKS_DATA_GENERATOR.name(),
                        description: global.TASKS_DATA_GENERATOR.description(),
                        status: global.TASKS_DATA_GENERATOR.status(),
                        priority: global.TASKS_DATA_GENERATOR.priority(),
                        user: editorUser.id,
                    });

                    // attempt to delete their own task using their token
                    const editorUserToken = getSessionToken(editorUser.id);
                    const taskId = task.id;

                    await request(global.SERVER_APP)
                        .delete(`${global.TASKS_PATH}/${taskId}`)
                        .set('Authorization', `Bearer ${editorUserToken}`)
                        .expect(expectedStatus);
                });
                test('should not be able to delete another editor user task (403 FORBIDDEN)', async () => {
                    const expectedStatus = 403;

                    // create an editor user
                    const editorUser1 = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: 'secret-password',
                        role: 'editor',
                    });

                    // create another editor user
                    const editorUser2 = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: 'secret-password',
                        role: 'editor',
                    });

                    // create a task for editorUser2
                    const editorUser1Task = await global.TASKS_MODEL.create({
                        name: global.TASKS_DATA_GENERATOR.name(),
                        description: global.TASKS_DATA_GENERATOR.description(),
                        status: global.TASKS_DATA_GENERATOR.status(),
                        priority: global.TASKS_DATA_GENERATOR.priority(),
                        user: editorUser2.id,
                    });

                    // attemp to delete editorUser2 task using the editorUser1 token
                    const editorUser1Token = getSessionToken(editorUser1.id);
                    const editorUser2TaskId = editorUser1Task.id;

                    await request(global.SERVER_APP)
                        .delete(`${global.TASKS_PATH}/${editorUser2TaskId}`)
                        .set('Authorization', `Bearer ${editorUser1Token}`)
                        .expect(expectedStatus);
                });

                test('should not be able to delete an administrator task (403 FORBIDDEN)', async () => {
                    const expectedStatus = 403;

                    // create an editor user
                    const editorUser = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: 'secret-password',
                        role: 'editor',
                    });

                    // create an administrator user
                    const adminUser = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: 'secret-password',
                        role: 'admin',
                    });

                    // create a task for the administrator user
                    const task = await global.TASKS_MODEL.create({
                        name: global.TASKS_DATA_GENERATOR.name(),
                        description: global.TASKS_DATA_GENERATOR.description(),
                        status: global.TASKS_DATA_GENERATOR.status(),
                        priority: global.TASKS_DATA_GENERATOR.priority(),
                        user: adminUser.id,
                    });

                    // attempt to delete adminUser's task using editorUser's token
                    const editorUserToken = getSessionToken(editorUser.id);
                    const taskId = task.id;

                    await request(global.SERVER_APP)
                        .delete(`${global.TASKS_PATH}/${taskId}`)
                        .set('Authorization', `Bearer ${editorUserToken}`)
                        .expect(expectedStatus);
                });
            });

            describe('User role is administrator', () => {
                test('should be able to delete a readonly user task (204 NO CONTENT)', async () => {
                    const expectedStatus = 204;

                    // create an admin user
                    const adminUser = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: 'secret-password',
                        role: 'admin',
                    });

                    // create a readonly user
                    const readonlyUser = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: 'secret-password',
                        role: 'readonly',
                    });

                    // create a task for the readonly user
                    const task = await global.TASKS_MODEL.create({
                        name: global.TASKS_DATA_GENERATOR.name(),
                        description: global.TASKS_DATA_GENERATOR.description(),
                        status: global.TASKS_DATA_GENERATOR.status(),
                        priority: global.TASKS_DATA_GENERATOR.priority(),
                        user: readonlyUser.id,
                    });

                    // attempt to delete the readonly user's task using the admin token
                    const adminUserToken = getSessionToken(adminUser.id);
                    const taskId = task.id;

                    await request(global.SERVER_APP)
                        .delete(`${global.TASKS_PATH}/${taskId}`)
                        .set('Authorization', `Bearer ${adminUserToken}`)
                        .expect(expectedStatus);
                });

                test('should be able to delete an editor user task (204 NO CONTENT)', async () => {
                    const expectedStatus = 204;

                    // create an admin user
                    const adminUser = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: 'secret-password',
                        role: 'admin',
                    });

                    // create an editor user
                    const editorUser = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: 'secret-password',
                        role: 'editor',
                    });

                    // create a task for the editor user
                    const task = await global.TASKS_MODEL.create({
                        name: global.TASKS_DATA_GENERATOR.name(),
                        description: global.TASKS_DATA_GENERATOR.description(),
                        status: global.TASKS_DATA_GENERATOR.status(),
                        priority: global.TASKS_DATA_GENERATOR.priority(),
                        user: editorUser.id,
                    });

                    // attempt to delete the editor user's task using the admin token
                    const adminUserToken = getSessionToken(adminUser.id);
                    const taskId = task.id;

                    await request(global.SERVER_APP)
                        .delete(`${global.TASKS_PATH}/${taskId}`)
                        .set('Authorization', `Bearer ${adminUserToken}`)
                        .expect(expectedStatus);
                });

                test('should be able to delete their own task (204 NO CONTENT)', async () => {
                    const expectedStatus = 204;

                    // create an admin user
                    const adminUser = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: 'secret-password',
                        role: 'admin',
                    });

                    // create a task for the admin user
                    const task = await global.TASKS_MODEL.create({
                        name: global.TASKS_DATA_GENERATOR.name(),
                        description: global.TASKS_DATA_GENERATOR.description(),
                        status: global.TASKS_DATA_GENERATOR.status(),
                        priority: global.TASKS_DATA_GENERATOR.priority(),
                        user: adminUser.id,
                    });

                    // attempt to delete their own task using their admin token
                    const adminUserToken = getSessionToken(adminUser.id);
                    const taskId = task.id;

                    await request(global.SERVER_APP)
                        .delete(`${global.TASKS_PATH}/${taskId}`)
                        .set('Authorization', `Bearer ${adminUserToken}`)
                        .expect(expectedStatus);
                });

                test('should not be able to delete another administrator task (403 FORBIDDEN)', async () => {
                    const expectedStatus = 403;

                    // create an admin user
                    const adminUser1 = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: 'secret-password',
                        role: 'admin',
                    });

                    // create another admin user
                    const adminUser2 = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: 'secret-password',
                        role: 'admin',
                    });

                    // create a task for the second admin user
                    const task = await global.TASKS_MODEL.create({
                        name: global.TASKS_DATA_GENERATOR.name(),
                        description: global.TASKS_DATA_GENERATOR.description(),
                        status: global.TASKS_DATA_GENERATOR.status(),
                        priority: global.TASKS_DATA_GENERATOR.priority(),
                        user: adminUser2.id,
                    });

                    // attempt to delete the second admin user's task using the first admin token
                    const adminUser1Token = getSessionToken(adminUser1.id);
                    const taskId = task.id;

                    await request(global.SERVER_APP)
                        .delete(`${global.TASKS_PATH}/${taskId}`)
                        .set('Authorization', `Bearer ${adminUser1Token}`)
                        .expect(expectedStatus);
                });
            });
        });

        describe('Process success', () => {
            test('task should be removed from database', async () => {
                // create an editor user
                const editorUser = await global.USER_MODEL.create({
                    name: global.USER_DATA_GENERATOR.name(),
                    email: global.USER_DATA_GENERATOR.email(),
                    password: 'secret-password',
                    role: 'editor',
                });

                // create a task for the editor user
                const task = await global.TASKS_MODEL.create({
                    name: global.TASKS_DATA_GENERATOR.name(),
                    description: global.TASKS_DATA_GENERATOR.description(),
                    status: global.TASKS_DATA_GENERATOR.status(),
                    priority: global.TASKS_DATA_GENERATOR.priority(),
                    user: editorUser.id,
                });

                const token = getSessionToken(editorUser.id);
                const taskId = task.id;

                // delete task
                await request(global.SERVER_APP)
                    .delete(`${global.TASKS_PATH}/${taskId}`)
                    .set('Authorization', `Bearer ${token}`);

                // find task in database
                const taskFound = await global.TASKS_MODEL
                    .findById(taskId)
                    .exec();

                expect(taskFound).toBeNull();
            });
        });

        describe('Client request', () => {
            describe('Id is not valid', () => {
                test('should return status 404 NOT FOUND', async () => {
                    const expectedStatus = 404;

                    // create a user in order to get a valid token
                    const editorUser = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: 'secret-password',
                        role: 'editor',
                    });

                    const token = getSessionToken(editorUser.id);
                    const invalidId = '123';

                    await request(global.SERVER_APP)
                        .delete(`${global.TASKS_PATH}/${invalidId}`)
                        .set('Authorization', `Bearer ${token}`)
                        .expect(expectedStatus);
                });
            });

            describe('Task is not found', () => {
                test('should return status 404 NOT FOUND', async () => {
                    const expectedStatus = 404;

                    // create a user in order to get a valid token
                    const editorUser = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: 'secret-password',
                        role: 'editor',
                    });

                    const token = getSessionToken(editorUser.id);
                    const validMongooseId = new mongoose.Types.ObjectId();

                    await request(global.SERVER_APP)
                        .delete(`${global.TASKS_PATH}/${validMongooseId}`)
                        .set('Authorization', `Bearer ${token}`)
                        .expect(expectedStatus);
                });
            });
        });
    });
});