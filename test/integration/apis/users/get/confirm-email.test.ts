import request from 'supertest'
import { faker } from "@faker-js/faker/.";
import { JwtService } from '@root/services';
import { getEmailValidationToken } from '../../../helpers/token/email-validation.token';
import { getSessionToken } from '../../../helpers/token/session.token';

describe('GET/', () => {
    describe('Confirm email validation', () => {
        describe('Operation success', () => {
            test('should return status 200 OK', async () => {
                const expectedStatus = 200;

                const user = await global.USER_MODEL.create({
                    name: global.USER_DATA_GENERATOR.name(),
                    email: global.USER_DATA_GENERATOR.email(),
                    password: await global.HASHING_SERVICE.hash(global.USER_DATA_GENERATOR.password()),
                });

                // generate a token with user id
                const token = getEmailValidationToken(user.email);

                // confirm email validation
                await request(global.SERVER_APP)
                    .get(`${global.USERS_PATH}/confirmEmailValidation/${token}`)
                    .expect(expectedStatus);
            });

            test('user should be updated to "editor" and "emailValidated" to true', async () => {
                const user = await global.USER_MODEL.create({
                    name: global.USER_DATA_GENERATOR.name(),
                    email: global.USER_DATA_GENERATOR.email(),
                    password: await global.HASHING_SERVICE.hash(global.USER_DATA_GENERATOR.password()),
                });

                // generate a token with user id
                const token = getEmailValidationToken(user.email);

                // confirm email validation
                await request(global.SERVER_APP)
                    .get(`${global.USERS_PATH}/confirmEmailValidation/${token}`)
                    .expect(200);

                const userFoundInDb = await global.USER_MODEL
                    .findById(user.id)
                    .exec();

                expect(userFoundInDb?.role).toBe('editor');
                expect(userFoundInDb?.emailValidated).toBeTruthy();
            });
        });

        describe('Invalid token', () => {
            describe('Token not generated by this server', () => {
                test('should return status 400 BAD REQUEST', async () => {
                    const expectedStatus = 400;

                    const user = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: await global.HASHING_SERVICE.hash(global.USER_DATA_GENERATOR.password()),
                    });

                    // generate a token with a different seed but 
                    // the data refers an existing user (the previous one created)
                    const newJwtService = new JwtService(
                        faker.food.fruit(),
                    );
                    const token = newJwtService.generate('1m', { email: user.email });

                    // confirm email validation
                    await request(global.SERVER_APP)
                        .get(`${global.USERS_PATH}/confirmEmailValidation/${token}`)
                        .expect(expectedStatus);
                });
            });

            describe('Email not in token', () => {
                test('should return status 400 BAD REQUEST', async () => {
                    const expectedStatus = 400;

                    const user = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: await global.HASHING_SERVICE.hash(global.USER_DATA_GENERATOR.password()),
                    });

                    // server expects email in token not id
                    const invalidToken = getSessionToken(user.id);

                    // confirm email validation
                    await request(global.SERVER_APP)
                        .get(`${global.USERS_PATH}/confirmEmailValidation/${invalidToken}`)
                        .expect(expectedStatus);
                });
            });

            describe('user in token not found', () => {
                test('should return status 404 NOT FOUND', async () => {
                    const expectedStatus = 404;

                    // email does not match any user 
                    const token = getEmailValidationToken(`${faker.food.vegetable()}@gmail.com`);

                    // confirm email validation
                    await request(global.SERVER_APP)
                        .get(`${global.USERS_PATH}/confirmEmailValidation/${token}`)
                        .expect(expectedStatus);
                });
            });
        });
    });
});