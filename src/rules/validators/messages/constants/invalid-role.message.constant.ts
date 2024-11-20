import { validRoles } from "src/types/user/user-roles.type";

export const INVALID_ROLE_MESSAGE = `role must be one of the following values: ${validRoles.join(', ') }`