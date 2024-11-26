import { User } from "./user.type";

// Represents the data expected in request.
// Used to define validation classes.
export type UserRequest = Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'emailValidated'>;