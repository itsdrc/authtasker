import { UserRoles } from "./user-roles.type";

// Represents the UserModel.
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