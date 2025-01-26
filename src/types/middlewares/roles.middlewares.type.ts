import { rolesMiddlewareFactory } from "@root/middlewares/roles.middleware";
import { UserRole } from "../user/user-roles.type";

export type RolesMiddlewares = {
    readonly [Key in UserRole]: ReturnType<typeof rolesMiddlewareFactory>;
}