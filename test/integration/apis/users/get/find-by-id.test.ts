import request from 'supertest'
import { Types } from 'mongoose';
import { getSessionToken } from '../../../helpers/token/session.token';

describe('GET/', () => {    
    describe('Find by id', () => {
        describe('User is found', () => {
            test('should return: right user, right data and 200 OK', async () => {
                const expectedStatus = 200;

                // create a user
                const userInDb = await global.USER_MODEL.create({
                    name: global.USER_DATA_GENERATOR.name(),
                    email: global.USER_DATA_GENERATOR.email(),
                    password: await global.HASHING_SERVICE.hash(global.USER_DATA_GENERATOR.password()),
                });

                // generate a token with user id 
                const token = getSessionToken(userInDb.id);

                const response = await request(global.SERVER_APP)
                    .get(`${global.USERS_PATH}/${userInDb.id}`)
                    .set('Authorization', `Bearer ${token}`)
                    .expect(expectedStatus);

                expect(response.body).toStrictEqual({
                    name: userInDb.name,
                    email: userInDb.email,
                    role: userInDb.role,
                    emailValidated: userInDb.emailValidated,
                    createdAt: userInDb.createdAt.toISOString(),
                    updatedAt: userInDb.updatedAt.toISOString(),
                    id: userInDb.id,
                });
            });
        });

        // ensures roles middlewares is applied
        describe('Token not provided', () => {
            test('return status 401 UNAUTHORIZED', async () => {
                const expectedStatus = 401;
                const anyID = 123;

                await request(global.SERVER_APP)
                    .get(`${global.USERS_PATH}/${anyID}`)
                    .expect(expectedStatus);
            });
        });

        describe('Id is not valid', () => {
            test('return status 404 NOT FOUND', async () => {
                const expectedStatus = 404;

                // create a user in order to use their id to generate a token                
                const userInDb = await global.USER_MODEL.create({
                    name: global.USER_DATA_GENERATOR.name(),
                    email: global.USER_DATA_GENERATOR.email(),
                    password: await global.HASHING_SERVICE.hash(global.USER_DATA_GENERATOR.password()),
                });
                const token = getSessionToken(userInDb.id);

                const invalidMongoId = 123;

                await request(global.SERVER_APP)
                    .get(`${global.USERS_PATH}/${invalidMongoId}`)
                    .set('Authorization', `Bearer ${token}`)
                    .expect(expectedStatus);
            });
        });

        describe('User is not found', () => {
            test('return status 404 NOT FOUND', async () => {
                const expectedStatus = 404;

                // create a user in order to use their id to generate a token                
                const userInDb = await global.USER_MODEL.create({
                    name: global.USER_DATA_GENERATOR.name(),
                    email: global.USER_DATA_GENERATOR.email(),
                    password: await global.HASHING_SERVICE.hash(global.USER_DATA_GENERATOR.password()),
                });
                const token = getSessionToken(userInDb.id);

                const validMongoId = new Types.ObjectId();

                await request(global.SERVER_APP)
                    .get(`${global.USERS_PATH}/${validMongoId}`)
                    .set('Authorization', `Bearer ${token}`)
                    .expect(expectedStatus);
            });
        });
    });
});