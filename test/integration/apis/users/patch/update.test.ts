import { HashingService } from "@root/services";
import request from 'supertest'
import { generateValidTokenWithId } from "../../../helpers/token/generate-valid-token-with-id";
import { Types } from "mongoose";

describe('PATCH/', () => {
    describe('Update user', () => {
        const hashingService = new HashingService(+process.env.BCRYPT_SALT_ROUNDS!);

        describe('No new property is provided', () => {
            test('should causes 400 BAD REQUEST', async () => {
                const expectedStatus = 400;

                // create user
                const userInDb = await global.USER_MODEL.create({
                    name: global.USER_DATA_GENERATOR.name(),
                    email: global.USER_DATA_GENERATOR.email(),
                    password: await hashingService.hash(global.USER_DATA_GENERATOR.password()),
                });

                // generate a token with user id
                const validToken = generateValidTokenWithId(userInDb.id);

                const response = await request(global.SERVER_APP)
                    .patch(`${global.USERS_PATH}/${userInDb.id}`)
                    // no new properties sent                    
                    .set('Authorization', `Bearer ${validToken}`)
                    .expect(expectedStatus);
            });
        });

        // ensures that validation class is applied
        describe('Password is not valid', () => {
            test('should causes 400 BAD REQUEST', async () => {
                const expectedStatus = 400;

                // create user
                const userInDb = await global.USER_MODEL.create({
                    name: global.USER_DATA_GENERATOR.name(),
                    email: global.USER_DATA_GENERATOR.email(),
                    password: await hashingService.hash(global.USER_DATA_GENERATOR.password()),
                });

                // generate a token with user id
                const validToken = generateValidTokenWithId(userInDb.id);

                const response = await request(global.SERVER_APP)
                    .patch(`${global.USERS_PATH}/${userInDb.id}`)
                    .send({ password: '12' }) // length not valid
                    .set('Authorization', `Bearer ${validToken}`)
                    .expect(expectedStatus);

                expect((response.body.error as string).includes('password'))
                    .toBeTruthy();
            });
        });

        // ensures that roles middleware is applied
        describe('No token provided', () => {
            test('should causes 401 UNAUTHORIZED', async () => {
                // generate a valid mongo id
                const id = new Types.ObjectId();
                const expectedStatus = 401;

                const response = await request(global.SERVER_APP)
                    .patch(`${global.USERS_PATH}/${id}`)
                    .send({ name: '...' })
                    // no token sent
                    .expect(expectedStatus);
            });
        });

        describe('Name is updated', () => {
            test('should be transformed to lowercase when saved in db', async () => {
                // create user
                const userInDb = await global.USER_MODEL.create({
                    name: global.USER_DATA_GENERATOR.name(),
                    email: global.USER_DATA_GENERATOR.email(),
                    password: await hashingService.hash(global.USER_DATA_GENERATOR.password()),
                });

                // name is transformed to lowercase
                const newName = global.USER_DATA_GENERATOR.name();
                const expectedNameInDatabase = newName.toLowerCase();

                // generate a token with user id
                const validToken = generateValidTokenWithId(userInDb.id);

                // update
                await request(global.SERVER_APP)
                    .patch(`${global.USERS_PATH}/${userInDb.id}`)
                    .send({ name: newName })
                    .set('Authorization', `Bearer ${validToken}`)
                    .expect(200);

                // find user in database
                const userUpdatedInDb = await global.USER_MODEL
                    .findById(userInDb.id)
                    .exec();

                expect(userUpdatedInDb?.name).toBe(expectedNameInDatabase);
            });
        });

        describe('Password is updated', () => {
            test('should be hashed', async () => {
                // create user
                const userInDb = await global.USER_MODEL.create({
                    name: global.USER_DATA_GENERATOR.name(),
                    email: global.USER_DATA_GENERATOR.email(),
                    password: await hashingService.hash(global.USER_DATA_GENERATOR.password()),
                });

                const newPassword = global.USER_DATA_GENERATOR.password();

                // generate a token with user id
                const validToken = generateValidTokenWithId(userInDb.id);

                // update
                await request(global.SERVER_APP)
                    .patch(`${global.USERS_PATH}/${userInDb.id}`)
                    .send({ password: newPassword })
                    .set('Authorization', `Bearer ${validToken}`)
                    .expect(200);

                // find user in database
                const userUpdatedInDb = await global.USER_MODEL
                    .findById(userInDb.id)
                    .exec();

                const samePassword = hashingService.compare(
                    newPassword,
                    userUpdatedInDb!.password
                );
                expect(samePassword).toBeTruthy();
            });
        });

        describe('Email is updated', () => {
            describe('email is validated (role is editor)', () => {
                test('should be updated to false and role updated to "readonly"', async () => {
                    // create user and set emailValidated to true
                    const userInDb = await global.USER_MODEL.create({
                        name: global.USER_DATA_GENERATOR.name(),
                        email: global.USER_DATA_GENERATOR.email(),
                        password: await hashingService.hash(global.USER_DATA_GENERATOR.password()),
                    });
                    userInDb.emailValidated = true;
                    userInDb.role = 'editor';
                    await userInDb.save();

                    const newEmail = global.USER_DATA_GENERATOR.email();

                    // generate a token with user id
                    const validToken = generateValidTokenWithId(userInDb.id);

                    // update
                    await request(global.SERVER_APP)
                        .patch(`${global.USERS_PATH}/${userInDb.id}`)
                        .send({ email: newEmail })
                        .set('Authorization', `Bearer ${validToken}`)
                        .expect(200);

                    // find user in database
                    const userUpdatedInDb = await global.USER_MODEL
                        .findById(userInDb.id)
                        .exec();

                    expect(userUpdatedInDb?.emailValidated).toBeFalsy();
                    expect(userUpdatedInDb?.role).toBe('readonly');
                });
            });
        });
    });
});