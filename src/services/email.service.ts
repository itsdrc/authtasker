import nodemailer, { SendMailOptions, Transporter } from 'nodemailer';
import { ITransporter } from '../interfaces/email/transporter.interface';

export class EmailService {

    private transporter: Transporter;

    constructor(transporterOptions: ITransporter) {
        this.transporter = nodemailer.createTransport({
            host: transporterOptions.host,
            port: transporterOptions.port,
            secure: transporterOptions.port === 465,
            auth: {
                user: transporterOptions.user,
                pass: transporterOptions.pass,
            },
        });
    }

    async sendMail(options: SendMailOptions): Promise<void> {
        await this.transporter.sendMail(options);
    }
}