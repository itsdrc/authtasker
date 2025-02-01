import axios from "axios";
import { ImapFlow } from "imapflow";
import { handleAxiosError } from "../../helpers/handlers/axios-error.handler";
import { getEmailConfirmationFromLink } from "../../helpers/email/get-email-confirmation-link-from-email-mssg.helper";

describe('Authentication', () => {
    describe('Email validation', () => {
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

        describe('Email successfully validated', () => {
            test('user role should be editor and emailValidated should be true (200 OK)', async () => {
                try {
                    const emailValidatedStatus = 200;
                    const finalRole = 'editor';

                    // create user
                    const createdUserResponse = await axios.post(
                        global.REGISTER_USER_PATH, {
                        name: global.DATA_GENERATOR.name(),
                        email: global.DATA_GENERATOR.email(),
                        password: global.DATA_GENERATOR.password()
                    });

                    const userToken = createdUserResponse.data.token;
                    const userId = createdUserResponse.data.user.id;
                    const userEmail = createdUserResponse.data.user.email;

                    // request email validation
                    await axios.post(global.EMAIL_VALIDATION_PATH, null, {
                        headers: {
                            Authorization: `Bearer ${userToken}`
                        }
                    });

                    // get the link sent to user's email                
                    const confirmEmailUrl = await getEmailConfirmationFromLink(client, userEmail);

                    // go to the link sent to email to finish the email validation
                    const emailValidatedResponse = await axios.get(confirmEmailUrl);
                    expect(emailValidatedResponse.status).toBe(emailValidatedStatus);

                    const userFoundResponse = await axios.get(`${global.USERS_PATH}/${userId}`, {
                        headers: {
                            Authorization: `Bearer ${userToken}`
                        }
                    });

                    expect(userFoundResponse.data.role).toBe(finalRole);
                    expect(userFoundResponse.data.emailValidated).toBeTruthy();

                } catch (error) {
                    handleAxiosError(error);
                }
            }, 10000);

            test('user should be able to create tasks', async () => {
                try {
                    // create user
                    const createdUserResponse = await axios.post(
                        global.REGISTER_USER_PATH, {
                        name: global.DATA_GENERATOR.name(),
                        email: global.DATA_GENERATOR.email(),
                        password: global.DATA_GENERATOR.password()
                    });

                    const userToken = createdUserResponse.data.token;
                    const userEmail = createdUserResponse.data.user.email;

                    // request email validation
                    await axios.post(global.EMAIL_VALIDATION_PATH, null, {
                        headers: {
                            Authorization: `Bearer ${userToken}`
                        }
                    });

                    // get the link sent to user's email                
                    const confirmEmailUrl = await getEmailConfirmationFromLink(client, userEmail);

                    // go to the link sent to email to finish the email validation
                    await axios.get(confirmEmailUrl);

                    // create a task
                    await axios.post(global.CREATE_TASK_PATH, {
                        name: global.TASKS_DATA_GENERATOR.name(),
                        description: global.TASKS_DATA_GENERATOR.description(),
                        status: global.TASKS_DATA_GENERATOR.status(),
                        priority: global.TASKS_DATA_GENERATOR.priority()
                    }, {
                        headers: {
                            Authorization: `Bearer ${global.ADMIN_TOKEN}`
                        }
                    });

                } catch (error) {
                    handleAxiosError(error);
                }
            }, 10000);

            test('email can not be confirmed twice using the same token (400 BAD REQUEST)', async () => {
                try {
                    const expectedStatus = 400;
                    const createdUserResponse = await axios.post(
                        global.REGISTER_USER_PATH, {
                        name: global.DATA_GENERATOR.name(),
                        email: global.DATA_GENERATOR.email(),
                        password: global.DATA_GENERATOR.password()
                    });

                    const userToken = createdUserResponse.data.token;
                    const userEmail = createdUserResponse.data.user.email;

                    // request email validation
                    await axios.post(global.EMAIL_VALIDATION_PATH, null, {
                        headers: {
                            Authorization: `Bearer ${userToken}`
                        }
                    });

                    // get the link sent to user's email                
                    const confirmEmailUrl = await getEmailConfirmationFromLink(client, userEmail);

                    // go to the link sent to email to finish the email validation
                    await axios.get(confirmEmailUrl);

                    try {
                        // try to confirm email validation again using the same token
                        await axios.get(confirmEmailUrl);
                        expect(true).toBeFalsy();

                    } catch (error: any) {
                        expect(error.response?.status).toBe(expectedStatus);
                        expect((error.response?.data as any).error).toBe('Invalid token');
                    }

                } catch (error) {
                    handleAxiosError(error);
                }
            }, 10000);
        });
    });
});