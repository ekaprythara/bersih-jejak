import DataTable, { features } from "@/components/data-table";
import Heading from "@/components/heading";
import { dashboard } from "@/routes";
import { index } from "@/routes/transactions";
import { updateStatus } from "@/routes/customers";
import { Head, router } from "@inertiajs/react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import type { CustomerType, TransactionType } from "@/types/data-types";
import { CreateTransactionDialog } from "@/components/partials/transaction/create-transaction-dialog";

export default function Transaction({
    transactions,
    customers,
}: {
    transactions: TransactionType[];
    customers: CustomerType[];
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
        },
        {
            accessorKey: "payment_status.name",
            header: "Status Pembayaran",
        },

        {
            accessorKey: "payment_method.name",
            header: "Metode Pembayaran",
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
                        <CreateTransactionDialog customers={customers} />
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
