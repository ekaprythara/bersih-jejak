import { Link, router } from "@inertiajs/react";
import {
    BookOpen,
    Building2,
    ChartColumnIncreasing,
    CreditCard,
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
    useSidebar,
} from "@/components/ui/sidebar";
import { dashboard, logout, settings } from "@/routes";
import type { NavItem } from "@/types";
import services from "@/routes/services";
import customers from "@/routes/customers";
import branches from "@/routes/branches";
import expenses from "@/routes/expenses";
import { useMobileNavigation } from "@/hooks/use-mobile-navigation";
import { Separator } from "@/components/ui/separator";
import transactions from "@/routes/transactions";
import financial from "@/routes/financial";
import { useAuth } from "@/hooks/use-auth";

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
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
    const { isOwner } = useAuth();

    const mainNavItems: NavItem[] = [
        {
            title: "Dashboard",
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: "Transaksi",
            href: transactions.index(),
            icon: CreditCard,
        },
        {
            title: "Pelanggan",
            href: customers.index(),
            icon: UsersRound,
        },
        ...(isOwner
            ? [
                  {
                      title: "Layanan",
                      href: services.index(),
                      icon: Wrench,
                  },
                  {
                      title: "Laporan Keuangan",
                      href: financial.report.index(),
                      icon: ChartColumnIncreasing,
                  },
              ]
            : []),
        {
            title: "Pengeluaran",
            href: expenses.index(),
            icon: Receipt,
        },
        ...(isOwner
            ? [
                  {
                      title: "Admin & Cabang",
                      href: branches.index(),
                      icon: Building2,
                  },
              ]
            : []),

        {
            title: "Pengaturan",
            href: settings(),
            icon: Settings,
        },
    ];
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
                    <div className="flex items-center gap-3 overflow-hidden transition-all duration-300">
                        <LogOut size={18} className="shrink-0" />

                        <span
                            className={`whitespace-nowrap transition-all duration-300 ${
                                isMobile || state === "collapsed"
                                    ? "w-0 opacity-0 pointer-events-none"
                                    : "w-auto opacity-100"
                            }`}
                        >
                            Log out
                        </span>
                    </div>
                </Link>
            </SidebarFooter>
        </Sidebar>
    );
}
