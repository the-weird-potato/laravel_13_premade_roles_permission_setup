export type PermissionGroup = {
    group: string;
    permissions: string[];
};

export type RoleSummary = {
    id: number;
    name: string;
    users_count: number;
    is_locked: boolean;
    permissions: string[];
};

export type PermissionSummary = {
    id: number;
    name: string;
    group: string;
    roles: string[];
    is_orphaned: boolean;
};

export type ManagedUser = {
    id: number;
    name: string;
    email: string;
    roles: string[];
    is_self: boolean;
};

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type Paginated<T> = {
    data: T[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
};
