import * as quotedPrintable from 'quoted-printable'
import * as cheerio from 'cheerio';

export const getUrlFromEmailMessage = (emailMessage: string): string=> {
    const decodedMessage = quotedPrintable.decode(emailMessage!);
    const $ = cheerio.load(decodedMessage);
    const url = $('a').attr('href');
    return url!;
}