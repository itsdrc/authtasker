import { EmailService } from "../../services/email.service";
import { TransporterOptions } from "../../types/email/transporter-options.type";
import nodemailer from "nodemailer";

describe('EmailService', () => {
    const transporterOptions: TransporterOptions = {
        host: 'testhost',
        port: 3000,
        user: 'me',
        pass: '123',
    };
    const emailService = new EmailService(transporterOptions);
    let sendMailMock: jest.SpyInstance;

    beforeEach(()=> {
        sendMailMock = jest.spyOn(emailService['transporter'],'sendMail')
        .mockImplementation(()=> Promise.resolve())        
    });

    describe('constructor', () => {
        test('nodemailer.createTransport should be called with the options', () => {
            const createTransportSpy = jest.spyOn(nodemailer, 'createTransport');
            new EmailService(transporterOptions);
            expect(createTransportSpy).toHaveBeenCalledWith({
                host: transporterOptions.host,
                port: transporterOptions.port,
                secure: false,
                auth: {
                    user: transporterOptions.user,
                    pass: transporterOptions.pass,
                },
            });
        });
    });

    describe('sendMail', () => {
        test('nodemailer.sendMail should be called with the options', async () => {
            const sendMailOptions: nodemailer.SendMailOptions = { to: 'foo' };
            await emailService.sendMail(sendMailOptions)
            expect(sendMailMock).toHaveBeenCalledWith(sendMailOptions);
        });
    });
});