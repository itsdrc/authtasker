import request from 'supertest'
import { generateValidTokenWithId } from '../../../helpers/token/generate-valid-token-with-id';

describe('GET/', () => {
    describe('Find many by pagination', () => {
        describe('Page and limit not provided', () => {
            test('should not throw an error (200 OK)', async () => {
                const expectedStatus = 200;

                // create a user in order to use their id to generate a token                
                const userInDb = await global.USER_MODEL.create({
                    name: global.USER_DATA_GENERATOR.name(),
                    email: global.USER_DATA_GENERATOR.email(),
                    password: await global.HASHING_SERVICE.hash(global.USER_DATA_GENERATOR.password()),
                });

                const token = generateValidTokenWithId(userInDb.id);

                await request(global.SERVER_APP)
                    .get(`${global.USERS_PATH}`)
                    // queries not sent
                    .set('Authorization', `Bearer ${token}`)
                    .expect(expectedStatus);
            });
        });

        describe('Response to client', () => {
            test('user data should be as expected', async () => {
                const expectedStatus = 200;

                // create a user in order to use their id to generate a token                
                const userInDb = await global.USER_MODEL.create({
                    name: global.USER_DATA_GENERATOR.name(),
                    email: global.USER_DATA_GENERATOR.email(),
                    password: await global.HASHING_SERVICE.hash(global.USER_DATA_GENERATOR.password()),
                });

                const token = generateValidTokenWithId(userInDb.id);

                const response = await request(global.SERVER_APP)
                    .get(`${global.USERS_PATH}`)
                    .query({ page: 1, limit: 3 })
                    .set('Authorization', `Bearer ${token}`)
                    .expect(expectedStatus);

                expect((response.body as any[]).at(0)).toStrictEqual({
                    name: expect.any(String),
                    email: expect.any(String),
                    role: expect.any(String),
                    emailValidated: expect.any(Boolean),
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                    id: expect.any(String),
                })
            });
        });

        // ensures roles middlewares is applied
        describe('Token is not provided', () => {
            test('should return status 401 UNAUTHORIZED', async () => {
                const expectedStatus = 401;

                await request(global.SERVER_APP)
                    .get(`${global.USERS_PATH}`)
                    .expect(expectedStatus);
            });
        });

        describe('limit is greater than 100', () => {
            test('should return status 400 BAD REQUEST', async () => {
                const expectedStatus = 400;

                // create a user in order to use their id to generate a token                
                const userInDb = await global.USER_MODEL.create({
                    name: global.USER_DATA_GENERATOR.name(),
                    email: global.USER_DATA_GENERATOR.email(),
                    password: await global.HASHING_SERVICE.hash(global.USER_DATA_GENERATOR.password()),
                });

                const token = generateValidTokenWithId(userInDb.id);

                const invalidLimit = 101;

                await request(global.SERVER_APP)
                    .get(`${global.USERS_PATH}`)
                    .query({ limit: invalidLimit })
                    .set('Authorization', `Bearer ${token}`)
                    .expect(expectedStatus);
            });
        });

        describe('limit is less than 1', () => {
            test('should return status 400 BAD REQUEST', async () => {
                const expectedStatus = 400;

                // create a user in order to use their id to generate a token                
                const userInDb = await global.USER_MODEL.create({
                    name: global.USER_DATA_GENERATOR.name(),
                    email: global.USER_DATA_GENERATOR.email(),
                    password: await global.HASHING_SERVICE.hash(global.USER_DATA_GENERATOR.password()),
                });

                const token = generateValidTokenWithId(userInDb.id);

                // sometimes 0, sometimes -1
                const invalidLimit = -(Math.round(Math.random()));

                await request(global.SERVER_APP)
                    .get(`${global.USERS_PATH}`)
                    .query({ limit: invalidLimit })
                    .set('Authorization', `Bearer ${token}`)
                    .expect(expectedStatus);
            });
        });

        describe('page is less than 1', () => {
            test('should return status 400 BAD REQUEST', async () => {
                const expectedStatus = 400;

                // create a user in order to use their id to generate a token                
                const userInDb = await global.USER_MODEL.create({
                    name: global.USER_DATA_GENERATOR.name(),
                    email: global.USER_DATA_GENERATOR.email(),
                    password: await global.HASHING_SERVICE.hash(global.USER_DATA_GENERATOR.password()),
                });

                const token = generateValidTokenWithId(userInDb.id);

                // sometimes 0, sometimes -1
                const invalidPage = -(Math.round(Math.random()));

                await request(global.SERVER_APP)
                    .get(`${global.USERS_PATH}`)
                    .query({ page: invalidPage })
                    .set('Authorization', `Bearer ${token}`)
                    .expect(expectedStatus);
            });
        });
    });
});