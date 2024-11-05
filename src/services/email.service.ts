import nodemailer, { SendMailOptions, Transporter } from 'nodemailer';
import { TransporterOptions } from '../types/email/transporter-options.type';

export class EmailService {

    private transporter: Transporter;

    constructor(transporterOptions: TransporterOptions) {
        this.transporter = nodemailer.createTransport({
            host: transporterOptions.host,
            port: transporterOptions.port,
            secure: false,
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