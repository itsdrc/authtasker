import { UserRole, validRoles } from "@root/types/user/user-roles.type";

// calculates if the provided role can access 
// an endpoint which uses "minRole" as the minimum role required
export const canAccess = (minRole: UserRole, userRole: UserRole): boolean => {
    if (userRole === 'admin')
        return true;

    const minRoleValue = validRoles.indexOf(minRole);
    const roleValue = validRoles.indexOf(userRole);

    if (roleValue >= minRoleValue)
        return true;
    else
        return false;
};