import DataTable, { features } from "@/components/data-table";
import Heading from "@/components/heading";
import { dashboard } from "@/routes";
import { index } from "@/routes/transactions";
import { updateStatus } from "@/routes/customers";
import { Head, router } from "@inertiajs/react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import type {
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
    paymentMethods,
    paymentStatuses,
    transactionStatuses,
}: {
    transactions: TransactionType[];
    customers: CustomerType[];
    services: ServiceType[];
    paymentMethods: PaymentMethodType[];
    paymentStatuses: PaymentStatusType[];
    transactionStatuses: TransactionStatusType[];
}) {
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
            header: "Aksi",
            cell: ({ row }) => {
                return (
                    <div className="flex items-center justify-center gap-1">
                        <UpdateTransactionDialog
                            transaction={row.original}
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
