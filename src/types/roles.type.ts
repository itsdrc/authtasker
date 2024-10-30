
export const validRoles = ['admin', 'readonly'] as const;
export type Roles = typeof validRoles[number];