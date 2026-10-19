import DataTable, { features } from "@/components/data-table";
import Heading from "@/components/heading";
import { dashboard } from "@/routes";
import { index } from "@/routes/transactions";
import { updateStatus } from "@/routes/customers";
import { Head, router, usePage } from "@inertiajs/react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import type {
    BranchType,
    CustomerType,
    PaymentMethodType,
    PaymentStatusType,
    ServiceType,
    TransactionStatusType,
    TransactionType,
} from "@/types/data-types";
import { CreateTransactionDialog } from "@/components/partials/transaction/create-transaction-dialog";
import { UpdateTransactionDialog } from "@/components/partials/transaction/update-transaction-dialog";
import { Badge } from "@/components/ui/badge";

export default function Transaction({
    transactions,
    customers,
    services,
    branches,
    branchOptions,
    paymentMethods,
    paymentStatuses,
    transactionStatuses,
}: {
    transactions: TransactionType[];
    customers: CustomerType[];
    branches: BranchType[];
    services: ServiceType[];
    branchOptions: BranchType[];
    paymentMethods: PaymentMethodType[];
    paymentStatuses: PaymentStatusType[];
    transactionStatuses: TransactionStatusType[];
}) {
    const { auth } = usePage().props;
    const currentUser = auth.user;

    const canModify = (transaction: TransactionType) => {
        if (currentUser.is_owner) {
            return transaction.user_id === currentUser.id;
        }

        // Jika user yang login adalah Admin (!currentUser.is_owner)
        // Syarat: Cabang harus sama DAN yang membuat data BUKAN owner
        return (
            transaction.branch_id === currentUser.branch_id &&
            !transaction.user?.is_owner
        );
    };

    const columns: ColumnDef<typeof features, TransactionType>[] = [
        {
            accessorKey: "transaction_date",
            header: "Tanggal Transaksi",
        },
        {
            accessorKey: "customer.name",
            header: "Nama Pelanggan",
        },
        {
            accessorKey: "pickup_date",
            header: "Tanggal Ambil",
        },
        {
            accessorKey: "service.name", // Jika menggunakan relasi Eloquent (eager load)
            header: "Layanan",
        },
        {
            accessorKey: "transaction_status.name",
            header: "Status Transaksi",
            cell: ({ row }) => {
                return <Badge>{row.original.transaction_status?.name}</Badge>;
            },
        },
        {
            accessorKey: "payment_status.name",
            header: "Status Pembayaran",
        },

        {
            accessorKey: "payment_method.name",
            header: "Metode Pembayaran",
        },
        {
            accessorKey: "branch.name",
            header: "Cabang",
        },
        {
            accessorKey: "user.name",
            header: "Dibuat Oleh",
        },
        {
            header: "Aksi",
            cell: ({ row }) => {
                // Gunakan fungsi canModify untuk pengecekan
                if (!canModify(row.original)) {
                    return null; // Jika tidak boleh edit, kembalikan null (kosong)
                }

                // Jika boleh edit, return komponennya
                return (
                    <div className="flex items-center justify-center gap-1">
                        <UpdateTransactionDialog
                            transaction={row.original}
                            branches={branchOptions}
                            paymentMethods={paymentMethods}
                            paymentStatuses={paymentStatuses}
                            transactionStatuses={transactionStatuses}
                        />
                    </div>
                );
            },
        },
    ];

    return (
        <>
            <Head title="Transaksi" />

            <div className="p-4">
                <Heading
                    title="Transaksi"
                    description="Halaman untuk mengelola data transaksi."
                />

                <div className="flex flex-col gap-4">
                    <div className="flex justify-end items-center">
                        <CreateTransactionDialog
                            customers={customers}
                            services={services}
                            branches={branches}
                            paymentMethods={paymentMethods}
                            paymentStatuses={paymentStatuses}
                        />
                    </div>

                    <DataTable columns={columns} data={transactions} />
                </div>
            </div>
        </>
    );
}

Transaction.layout = {
    breadcrumbs: [
        {
            title: "Dashboard",
            href: dashboard(),
        },
        {
            title: "Transaction",
            href: index(),
        },
    ],
};
