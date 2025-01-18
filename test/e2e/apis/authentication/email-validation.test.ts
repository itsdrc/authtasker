import axios, { AxiosError } from "axios";
import { ImapFlow, MailboxLockObject } from "imapflow";
import { handleAxiosError } from "../../helpers/handlers/axios-error.handler";
import { getUrlFromEmailMessage } from "../../helpers/email/get-url-from-message.helper";

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

        test('user should become an "editor" and emailValidated should be true', async () => {
            let lock: MailboxLockObject | undefined;
            const initialRole = 'readonly';
            const finalRole = 'editor';
            const emailValidatedStatus = 200;

            try {
                // create user
                const user = {
                    name: global.DATA_GENERATOR.name(),
                    email: global.DATA_GENERATOR.email(),
                    password: global.DATA_GENERATOR.password()
                };

                const createdUserResponse = await axios.post(
                    global.REGISTER_USER_PATH,
                    user
                );

                const userToken = createdUserResponse.data.token;
                const userId = createdUserResponse.data.user.id;
                expect(createdUserResponse.data.user.role).toBe(initialRole);

                // request email validation
                await axios.post(global.EMAIL_VALIDATION_PATH, {}, {
                    headers: {
                        Authorization: `Bearer ${userToken}`
                    }
                });

                // get the link sent to user's email
                lock = await client.getMailboxLock('INBOX');
                const messages = await client.search({ to: user.email });
                const message = await client.fetchOne(`${messages.at(-1)}`, { bodyParts: ['1'] });
                const rawEmailMessage = message.bodyParts
                    .values()
                    .next()
                    .value
                    ?.toString()!;
                const confirmEmailUrl = getUrlFromEmailMessage(rawEmailMessage);

                // go to the link sent to email to finish the email validation
                const emailValidatedResponse = await axios.get(confirmEmailUrl);
                expect(emailValidatedResponse.status).toBe(emailValidatedStatus);

                // find the user, role should be "editor"
                const userFoundResponse = await axios.get(`${global.USERS_PATH}/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${userToken}`
                    }
                });

                expect(userFoundResponse.data.role).toBe(finalRole);
                expect(userFoundResponse.data.emailValidated).toBeTruthy();

                lock.release();

            } catch (error) {
                if (lock)
                    lock.release();
                handleAxiosError(error);
            }
        }, 15000);

        test('can not confirm email twice (token is blacklisted) (400 BAD REQUEST)', async () => {
            const expectedStatus = 400;
            let lock: MailboxLockObject | undefined;

            try {
                // create user
                const user = {
                    name: global.DATA_GENERATOR.name(),
                    email: global.DATA_GENERATOR.email(),
                    password: global.DATA_GENERATOR.password()
                };

                const createdUserResponse = await axios.post(
                    global.REGISTER_USER_PATH,
                    user
                );

                const userToken = createdUserResponse.data.token;
                const userId = createdUserResponse.data.user.id;

                // request email validation
                await axios.post(global.EMAIL_VALIDATION_PATH, {}, {
                    headers: {
                        Authorization: `Bearer ${userToken}`
                    }
                });

                // get the link sent to user's email
                lock = await client.getMailboxLock('INBOX');
                const messages = await client.search({ to: user.email });
                const message = await client.fetchOne(`${messages.at(-1)}`, { bodyParts: ['1'] });
                const rawEmailMessage = message.bodyParts
                    .values()
                    .next()
                    .value
                    ?.toString()!;
                const confirmEmailUrl = getUrlFromEmailMessage(rawEmailMessage);

                // go to the link sent to email to finish the email validation
                await axios.get(confirmEmailUrl);

                try {
                    // try to confirm email validation again, the same token
                    await axios.get(confirmEmailUrl);
                    expect(true).toBeFalsy();

                } catch (error) {
                    const axiosError = error as AxiosError;
                    expect(axiosError.response?.status).toBe(expectedStatus);
                }

                lock.release();

            } catch (error) {
                if (lock)
                    lock.release();
                handleAxiosError(error);
            }
        }, 15000);
    });
});