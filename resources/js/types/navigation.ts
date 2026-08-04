import type { InertiaLinkProps } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';

export type BreadcrumbItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
};

export type NavItem = {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
};

/**
 * A collapsible sidebar entry that groups child links instead of navigating.
 */
export type NavGroup = {
    title: string;
    icon?: LucideIcon | null;
    items: NavItem[];
    isActive?: boolean;
};

export type NavMainItem = NavItem | NavGroup;
