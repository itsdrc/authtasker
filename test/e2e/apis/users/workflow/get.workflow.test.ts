import axios from "axios";
import { handleAxiosError } from "../../../helpers/handlers/axios-error.handler";

describe('Users - GET/ Workflow', () => {
    describe('Find by id', () => {
        test('get the right user (200 OK)', async () => {
            try {
                const expectedStatus = 200;
                const userData = {
                    name: global.DATA_GENERATOR.name(),
                    email: global.DATA_GENERATOR.email(),
                    password: global.DATA_GENERATOR.password()
                };

                // create user
                const created = await axios.post(
                    global.REGISTER_USER_PATH,
                    userData
                );

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
                expect(userFound.data).toMatchObject({
                    name: userData.name.toLowerCase(),
                    email: userData.email
                });

            } catch (error) {
                handleAxiosError(error);
            }
        });
    });
});