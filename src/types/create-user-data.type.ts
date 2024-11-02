import { UserInterface } from "../interfaces/user.interface";

export type UserCreationData = Omit<UserInterface, 'id' | 'createdAt' | 'updatedAt'>;