import { User } from "./user.type";

// User returned to the client
export type UserResponse = Omit<User, 'password'>;