import { ImapFlow, MailboxLockObject } from "imapflow";
import * as quotedPrintable from 'quoted-printable'
import * as cheerio from 'cheerio';

// get email confirmation link from ethereal inbox using imapflow
export const getEmailConfirmationFromLink = async (client: ImapFlow, userEmail: string) => {
    let lock: MailboxLockObject | undefined;
    try {
        lock = await client.getMailboxLock('INBOX');
        const messages = await client.search({ to: userEmail });
        const message = await client.fetchOne(`${messages.at(-1)}`, { bodyParts: ['1'] });
        const rawEmailMessage = message.bodyParts
            .values()
            .next()
            .value
            ?.toString()!;
        const decodedMessage = quotedPrintable.decode(rawEmailMessage!);
        const $ = cheerio.load(decodedMessage);
        const url = $('a').attr('href');
        return url!;
    } finally {
        if (lock) {
            lock.release();
        }
    }
};