import { readFileSync } from "fs";

export const readAdminToken = (): string => {
    const path = `${__dirname}/admin-token.txt`;
    const token = readFileSync(path, 'utf-8');
    return token;
}