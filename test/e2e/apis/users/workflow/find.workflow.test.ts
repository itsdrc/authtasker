import axios from "axios";
import { handleAxiosError } from "../../../helpers/handlers/axios-error.handler";

describe('Workflow', () => {
    describe('Find by id', () => {
        describe('When a user is found', () => {
            test('should contain the correct data', async () => {
                try {                    
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
});