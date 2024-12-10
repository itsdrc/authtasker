import { IUser } from "@root/interfaces/user/user.interface";

/* Represents the data expected in request. Used to define validation classes */
export type UserRequest = Omit<IUser, 'id' | 'createdAt' | 'updatedAt' | 'emailValidated'>;