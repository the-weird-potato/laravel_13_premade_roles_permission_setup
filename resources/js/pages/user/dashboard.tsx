import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { dashboard } from '@/routes/user';

export default function UserDashboard() {
    return (
        <>
            <Head title="My area" />

            <div className="space-y-6 px-4 py-6">
                <Heading
                    title="My area"
                    description="Everything reachable only by standard users"
                />

                <div className="relative min-h-[60vh] overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </>
    );
}

UserDashboard.layout = {
    breadcrumbs: [
        {
            title: 'My area',
            href: dashboard(),
        },
    ],
};
