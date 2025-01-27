import axios from "axios";
import { handleAxiosError } from "../../helpers/handlers/axios-error.handler";

describe('Find by id', () => {
    describe('Response to client', () => {
        test('should contain user data (200 OK)', async () => {
            try {
                const expectedStatus = 200;

                // create user
                const created = await axios.post(
                    global.REGISTER_USER_PATH,
                    {
                        name: global.DATA_GENERATOR.name(),
                        email: global.DATA_GENERATOR.email(),
                        password: global.DATA_GENERATOR.password()
                    }
                );

                const createdUserData = created.data.user;

                const userID = created.data.user.id;
                const userToken = created.data.token;

                // find
                const userFound = await axios.get(
                    `${global.USERS_PATH}/${userID}`, {
                    headers: {
                        Authorization: `Bearer ${userToken}`
                    }
                });

                expect(userFound.status).toBe(expectedStatus);
                expect(userFound.data).toStrictEqual({
                    name: createdUserData.name,
                    email: createdUserData.email,
                    role: 'readonly',
                    emailValidated: false,
                    id: expect.any(String),
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                });

            } catch (error) {
                handleAxiosError(error);
            }
        });
    });
});