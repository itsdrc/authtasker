import { User } from "./user.type";

// Represents the data to be saved in db.
// Used to define userSchema.
export type UserInDb = { [prop in keyof Omit<User, 'id' | 'createdAt' | 'updatedAt'>]: object };