import { User } from "./user.type";

// User data to save in db (used to define the user schema/entity)
export type UserInDb = { [prop in keyof Omit<User, 'id' | 'createdAt' | 'updatedAt'>]: object };