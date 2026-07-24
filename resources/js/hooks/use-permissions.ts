import { usePage } from '@inertiajs/react';
import { useMemo } from 'react';

export function usePermissions() {
    const { auth } = usePage().props;

    const permissions = useMemo(
        () => new Set(auth?.permissions ?? []),
        [auth?.permissions],
    );

    const roles = useMemo(() => new Set(auth?.roles ?? []), [auth?.roles]);

    return useMemo(() => {
        const can = (permission: string) => permissions.has(permission);
        const hasRole = (role: string) => roles.has(role);

        return {
            can,
            hasRole,
            canAny: (needed: string[]) => needed.some(can),
            canAll: (needed: string[]) => needed.every(can),
            hasAnyRole: (needed: string[]) => needed.some(hasRole),
            permissions: [...permissions],
            roles: [...roles],
        };
    }, [permissions, roles]);
}
