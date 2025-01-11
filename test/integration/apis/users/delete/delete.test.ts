import request from 'supertest'
import { Types } from 'mongoose';
import { HashingService } from "@root/services";
import { getSessionToken } from '../../../helpers/token/session.token';

describe('DELETE/', () => {
    describe('Delete user', () => {
        const hashingService = new HashingService(+process.env.BCRYPT_SALT_ROUNDS!);

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

        // ensures roles middleware is applied
        describe('Token is not provided', () => {
            test('should return 401 UNAUTHORIZED', async () => {
                const expectedStatus = 401;

                // generate a valid mongo id
                const mongoId = new Types.ObjectId();

                await request(global.SERVER_APP)
                    .delete(`${global.USERS_PATH}/${mongoId}`)
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