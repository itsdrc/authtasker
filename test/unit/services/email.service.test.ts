import { faker } from "@faker-js/faker/.";
import { EmailService } from "@root/services/email.service";
import { TransporterOptions } from "@root/types/email/transporter-options.type";
import nodemailer from 'nodemailer';

describe('EmailService', () => {
    beforeEach(() => {
        // disable nodemailer.createTransport implementation        
        jest.spyOn(nodemailer, 'createTransport')
            .mockImplementation();
    });

    describe('SEND MAIL', () => {
        describe('constructor', () => {
            test('nodemailer.createTransport should be called with the tranporter options provided  ', async () => {
                const testTransporterOptions: TransporterOptions = {
                    host: faker.internet.domainName(),
                    port: faker.internet.port(),
                    user: faker.internet.username(),
                    pass: faker.internet.password(),
                };

                // spy nodemailer.createTransport
                const createTransportSpy = jest
                    .spyOn(nodemailer, 'createTransport');

                // call constructor with test options
                new EmailService(testTransporterOptions);

                // assert secure false and the other properties are
                // the same as the provided options to constructor.
                expect(createTransportSpy)
                    .toHaveBeenCalledWith({
                        host: testTransporterOptions.host,
                        port: testTransporterOptions.port,
                        secure: false,
                        auth: {
                            user: testTransporterOptions.user,
                            pass: testTransporterOptions.pass,
                        },
                    })
            });
        });

        test('transporter.sendMail should be called with mail options', async () => {
            const emailService = new EmailService({} as any);

            // spy for transporter.sendMail function
            const sendMailSpy = jest.fn();

            // mock private object
            (emailService['transporter'] as any) = {
                sendMail: sendMailSpy
            };

            // call method with test options
            const testOptions = { from: faker.internet.domainName() };
            emailService.sendMail(testOptions);
            
            expect(sendMailSpy)
                .toHaveBeenCalledWith(testOptions);
        });
    });
});