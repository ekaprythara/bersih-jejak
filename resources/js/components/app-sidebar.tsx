import { Link, router } from "@inertiajs/react";
import {
    BookOpen,
    Building2,
    FolderGit2,
    LayoutGrid,
    LogOut,
    Receipt,
    Settings,
    UsersRound,
    Wrench,
} from "lucide-react";
import AppLogo from "@/components/app-logo";
import { NavMain } from "@/components/nav-main";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { dashboard, logout, settings } from "@/routes";
import type { NavItem } from "@/types";
import services from "@/routes/services";
import customers from "@/routes/customers";
import branches from "@/routes/branches";
import expenses from "@/routes/expenses";
import { useMobileNavigation } from "@/hooks/use-mobile-navigation";
import { Separator } from "@/components/ui/separator";

const mainNavItems: NavItem[] = [
    {
        title: "Dashboard",
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: "Pelanggan",
        href: customers.index(),
        icon: UsersRound,
    },
    {
        title: "Layanan",
        href: services.index(),
        icon: Wrench,
    },
    {
        title: "Pengeluaran",
        href: expenses.index(),
        icon: Receipt,
    },
    {
        title: "Admin & Cabang",
        href: branches.index(),
        icon: Building2,
    },
    {
        title: "Pengaturan",
        href: settings(),
        icon: Settings,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: "Repository",
        href: "https://github.com/laravel/react-starter-kit",
        icon: FolderGit2,
    },
    {
        title: "Documentation",
        href: "https://laravel.com/docs/starter-kits#react",
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <Separator className="px-4" />
                <Link
                    className="flex gap-2 cursor-pointer text-sm py-2 px-2"
                    href={logout()}
                    as="button"
                    onClick={handleLogout}
                    data-test="logout-button"
                >
                    <LogOut size={18} />
                    Log out
                </Link>
            </SidebarFooter>
        </Sidebar>
    );
}
