
export const validRoles = ['admin', 'readonly'] as const;
export type UserRoles = typeof validRoles[number];