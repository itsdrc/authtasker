import request from 'supertest'
import { HashingService } from "@root/services";
import { generateValidTokenWithId } from '../../../helpers/token/generate-valid-token-with-id';

describe('DELETE/', () => {
    describe('Delete user', () => {
        const hashingService = new HashingService(+process.env.BCRYPT_SALT_ROUNDS!);

        describe('When a user is deleted', () => {
            test('should be removed from database', async () => {
                // create user            
                const userInDb = await global.USER_MODEL.create({
                    name: global.USER_DATA_GENERATOR.name(),
                    email: global.USER_DATA_GENERATOR.email(),
                    password: await hashingService.hash(global.USER_DATA_GENERATOR.password()),
                });

                // generate token with user id
                const token = generateValidTokenWithId(userInDb.id);

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