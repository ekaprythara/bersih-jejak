import CustomerStatusSwitch from "@/components/customer-status-switch";
import DataTable, { features } from "@/components/data-table";
import Heading from "@/components/heading";
import { CreateCustomerDialog } from "@/components/partials/customer/create-customer-dialog";
import { dashboard } from "@/routes";
import { index } from "@/routes/expenses";
import services, { updateStatus } from "@/routes/services";
import { Head, router, usePage } from "@inertiajs/react";
import { ColumnDef } from "@tanstack/react-table";
import type {
    BranchType,
    ExpenseCategoryType,
    ExpenseType,
} from "@/types/data-types";
import ServiceStatusSwitch from "@/components/service-status-switch";
import { UpdateServiceDialog } from "@/components/partials/service/update-service-dialog";
import { CreateExpenseDialog } from "@/components/partials/expense/create-expense-dialog";
import { UpdateExpenseDialog } from "@/components/partials/expense/update-expense-dialog";
import SortExpenseForm from "@/components/partials/expense/sort-expense-form";
import { formatRupiah } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Building2,
    Calendar,
    Download,
    PieChart,
    Printer,
    Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Expense({
    expenses,
    branches,
    branchOptions,
    allBranches,
    expenseCategories,
    filters,
    dashboardCard,
}: {
    expenses: ExpenseType[];
    branches: BranchType[];
    allBranches: BranchType[];
    branchOptions: BranchType[];
    dashboardCard: {
        totalExpense: number;
        monthlyExpense: number;
        topCategory: {
            name: string;
            total: number;
        };
        topBranch: {
            name: string;
            total: number;
        };
    };
    filters: {
        branch_id: string;
        expense_category_id: string;
    };
    expenseCategories: ExpenseCategoryType[];
}) {
    const { auth } = usePage().props;
    const currentUser = auth.user;
    const [globalFilter, setGlobalFilter] = useState("");

    const canModify = (expense: ExpenseType) => {
        if (currentUser.is_owner) {
            return expense.user_id === currentUser.id;
        }

        // Jika user yang login adalah Admin (!currentUser.is_owner)
        // Syarat: Cabang harus sama DAN yang membuat data BUKAN owner
        return (
            expense.branch_id === currentUser.branch_id &&
            !expense.user?.is_owner
        );
    };

    console.log(expenses);

    const columns: ColumnDef<typeof features, ExpenseType>[] = [
        {
            header: "Tanggal",
            accessorKey: "expense_date",
            cell: ({ row }) => (
                <span className="font-mono text-xs sm:text-sm">
                    {row.original.expense_date}
                </span>
            ),
        },
        {
            header: "Cabang",
            cell: ({ row }) => {
                const branchName = row.original.branch
                    ? row.original.branch.name
                    : "-";
                return <Badge variant="secondary">{branchName}</Badge>;
            },
        },
        {
            header: "Kategori",
            cell: ({ row }) => {
                const categoryName = row.original.expense_category?.name ?? "-";
                return <Badge variant="outline">{categoryName}</Badge>;
            },
        },
        {
            header: "Keterangan",
            accessorKey: "description",
            cell: ({ row }) => {
                return (
                    <div className="max-w-[200px] sm:max-w-xs md:max-w-md text-xs text-neutral-600 text-wrap leading-relaxed">
                        {row.original.description}
                    </div>
                );
            },
        },
        {
            header: "Pembuat",
            cell: ({ row }) => {
                return (
                    <span className="text-xs sm:text-sm">
                        {row.original.user.name}
                    </span>
                );
            },
        },
        {
            header: "Nominal",
            cell: ({ row }) => {
                return (
                    <span className="font-mono font-medium text-xs sm:text-sm">
                        {formatRupiah(row.original.amount)}
                    </span>
                );
            },
        },
        {
            header: "Aksi",
            cell: ({ row }) => {
                if (!canModify(row.original)) {
                    return null;
                }

                return (
                    <div className="flex items-center justify-center gap-1">
                        <UpdateExpenseDialog
                            expense={row.original}
                            expenseCategories={expenseCategories}
                            branches={branchOptions}
                        />
                    </div>
                );
            },
        },
    ];

    return (
        <>
            <Head title="Pengeluaran" />

            <div className="p-4">
                <div className="flex flex-col md:flex-row items-start gap-4 md:items-center md:justify-between mb-8">
                    <Heading
                        title="Pengeluaran"
                        description="Halaman untuk mengelola data pengeluaran."
                    />

                    <CreateExpenseDialog
                        branches={branches}
                        expenseCategories={expenseCategories}
                    />
                </div>

                {/* Dashboard Mini untuk Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full mb-6">
                    {/* Card 1: Total Pengeluaran */}
                    <div className="relative overflow-hidden bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300 group flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex flex-col space-y-1 overflow-hidden">
                                <span className="font-semibold text-neutral-400 uppercase text-xs tracking-wider truncate">
                                    Total Keluar
                                </span>
                                <span className="text-sm text-neutral-700 font-semibold truncate">
                                    Akumulasi Biaya
                                </span>
                            </div>
                            <div className="p-2.5 bg-red-50 text-red-600 rounded-lg group-hover:scale-110 transition-transform duration-300 shrink-0">
                                <Wallet className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4 pt-3">
                            <span className="text-xl font-bold text-neutral-900 tracking-tight font-mono block truncate">
                                {formatRupiah(dashboardCard.totalExpense)}
                            </span>
                        </div>
                    </div>

                    {/* Card 2: Pengeluaran Bulan Ini */}
                    <div className="relative overflow-hidden bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300 group flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex flex-col space-y-1 overflow-hidden">
                                <span className="font-semibold text-neutral-400 uppercase text-xs tracking-wider truncate">
                                    Bulan Ini
                                </span>
                                <span className="text-sm text-neutral-700 font-semibold truncate">
                                    Periode Berjalan
                                </span>
                            </div>
                            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg group-hover:scale-110 transition-transform duration-300 shrink-0">
                                <Calendar className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4 pt-3">
                            <span className="text-xl font-bold text-neutral-900 tracking-tight font-mono block truncate">
                                {formatRupiah(dashboardCard.monthlyExpense)}
                            </span>
                        </div>
                    </div>

                    {/* Card 3: Kategori Pengeluaran Terbesar */}
                    <div className="relative overflow-hidden bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300 group flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex flex-col space-y-1 overflow-hidden">
                                <span className="font-semibold text-neutral-400 uppercase text-xs tracking-wider truncate">
                                    Kategori Dominan
                                </span>
                                <span
                                    className="text-sm text-neutral-700 font-semibold truncate"
                                    title={dashboardCard.topCategory.name}
                                >
                                    {dashboardCard.topCategory.name}
                                </span>
                            </div>
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform duration-300 shrink-0">
                                <PieChart className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4 pt-3">
                            <span className="text-xl font-bold text-neutral-900 tracking-tight font-mono block truncate">
                                {formatRupiah(dashboardCard.topCategory.total)}
                            </span>
                        </div>
                    </div>

                    {/* Card 4: Cabang Tertinggi */}
                    <div className="relative overflow-hidden bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300 group flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex flex-col space-y-1 overflow-hidden">
                                <span className="font-semibold text-neutral-400 uppercase text-xs tracking-wider truncate">
                                    Cabang Terboros
                                </span>
                                <span
                                    className="text-sm text-neutral-700 font-semibold truncate"
                                    title={dashboardCard.topBranch.name}
                                >
                                    {dashboardCard.topBranch.name ===
                                    "Semua Cabang"
                                        ? "Semua Cabang"
                                        : `Cabang ${dashboardCard.topBranch.name}`}
                                </span>
                            </div>
                            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg group-hover:scale-110 transition-transform duration-300 shrink-0">
                                <Building2 className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4 pt-3">
                            <span className="text-xl font-bold text-neutral-900 tracking-tight font-mono block truncate">
                                {formatRupiah(dashboardCard.topBranch.total)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-start gap-20">
                        <SortExpenseForm
                            branches={allBranches}
                            expenseCategories={expenseCategories}
                            filters={filters}
                            globalFilter={globalFilter}
                            setGlobalFilter={setGlobalFilter}
                        />
                    </div>

                    <DataTable
                        columns={columns}
                        data={expenses}
                        globalFilter={globalFilter}
                        setGlobalFilter={setGlobalFilter}
                    />
                </div>
            </div>
        </>
    );
}

Expense.layout = {
    breadcrumbs: [
        {
            title: "Dashboard",
            href: dashboard(),
        },
        {
            title: "Pengeluaran",
            href: index(),
        },
    ],
};
