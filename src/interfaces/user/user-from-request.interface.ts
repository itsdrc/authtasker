import { UserRole } from "@root/types/user/user-roles.type";

// user info obtained by roles middleware
export interface UserFromRequest {
    id: string;
    role: UserRole;
    jti: string;
    tokenExp: number;
};