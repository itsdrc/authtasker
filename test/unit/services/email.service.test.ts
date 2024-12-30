import { ITransporter } from "@root/interfaces/email/transporter.interface";
import { EmailService } from "@root/services";
import nodemailer, { SendMailOptions } from "nodemailer";

describe('Email Service', () => {
    test('nodemailer transporter should be called with the provided options', async () => {
        const transporterOptions: ITransporter = {
            host: 'localhost',
            port: 5379,
            user: 'test-user',
            pass: 'test-password'
        }
        const nodemailerCreateTransportSpy = jest.spyOn(nodemailer, 'createTransport')
            .mockImplementation();

        new EmailService(transporterOptions);

        expect(nodemailerCreateTransportSpy).toHaveBeenCalledWith({
            host: transporterOptions.host,
            port: transporterOptions.port,
            secure: transporterOptions.port === 465,
            auth: {
                user: transporterOptions.user,
                pass: transporterOptions.pass,
            },
        });
    });

    test('transporter.sendMail should be called with the provided options', async () => {
        const transporterOptions: ITransporter = {
            host: 'localhost',
            port: 5379,
            user: 'test-user',
            pass: 'test-password'
        }

        const mailOptions: SendMailOptions = {
            to: 'test-email@gmail.com',
            subject: 'Hello World',
            html: `<h1>Hello-World</h1>`
        };

        const emailService = new EmailService(transporterOptions);
        const transporterSendMailSpy = jest.spyOn(emailService['transporter'], 'sendMail')
            .mockImplementation();

        emailService.sendMail(mailOptions);

        expect(transporterSendMailSpy)
            .toHaveBeenCalledWith(mailOptions);
    });
});