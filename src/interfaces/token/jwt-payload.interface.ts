import { JwtPayload } from "jsonwebtoken";

export interface IJwtPayload extends JwtPayload {
    jti: string;    
}