import axios from "axios";
import { ImapFlow } from "imapflow";
import { handleAxiosError } from "../../helpers/handlers/axios-error.handler";
import { getEmailConfirmationFromLink } from "../../helpers/email/get-email-confirmation-link-from-email-mssg.helper";

describe('Delete user', () => {
    describe('User successfully deleted', () => {
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

        test('should not be found anymore (404 NOT FOUND)', async () => {
            try {
                const expectedStatus = 404;

                // create user
                const created = await axios.post(global.REGISTER_USER_PATH, {
                    name: global.DATA_GENERATOR.name(),
                    email: global.DATA_GENERATOR.email(),
                    password: global.DATA_GENERATOR.password()
                });

                const userId = created.data.user.id;

                // delete
                await axios.delete(`${global.USERS_PATH}/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${global.ADMIN_TOKEN}`
                    }
                });

                try {
                    // find by id
                    await axios.get(`${global.USERS_PATH}/${userId}`, {
                        headers: {
                            Authorization: `Bearer ${global.ADMIN_TOKEN}`
                        }
                    });

                    expect(true).toBeFalsy();

                } catch (error: any) {
                    expect(error.status).toBe(expectedStatus);
                    expect(error.response?.data.error)
                        .toBe(`User with id ${userId} not found`)
                }

            } catch (error) {
                handleAxiosError(error);
            }
        });

        test('tasks associated to user should be also deleted', async () => {
            try {
                // create user                
                const userCreated = await axios.post(global.REGISTER_USER_PATH, {
                    name: global.DATA_GENERATOR.name(),
                    email: global.DATA_GENERATOR.email(),
                    password: global.DATA_GENERATOR.password()
                });

                const userSessionToken = userCreated.data.token;
                const userId = userCreated.data.user.id;
                const userEmail = userCreated.data.user.email;

                // request email validation
                await axios.post(global.EMAIL_VALIDATION_PATH, null, {
                    headers: {
                        Authorization: `Bearer ${userSessionToken}`
                    }
                });

                // get the link sent to user's email                
                const confirmEmailUrl = await getEmailConfirmationFromLink(client, userEmail);

                // go to the link sent to email to finish the email validation
                await axios.get(confirmEmailUrl);

                // create a task                
                const createdTask = await axios.post(
                    global.CREATE_TASK_PATH, {
                    name: global.TASKS_DATA_GENERATOR.name(),
                    description: global.TASKS_DATA_GENERATOR.description(),
                    status: global.TASKS_DATA_GENERATOR.status(),
                    priority: global.TASKS_DATA_GENERATOR.priority()
                }, {
                    headers: {
                        Authorization: `Bearer ${userSessionToken}`
                    }
                });

                const taskId = createdTask.data.id;

                // delete user
                await axios.delete(`${global.USERS_PATH}/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${userSessionToken}`
                    }
                });

                try {
                    // expect task is not found
                    await axios.get(`${global.TASKS_PATH}/${taskId}`, {
                        headers: {
                            Authorization: `Bearer ${global.ADMIN_TOKEN}`
                        }
                    });

                    expect(true).toBeFalsy();

                } catch (error: any) {
                    expect(error.response.status).toBe(404);
                    expect(error.response.data.error)
                        .toBe(`Task with id ${taskId} not found`)
                }

            } catch (error) {
                handleAxiosError(error);
            }
        });
    });
});