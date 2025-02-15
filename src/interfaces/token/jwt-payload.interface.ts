import { TOKEN_PURPOSES } from "@root/rules/constants/token-purposes.constants";
import { JwtPayload } from "jsonwebtoken";

export interface IJwtPayload extends JwtPayload {
    jti: string;
    purpose: typeof TOKEN_PURPOSES[keyof typeof TOKEN_PURPOSES];
}