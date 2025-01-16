import { UserRole } from "@root/types/user/user-roles.type";

export interface UserFromRequest {
    id: string;
    role: UserRole;
    jti: string;
    tokenExp: number;
};