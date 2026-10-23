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

export default function Expense({
    expenses,
    branches,
    branchOptions,
    allBranches,
    expenseCategories,
    filters,
}: {
    expenses: ExpenseType[];
    branches: BranchType[];
    allBranches: BranchType[];
    branchOptions: BranchType[];
    filters: {
        branch_id: string;
        expense_category_id: string;
    };
    expenseCategories: ExpenseCategoryType[];
}) {
    const { auth } = usePage().props;
    const currentUser = auth.user;

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
        },
        {
            header: "Cabang",
            accessorFn: (row) => {
                return row.branch ? `${row.branch.name}` : "-";
            },
        },
        {
            header: "Kategori",
            accessorFn: (row) => {
                return row.expense_category.name;
            },
        },
        {
            header: "Keterangan",
            accessorKey: "description",
            cell: ({ row }) => {
                return (
                    <div className="max-w-125 text-wrap">
                        {row.original.description}
                    </div>
                );
            },
        },
        {
            header: "Pembuat",
            accessorFn: (row) => {
                return row.user.name;
            },
        },
        {
            header: "Nominal",
            accessorFn: (row) => {
                return formatRupiah(row.amount);
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
                <Heading
                    title="Pengeluaran"
                    description="Halaman untuk mengelola data pengeluaran."
                />

                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-start gap-20">
                        <SortExpenseForm
                            branches={allBranches}
                            expenseCategories={expenseCategories}
                            filters={filters}
                        />
                        <CreateExpenseDialog
                            branches={branches}
                            expenseCategories={expenseCategories}
                        />
                    </div>

                    <DataTable columns={columns} data={expenses} />
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
