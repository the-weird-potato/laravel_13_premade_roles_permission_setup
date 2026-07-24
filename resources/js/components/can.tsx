import type { ReactNode } from 'react';
import { usePermissions } from '@/hooks/use-permissions';

export default function Can({
    permission,
    role,
    fallback = null,
    children,
}: {
    permission?: string | string[];
    role?: string | string[];
    fallback?: ReactNode;
    children: ReactNode;
}) {
    const { canAny, hasAnyRole } = usePermissions();

    const allowedByPermission =
        permission === undefined
            ? true
            : canAny(Array.isArray(permission) ? permission : [permission]);

    const allowedByRole =
        role === undefined
            ? true
            : hasAnyRole(Array.isArray(role) ? role : [role]);

    if (!allowedByPermission || !allowedByRole) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
