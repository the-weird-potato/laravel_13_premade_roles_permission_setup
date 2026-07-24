export const PERMISSIONS = {
    viewUsers: 'users.view',
    createUsers: 'users.create',
    updateUsers: 'users.update',
    deleteUsers: 'users.delete',
    viewRoles: 'roles.view',
    createRoles: 'roles.create',
    updateRoles: 'roles.update',
    deleteRoles: 'roles.delete',
    viewPermissions: 'permissions.view',
} as const;

export const ROLES = {
    admin: 'admin',
    user: 'user',
} as const;
