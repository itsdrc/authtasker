import { getSessionToken } from "../../helpers/token/session.token";
import request from "supertest";

describe('POST/', () => {
    describe('Create task', () => {
        describe('Authentication/Authorization', () => {
            describe('Token not provided', () => {
                test('should return status 401 UNAUTHORIZED', async () => {
                    const expectedStatus = 401;

                    await request(global.SERVER_APP)
                        .post(global.CREATE_TASK_PATH)
                        .send({
                            name: global.TASKS_DATA_GENERATOR.name(),
                            description: global.TASKS_DATA_GENERATOR.description(),
                            status: global.TASKS_DATA_GENERATOR.status(),
                            priority: global.TASKS_DATA_GENERATOR.priority(),
                        })
                        .expect(expectedStatus);
                });
            });

            describe('User is role readonly', () => {
                test('should not be able to access this feature (403 FORBIDDEN)', async () => {
                    const expectedStatus = 403;

                    // create a readonly user
                    const userCreated = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: 'secret-password',
                        role: 'readonly'
                    });

                    // generate a session token
                    const readonlyToken = getSessionToken(userCreated.id);

                    // task creation attemp
                    await request(global.SERVER_APP)
                        .post(global.CREATE_TASK_PATH)
                        .send({
                            name: global.TASKS_DATA_GENERATOR.name(),
                            description: global.TASKS_DATA_GENERATOR.description(),
                            status: global.TASKS_DATA_GENERATOR.status(),
                            priority: global.TASKS_DATA_GENERATOR.priority(),
                        })
                        .set('Authorization', `Bearer ${readonlyToken}`)
                        .expect(expectedStatus);
                });
            });

            describe('User is role is editor', () => {
                test('task should be successfully created (201 CREATED)', async () => {
                    const expectedStatus = 201;

                    // create an editor user
                    const userCreated = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: 'secret-password',
                        role: 'editor'
                    });

                    // generate a session token
                    const editorToken = getSessionToken(userCreated.id);

                    // task creation attemp
                    await request(global.SERVER_APP)
                        .post(global.CREATE_TASK_PATH)
                        .send({
                            name: global.TASKS_DATA_GENERATOR.name(),
                            description: global.TASKS_DATA_GENERATOR.description(),
                            status: global.TASKS_DATA_GENERATOR.status(),
                            priority: global.TASKS_DATA_GENERATOR.priority(),
                        })
                        .set('Authorization', `Bearer ${editorToken}`)
                        .expect(expectedStatus);
                });
            });

            describe('User role is administrator', () => {
                test('task should be successfully created (201 CREATED) ', async () => {
                    const expectedStatus = 201;

                    // create an administrator
                    const userCreated = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: 'secret-password',
                        role: 'admin'
                    });

                    // generate a session token
                    const adminToken = getSessionToken(userCreated.id);

                    // task creation attemp
                    await request(global.SERVER_APP)
                        .post(global.CREATE_TASK_PATH)
                        .send({
                            name: global.TASKS_DATA_GENERATOR.name(),
                            description: global.TASKS_DATA_GENERATOR.description(),
                            status: global.TASKS_DATA_GENERATOR.status(),
                            priority: global.TASKS_DATA_GENERATOR.priority(),
                        })
                        .set('Authorization', `Bearer ${adminToken}`)
                        .expect(expectedStatus);
                });
            });
        });

        describe('Database', () => {
            test('task name should be converted to lowercase', async () => {
                // create an editor user
                const userCreated = await global.USER_MODEL.create({
                    name: global.USER_DATA_GENERATOR.name(),
                    email: global.USER_DATA_GENERATOR.email(),
                    password: 'secret-password',
                    role: 'editor'
                });

                // generate a session token
                const editorToken = getSessionToken(userCreated.id);

                const expectedName = global.TASKS_DATA_GENERATOR.name()
                    .toLowerCase()
                    .trim();

                const task = {
                    name: expectedName.toUpperCase(),
                    description: global.TASKS_DATA_GENERATOR.description(),
                    status: global.TASKS_DATA_GENERATOR.status(),
                    priority: global.TASKS_DATA_GENERATOR.priority(),
                };

                // create task
                const createdTask = await request(global.SERVER_APP)
                    .post(global.CREATE_TASK_PATH)
                    .send(task)
                    .set('Authorization', `Bearer ${editorToken}`)
                    .expect(201);

                const taskInDb = await TASKS_MODEL
                    .findById(createdTask.body.id)
                    .exec();

                expect(taskInDb?.name).toBe(expectedName);
            });

            test('should save description, status and priority with no changes in database', async () => {
                // create an editor user
                const userCreated = await global.USER_MODEL.create({
                    name: global.USER_DATA_GENERATOR.name(),
                    email: global.USER_DATA_GENERATOR.email(),
                    password: 'secret-password',
                    role: 'editor'
                });

                // generate a session token
                const editorToken = getSessionToken(userCreated.id);

                const task = {
                    description: global.TASKS_DATA_GENERATOR.description(),
                    name: global.TASKS_DATA_GENERATOR.name(),
                    status: global.TASKS_DATA_GENERATOR.status(),
                    priority: global.TASKS_DATA_GENERATOR.priority(),
                };

                // create task
                const createdTask = await request(global.SERVER_APP)
                    .post(global.CREATE_TASK_PATH)
                    .send(task)
                    .set('Authorization', `Bearer ${editorToken}`)
                    .expect(201);

                const taskInDb = await TASKS_MODEL
                    .findById(createdTask.body.id)
                    .exec();

                expect(taskInDb?.status).toBe(task.status);
                expect(taskInDb?.description).toBe(task.description);
                expect(taskInDb?.priority).toBe(task.priority);
            });
        });

        describe('Response to client', () => {
            test('should contain the same database data', async () => {
                // create an editor user
                const userCreated = await global.USER_MODEL.create({
                    name: global.USER_DATA_GENERATOR.name(),
                    email: global.USER_DATA_GENERATOR.email(),
                    password: 'secret-password',
                    role: 'editor'
                });

                // generate a session token
                const editorToken = getSessionToken(userCreated.id);

                const task = {
                    description: global.TASKS_DATA_GENERATOR.description(),
                    name: global.TASKS_DATA_GENERATOR.name(),
                    status: global.TASKS_DATA_GENERATOR.status(),
                    priority: global.TASKS_DATA_GENERATOR.priority(),
                };

                // create task
                const createdTask = await request(global.SERVER_APP)
                    .post(global.CREATE_TASK_PATH)
                    .send(task)
                    .set('Authorization', `Bearer ${editorToken}`)
                    .expect(201);

                const taskInDb = await TASKS_MODEL
                    .findById(createdTask.body.id)
                    .exec();

                expect(taskInDb?.name).toBe(createdTask.body.name);
                expect(taskInDb?.status).toBe(createdTask.body.status);
                expect(taskInDb?.description).toBe(createdTask.body.description);
                expect(taskInDb?.priority).toBe(createdTask.body.priority);
            });
        });

        describe('Client request', () => {
            test('a missing property causes (400 BAD REQUEST)', async () => {
                // THIS ENSURES VALIDATION CLASS IS INTEGRATED CORRECTLY
                const expectedStatus = 400;

                // create an editor user
                const userCreated = await global.USER_MODEL.create({
                    name: global.USER_DATA_GENERATOR.name(),
                    email: global.USER_DATA_GENERATOR.email(),
                    password: 'secret-password',
                    role: 'editor'
                });

                // generate a session token
                const editorToken = getSessionToken(userCreated.id);

                const taskWithoutName = {
                    description: global.TASKS_DATA_GENERATOR.description(),
                    status: global.TASKS_DATA_GENERATOR.status(),
                    priority: global.TASKS_DATA_GENERATOR.priority(),
                };

                // create task
                await request(global.SERVER_APP)
                    .post(global.CREATE_TASK_PATH)
                    .send(taskWithoutName)
                    .set('Authorization', `Bearer ${editorToken}`)
                    .expect(expectedStatus);
            });

            test('already existing name causes (400 BAD REQUEST)', async () => {
                const expectedStatus = 400;

                // create an editor user
                const userCreated = await global.USER_MODEL.create({
                    name: global.USER_DATA_GENERATOR.name(),
                    email: global.USER_DATA_GENERATOR.email(),
                    password: 'secret-password',
                    role: 'editor'
                });

                // generate a session token
                const editorToken = getSessionToken(userCreated.id);

                const createdTask = await request(global.SERVER_APP)
                    .post(global.CREATE_TASK_PATH)
                    .send({
                        name: global.TASKS_DATA_GENERATOR.name(),
                        description: global.TASKS_DATA_GENERATOR.description(),
                        status: global.TASKS_DATA_GENERATOR.status(),
                        priority: global.TASKS_DATA_GENERATOR.priority(),
                    })
                    .set('Authorization', `Bearer ${editorToken}`)
                    .expect(201);

                // create task using the previous task name
                await request(global.SERVER_APP)
                    .post(global.CREATE_TASK_PATH)
                    .send({
                        name: createdTask.body.name,
                        description: global.TASKS_DATA_GENERATOR.description(),
                        status: global.TASKS_DATA_GENERATOR.status(),
                        priority: global.TASKS_DATA_GENERATOR.priority(),
                    })
                    .set('Authorization', `Bearer ${editorToken}`)
                    .expect(expectedStatus);
            });
        });

    });
});