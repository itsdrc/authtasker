import request from 'supertest'
import { Types } from 'mongoose';
import { HashingService } from "@root/services";
import { getSessionToken } from '../../helpers/token/session.token';

describe('DELETE/', () => {
    describe('Delete user', () => {
        const hashingService = new HashingService(+process.env.BCRYPT_SALT_ROUNDS!);

        describe('Authentication/Authorization', () => {
            describe('Token is not provided', () => {
                test('should not be able to access this feature (401 UNAUTHORIZED)', async () => {
                    const expectedStatus = 401;

                    // generate a valid mongo id
                    const mongoId = new Types.ObjectId();

                    await request(global.SERVER_APP)
                        .delete(`${global.USERS_PATH}/${mongoId}`)
                        .expect(expectedStatus);
                });
            });

            describe('User role is readonly', () => {
                test('should be able to delete their own account (204 NO CONTENT)', async () => {
                    const expectedStatus = 204;

                    // create a readonly user
                    const readonlyUser = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: await global.HASHING_SERVICE.hash(global.USER_DATA_GENERATOR.password()),
                        role: 'readonly'
                    });

                    const userId = readonlyUser.id;
                    const token = getSessionToken(userId);

                    await request(global.SERVER_APP)
                        .delete(`${global.USERS_PATH}/${userId}`)
                        .set('Authorization', `Bearer ${token}`)
                        .expect(expectedStatus);
                });

                test('should not be able to delete another readonly user (403 FORBIDDEN)', async () => {
                    const expectedStatus = 403;

                    // create a readonly user
                    const readonlyUser = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: await global.HASHING_SERVICE.hash(global.USER_DATA_GENERATOR.password()),
                        role: 'readonly'
                    });

                    const readonlyUserToken = getSessionToken(readonlyUser.id);

                    // create another readonly user
                    const anotherReadonlyUser = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: await global.HASHING_SERVICE.hash(global.USER_DATA_GENERATOR.password()),
                        role: 'readonly'
                    });

                    const anotherReadonlyUserId = anotherReadonlyUser.id;

                    // attemp to delete the other readonly user
                    await request(global.SERVER_APP)
                        .delete(`${global.USERS_PATH}/${anotherReadonlyUserId}`)
                        .set('Authorization', `Bearer ${readonlyUserToken}`)
                        .expect(expectedStatus);
                });

                test('should not be able to delete an editor user (403 FORBIDDEN)', async () => {
                    const expectedStatus = 403;

                    // create a readonly user
                    const readonlyUser = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: await global.HASHING_SERVICE.hash(global.USER_DATA_GENERATOR.password()),
                        role: 'readonly'
                    });

                    const readonlyUserToken = getSessionToken(readonlyUser.id);

                    // create an editor user
                    const editorUser = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: await global.HASHING_SERVICE.hash(global.USER_DATA_GENERATOR.password()),
                        role: 'editor'
                    });

                    const editorUserId = editorUser.id;

                    // attemp to delete the editor using the readonly user token
                    await request(global.SERVER_APP)
                        .delete(`${global.USERS_PATH}/${editorUserId}`)
                        .set('Authorization', `Bearer ${readonlyUserToken}`)
                        .expect(expectedStatus);
                });

                test('should not be able to delete an administrator (403 FORBIDDEN)', async () => {
                    const expectedStatus = 403;

                    // create a readonly user
                    const readonlyUser = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: await global.HASHING_SERVICE.hash(global.USER_DATA_GENERATOR.password()),
                        role: 'readonly'
                    });

                    const readonlyUserToken = getSessionToken(readonlyUser.id);

                    // create an administrator user
                    const adminUser = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: await global.HASHING_SERVICE.hash(global.USER_DATA_GENERATOR.password()),
                        role: 'admin'
                    });

                    const adminUserId = adminUser.id;

                    // attemp to delete the administrator using the readonly user token
                    await request(global.SERVER_APP)
                        .delete(`${global.USERS_PATH}/${adminUserId}`)
                        .set('Authorization', `Bearer ${readonlyUserToken}`)
                        .expect(expectedStatus);
                });
            });

            describe('User role is editor', () => {
                test('should be able to delete their own account (204 NO CONTENT)', async () => {
                    const expectedStatus = 204;

                    // create an editor user
                    const editorUser = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: await global.HASHING_SERVICE.hash(global.USER_DATA_GENERATOR.password()),
                        role: 'editor'
                    });

                    const userId = editorUser.id;
                    const token = getSessionToken(userId);

                    await request(global.SERVER_APP)
                        .delete(`${global.USERS_PATH}/${userId}`)
                        .set('Authorization', `Bearer ${token}`)
                        .expect(expectedStatus);
                });

                test('should not be able to delete a readonly user (403 FORBIDDEN)', async () => {
                    const expectedStatus = 403;

                    // create an editor user
                    const editorUser = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: await global.HASHING_SERVICE.hash(global.USER_DATA_GENERATOR.password()),
                        role: 'editor'
                    });

                    const editorToken = getSessionToken(editorUser.id);

                    // create a readonly user
                    const readonlyUser = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: await global.HASHING_SERVICE.hash(global.USER_DATA_GENERATOR.password()),
                        role: 'readonly'
                    });

                    const readonlyUserId = readonlyUser.id; 

                    await request(global.SERVER_APP)
                        .delete(`${global.USERS_PATH}/${readonlyUserId}`)
                        .set('Authorization', `Bearer ${editorToken}`)
                        .expect(expectedStatus);
                });

                test('should not be able to delete another editor user (403 FORBIDDEN)', async () => {
                    const expectedStatus = 403;

                    // create an editor user
                    const editorUser = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: await global.HASHING_SERVICE.hash(global.USER_DATA_GENERATOR.password()),
                        role: 'editor'
                    });

                    const editorToken = getSessionToken(editorUser.id);

                    // create another editor
                    const anotherEditor = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: await global.HASHING_SERVICE.hash(global.USER_DATA_GENERATOR.password()),
                        role: 'editor'
                    });

                    const anotherEditorId = anotherEditor.id;

                    await request(global.SERVER_APP)
                        .delete(`${global.USERS_PATH}/${anotherEditorId}`)
                        .set('Authorization', `Bearer ${editorToken}`)
                        .expect(expectedStatus);
                });

                test('should not be able to delete an administrator (403 FORBIDDEN)', async () => {
                    const expectedStatus = 403;

                    // create an editor user
                    const editorUser = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: await global.HASHING_SERVICE.hash(global.USER_DATA_GENERATOR.password()),
                        role: 'editor'
                    });

                    const editorToken = getSessionToken(editorUser.id);

                    // create an administrator
                    const adminUser = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: await global.HASHING_SERVICE.hash(global.USER_DATA_GENERATOR.password()),
                        role: 'admin'
                    });

                    const adminUserId = adminUser.id;

                    await request(global.SERVER_APP)
                        .delete(`${global.USERS_PATH}/${adminUserId}`)
                        .set('Authorization', `Bearer ${editorToken}`)
                        .expect(expectedStatus);
                });
            });

            describe('User role is administrator', () => {
                test('should be able to delete a readonly user (204 NO CONTENT)', async () => {
                    const expectedStatus = 204;

                    // create an administrator user
                    const adminUser = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: await global.HASHING_SERVICE.hash(global.USER_DATA_GENERATOR.password()),
                        role: 'admin'
                    });

                    const adminToken = getSessionToken(adminUser.id);

                    // create a readonly user
                    const readonlyUser = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: await global.HASHING_SERVICE.hash(global.USER_DATA_GENERATOR.password()),
                        role: 'readonly'
                    });

                    const readonlyUserId = readonlyUser.id;

                    await request(global.SERVER_APP)
                        .delete(`${global.USERS_PATH}/${readonlyUserId}`)
                        .set('Authorization', `Bearer ${adminToken}`)
                        .expect(expectedStatus);
                });

                test('should be able to delete an editor (204 NO CONTENT)', async () => {
                    const expectedStatus = 204;

                    // create an administrator user
                    const adminUser = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: await global.HASHING_SERVICE.hash(global.USER_DATA_GENERATOR.password()),
                        role: 'admin'
                    });

                    const adminToken = getSessionToken(adminUser.id);

                    // create an editor user
                    const editorUser = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: await global.HASHING_SERVICE.hash(global.USER_DATA_GENERATOR.password()),
                        role: 'editor'
                    });

                    const editorUserId = editorUser.id;

                    await request(global.SERVER_APP)
                        .delete(`${global.USERS_PATH}/${editorUserId}`)
                        .set('Authorization', `Bearer ${adminToken}`)
                        .expect(expectedStatus);
                });

                test('should be able to delete their own account (204 NO CONTENT)', async () => {
                    const expectedStatus = 204;

                    // create an administrator user
                    const adminUser = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: await global.HASHING_SERVICE.hash(global.USER_DATA_GENERATOR.password()),
                        role: 'admin'
                    });

                    const adminUserId = adminUser.id;
                    const adminToken = getSessionToken(adminUserId);

                    await request(global.SERVER_APP)
                        .delete(`${global.USERS_PATH}/${adminUserId}`)
                        .set('Authorization', `Bearer ${adminToken}`)
                        .expect(expectedStatus);
                });

                test('should not be able to delete another administrator (403 FORBIDDEN)', async () => {
                    const expectedStatus = 403;

                    // create an administrator user
                    const adminUser = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: await global.HASHING_SERVICE.hash(global.USER_DATA_GENERATOR.password()),
                        role: 'admin'
                    });

                    const adminToken = getSessionToken(adminUser.id);

                    // create another administrator
                    const anotherAdminUser = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: await global.HASHING_SERVICE.hash(global.USER_DATA_GENERATOR.password()),
                        role: 'admin'
                    });

                    const anotherAdminUserId = anotherAdminUser.id;

                    await request(global.SERVER_APP)
                        .delete(`${global.USERS_PATH}/${anotherAdminUserId}`)
                        .set('Authorization', `Bearer ${adminToken}`)
                        .expect(expectedStatus);
                });
            });
        });

        describe('User is not found', () => {
            test('should return status 404 NOT FOUND', async () => {
                const expectedStatus = 404;

                // create user to provide Bearer token
                const userInDb = await global.USER_MODEL.create({
                    name: global.USER_DATA_GENERATOR.name(),
                    email: global.USER_DATA_GENERATOR.email(),
                    password: await hashingService.hash(global.USER_DATA_GENERATOR.password()),
                });

                // generate token with user id
                const token = getSessionToken(userInDb.id);

                // generate a valid mongo id
                const mongoId = new Types.ObjectId();

                await request(global.SERVER_APP)
                    .delete(`${global.USERS_PATH}/${mongoId}`)
                    .set('Authorization', `Bearer ${token}`)
                    .expect(expectedStatus);
            });
        });

        describe('Provided id is not valid', () => {
            test('should return status 404 NOT FOUND', async () => {
                const expectedStatus = 404;

                // create user to provide Bearer token
                const userInDb = await global.USER_MODEL.create({
                    name: global.USER_DATA_GENERATOR.name(),
                    email: global.USER_DATA_GENERATOR.email(),
                    password: await hashingService.hash(global.USER_DATA_GENERATOR.password()),
                });

                // generate token with user id
                const token = getSessionToken(userInDb.id);

                const invalidMongoId = 123;

                await request(global.SERVER_APP)
                    .delete(`${global.USERS_PATH}/${invalidMongoId}`)
                    .set('Authorization', `Bearer ${token}`)
                    .expect(expectedStatus);
            });
        });

        describe('User is successfully deleted', () => {
            test('should be removed from database', async () => {
                // create user            
                const userInDb = await global.USER_MODEL.create({
                    name: global.USER_DATA_GENERATOR.name(),
                    email: global.USER_DATA_GENERATOR.email(),
                    password: await hashingService.hash(global.USER_DATA_GENERATOR.password()),
                });

                // generate token with user id
                const token = getSessionToken(userInDb.id);

                await request(global.SERVER_APP)
                    .delete(`${global.USERS_PATH}/${userInDb.id}`)
                    .set('Authorization', `Bearer ${token}`)
                    .expect(204);

                const userFound = await global.USER_MODEL
                    .findById(userInDb.id)
                    .exec();

                expect(userFound).toBeNull();
            });
        });
    });
});