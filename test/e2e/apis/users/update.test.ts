import axios from "axios";
import { ImapFlow } from "imapflow";
import { handleAxiosError } from "../../helpers/handlers/axios-error.handler";
import { getEmailConfirmationFromLink } from "../../helpers/email/get-email-confirmation-link-from-email-mssg.helper";

describe('Update user', () => {
    describe('User successfully updated', () => {
        let client: ImapFlow;

        beforeAll(async () => {
            client = new ImapFlow({
                logger: false,
                connectionTimeout: 10000,
                host: 'imap.ethereal.email',
                port: 993,
                secure: true,
                auth: {
                    user: process.env.MAIL_SERVICE_USER!,
                    pass: process.env.MAIL_SERVICE_PASS!,
                }
            });

            await client.connect();
        }, 11000);

        afterAll(async () => {
            await client.logout();
        });

        // close the inbox in order to refresh it the next time is opened
        afterEach(async () => {
            await client.mailboxClose();
        });

        test('data should be updated when user is found', async () => {
            try {
                // create user            
                const created = await axios.post(global.REGISTER_USER_PATH, {
                    name: global.DATA_GENERATOR.name(),
                    email: global.DATA_GENERATOR.email(),
                    password: global.DATA_GENERATOR.password()
                });

                const userId = created.data.user.id;
                const userToken = created.data.token

                // update
                const userNewData = {
                    name: global.DATA_GENERATOR.name(),
                    email: global.DATA_GENERATOR.email(),
                };

                await axios.patch(`${global.USERS_PATH}/${userId}`,
                    userNewData, {
                    headers: {
                        Authorization: `Bearer ${userToken}`
                    }
                });

                // find by id
                const response = await axios.get(`${global.USERS_PATH}/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${userToken}`
                    }
                });

                expect(response.data).toMatchObject({
                    name: userNewData.name.toLowerCase(),
                    email: userNewData.email,
                });

            } catch (error) {
                handleAxiosError(error);
            }
        });

        test('user should be able to log in with the updated data', async () => {
            try {
                const expectedStatus = 200;

                // create user            
                const created = await axios.post(global.REGISTER_USER_PATH, {
                    name: global.DATA_GENERATOR.name(),
                    email: global.DATA_GENERATOR.email(),
                    password: global.DATA_GENERATOR.password()
                });

                const userId = created.data.user.id;
                const userToken = created.data.token

                // update
                const userNewData = {
                    name: global.DATA_GENERATOR.name(),
                    email: global.DATA_GENERATOR.email(),
                    password: global.DATA_GENERATOR.password(),
                };

                await axios.patch(`${global.USERS_PATH}/${userId}`,
                    userNewData, {
                    headers: {
                        Authorization: `Bearer ${userToken}`
                    }
                });

                // login
                const response = await axios.post(global.LOGIN_USER_PATH, {
                    email: userNewData.email,
                    password: userNewData.password
                });

                expect(response.status).toBe(expectedStatus);

            } catch (error) {
                handleAxiosError(error);
            }
        });

        describe('Editor user update his email', () => {
            test('should not be able to create a task because role was downgraded', async () => {
                try {
                    // create a user (readonly by default)
                    const userCreated = await axios.post(global.REGISTER_USER_PATH, {
                        name: global.DATA_GENERATOR.name(),
                        email: global.DATA_GENERATOR.email(),
                        password: global.DATA_GENERATOR.password()
                    });

                    const sessionToken = userCreated.data.token;
                    const userEmail = userCreated.data.user.email;
                    const userId = userCreated.data.user.id;

                    // request email validation in order to upgrade to editor
                    await axios.post(global.EMAIL_VALIDATION_PATH, null, {
                        headers: {
                            Authorization: `Bearer ${sessionToken}`
                        }
                    });

                    // confirm email validation
                    const confirmEmailUrl = await getEmailConfirmationFromLink(client, userEmail);
                    await axios.get(confirmEmailUrl);

                    // At this point, the user is an editor.
                    // Update the email.
                    await axios.patch(`${global.USERS_PATH}/${userId}`,
                        { email: global.DATA_GENERATOR.email(), }, {
                        headers: {
                            Authorization: `Bearer ${sessionToken}`
                        }
                    });

                    // attempt to create a task
                    try {
                        await axios.post(global.CREATE_TASK_PATH, {
                            name: global.TASKS_DATA_GENERATOR.name(),
                            description: global.TASKS_DATA_GENERATOR.description(),
                            status: global.TASKS_DATA_GENERATOR.status(),
                            priority: global.TASKS_DATA_GENERATOR.priority(),
                        }, {
                            headers: {
                                Authorization: `Bearer ${sessionToken}`
                            }
                        });

                    } catch (error: any) {
                        expect(error.response.status).toBe(403);
                    }

                } catch (error) {
                    handleAxiosError(error);
                }
            });
        });
    });
});