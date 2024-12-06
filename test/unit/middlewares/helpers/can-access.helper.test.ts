import { canAccess } from "@root/middlewares/helpers/can-access.helper";
import { UserRole, validRoles } from "@root/types/user/user-roles.type";

describe('CanAcess helper', () => {
    describe('if user role is admin', () => {
        test('should always return true', async () => {
            const adminRole: UserRole = 'admin';
            validRoles.forEach((minRoleRequired: UserRole) => {
                const valid = canAccess(minRoleRequired, adminRole);
                expect(valid).toBeTruthy();
            })
        });
    });

    describe('given "editor" as the min role required', () => {
        test('should return false if user rol is "readonly"', async () => {
            const minRoleRequired = 'editor';
            const userRol = 'readonly';
            const accessGranted = canAccess(minRoleRequired, userRol);
            expect(accessGranted).toBeFalsy();
        });

        test('should return true if user rol is "admin"', async () => {
            const minRoleRequired = 'editor';
            const userRol = 'admin';
            const accessGranted = canAccess(minRoleRequired, userRol);
            expect(accessGranted).toBeTruthy();
        });

        test('should return true if user role "editor"', async () => {
            const minRoleRequired = 'editor';
            const userRol = 'editor';
            const accessGranted = canAccess(minRoleRequired, userRol);
            expect(accessGranted).toBeTruthy();
        });
    });

    describe('given "readonly" as the min role required', () => {
        test('should always return true', async () => {
            const minRoleRequired = 'readonly';
            validRoles.forEach((rol: UserRole) => {
                const valid = canAccess(minRoleRequired, rol);
                expect(valid).toBeTruthy();
            });
        });
    });
});