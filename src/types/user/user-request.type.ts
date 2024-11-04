import { User } from "./user.type";

// User expected in request
export type UserRequest = Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'emailValidated'>;