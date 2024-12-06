
// Represents the user roles.
// validRoles is useful for validation.
export const validRoles = ['admin', 'readonly', 'editor'] as const;
export type UserRoles = typeof validRoles[number];