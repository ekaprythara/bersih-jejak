import DataTable, { features } from "@/components/data-table";
import Heading from "@/components/heading";
import { dashboard } from "@/routes";
import { index, printTransaction } from "@/routes/transactions";
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
import SortTransactionForm from "@/components/partials/transaction/sort-transaction-form";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export default function Transaction({
    transactions,
    customers,
    services,
    branches,
    branchOptions,
    paymentMethods,
    paymentStatuses,
    transactionStatuses,
    serviceOptions,
    filters,
}: {
    transactions: TransactionType[];
    customers: CustomerType[];
    branches: BranchType[];
    services: ServiceType[];
    branchOptions: BranchType[];
    serviceOptions: ServiceType[];
    filters: {
        min_date?: string | null;
        max_date?: string | null;
        branch_id?: string | number | null;
        service_id?: string | number | null;
        transaction_status_id?: string | number | null;
        payment_status_id?: string | number | null;
        payment_method_id?: string | number | null;
    };
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
            accessorKey: "pickup_date",
            header: "Tanggal Ambil",
        },
        {
            accessorKey: "branch.name",
            header: "Cabang",
        },
        {
            accessorKey: "customer.name",
            header: "Nama Pelanggan",
        },
        {
            accessorKey: "service.name",
            header: "Layanan",
        },
        {
            accessorKey: "transaction_status.name",
            header: "Status Transaksi",
            cell: ({ row }) => {
                const statusName =
                    row.original.transaction_status?.name?.toLowerCase() || "";

                // Menentukan varian badge berdasarkan status
                let badgeVariant:
                    | "default"
                    | "secondary"
                    | "destructive"
                    | "outline"
                    | "success"
                    | "warning"
                    | "info"
                    | "dark" = "secondary";

                if (
                    statusName.includes("selesai") ||
                    statusName.includes("completed")
                ) {
                    badgeVariant = "success"; // Hijau
                } else if (
                    statusName.includes("proses") ||
                    statusName.includes("progress")
                ) {
                    badgeVariant = "info"; // Biru / Sky
                } else if (
                    statusName.includes("pending") ||
                    statusName.includes("tertunda")
                ) {
                    badgeVariant = "warning"; // Kuning / Amber
                }

                return (
                    <Badge variant={badgeVariant}>
                        {row.original.transaction_status?.name ?? "-"}
                    </Badge>
                );
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
            accessorKey: "user.name",
            header: "Dibuat Oleh",
        },
        {
            header: "Aksi",
            cell: ({ row }) => {
                const handlePrintPdf = (e: React.FormEvent) => {
                    e.preventDefault();

                    const url = new URL(
                        printTransaction.url(row.original.id),
                        window.location.origin,
                    );

                    window.open(url.toString(), "_blank");
                };

                if (!canModify(row.original)) {
                    return (
                        <Button size="icon" onClick={handlePrintPdf}>
                            <Printer />
                        </Button>
                    );
                }

                return (
                    <div className="flex items-center justify-center gap-1">
                        <UpdateTransactionDialog
                            transaction={row.original}
                            branches={branchOptions}
                            paymentMethods={paymentMethods}
                            paymentStatuses={paymentStatuses}
                            transactionStatuses={transactionStatuses}
                        />
                        <Button size="icon" onClick={handlePrintPdf}>
                            <Printer />
                        </Button>
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
                    <div className="flex justify-between items-start gap-20">
                        <SortTransactionForm
                            branches={branchOptions}
                            services={serviceOptions}
                            transactionStatuses={transactionStatuses}
                            paymentStatuses={paymentStatuses}
                            paymentMethods={paymentMethods}
                            filters={filters}
                        />
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
