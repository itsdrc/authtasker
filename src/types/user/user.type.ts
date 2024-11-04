import { UserRoles } from "./user-roles.type";

export type User = {
    id: string;
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    role: UserRoles;
    emailValidated: boolean;
}