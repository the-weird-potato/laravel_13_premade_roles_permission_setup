import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useIsMobile } from '@/hooks/use-mobile';
import type { NavGroup, NavItem, NavMainItem } from '@/types';

function isNavGroup(item: NavMainItem): item is NavGroup {
    return 'items' in item;
}

function NavLink({ item }: { item: NavItem }) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                asChild
                isActive={isCurrentUrl(item.href)}
                tooltip={{ children: item.title }}
            >
                <Link href={item.href} prefetch>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

/**
 * Flyout used when the sidebar is collapsed to icons, where the inline
 * submenu is hidden and the group would otherwise be unreachable.
 */
function NavGroupFlyout({
    group,
    hasCurrentChild,
}: {
    group: NavGroup;
    hasCurrentChild: boolean;
}) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <SidebarMenuItem>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                        isActive={hasCurrentChild}
                        tooltip={{ children: group.title }}
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                        {group.icon && <group.icon />}
                        <span>{group.title}</span>
                        <ChevronRight className="ml-auto group-data-[collapsible=icon]:hidden" />
                    </SidebarMenuButton>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    side="right"
                    align="start"
                    className="min-w-48 rounded-lg"
                >
                    <DropdownMenuLabel>{group.title}</DropdownMenuLabel>
                    {group.items.map((item) => (
                        <DropdownMenuItem
                            key={item.title}
                            asChild
                            data-active={isCurrentOrParentUrl(item.href)}
                            className="data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
                        >
                            <Link href={item.href} prefetch>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    );
}

function NavCollapsible({
    group,
    hasCurrentChild,
}: {
    group: NavGroup;
    hasCurrentChild: boolean;
}) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <Collapsible
            asChild
            defaultOpen={group.isActive || hasCurrentChild}
            className="group/collapsible"
        >
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                        isActive={hasCurrentChild}
                        tooltip={{ children: group.title }}
                    >
                        {group.icon && <group.icon />}
                        <span>{group.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                </CollapsibleTrigger>

                <CollapsibleContent>
                    <SidebarMenuSub>
                        {group.items.map((item) => (
                            <SidebarMenuSubItem key={item.title}>
                                <SidebarMenuSubButton
                                    asChild
                                    isActive={isCurrentOrParentUrl(item.href)}
                                >
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    );
}

function NavGroupItem({ group }: { group: NavGroup }) {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const { state } = useSidebar();
    const isMobile = useIsMobile();

    const hasCurrentChild = group.items.some((item) =>
        isCurrentOrParentUrl(item.href),
    );

    if (state === 'collapsed' && !isMobile) {
        return (
            <NavGroupFlyout group={group} hasCurrentChild={hasCurrentChild} />
        );
    }

    return <NavCollapsible group={group} hasCurrentChild={hasCurrentChild} />;
}

export function NavMain({ items = [] }: { items: NavMainItem[] }) {
    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) =>
                    isNavGroup(item) ? (
                        <NavGroupItem key={item.title} group={item} />
                    ) : (
                        <NavLink key={item.title} item={item} />
                    ),
                )}
            </SidebarMenu>
        </SidebarGroup>
    );
}
