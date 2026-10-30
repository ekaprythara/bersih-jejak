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
import {
    Banknote,
    CheckCircle2,
    Clock,
    CreditCard,
    FileText,
    Printer,
    ReceiptText,
    TrendingUp,
    Wallet,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { useState } from "react";

export default function Transaction({
    transactions,
    customers,
    services,
    branches,
    branchOptions,
    paymentMethods,
    paymentStatuses,
    card,
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
    const [globalFilter, setGlobalFilter] = useState("");
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
            cell: ({ row }) => {
                const transactionDate = row.original.transaction_date;

                return <span className="font-mono">{transactionDate}</span>;
            },
        },
        {
            accessorKey: "pickup_date",
            header: "Tanggal Ambil",
            cell: ({ row }) => {
                const pickupDate = row.original.pickup_date;

                return <span className="font-mono">{pickupDate}</span>;
            },
        },
        {
            accessorKey: "branch.name",
            header: "Cabang",
            cell: ({ row }) => {
                const branchName = row.original.branch?.name;

                return <Badge>{branchName}</Badge>;
            },
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
            accessorKey: "total_amount",
            header: "Bayar",
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
                    <Badge
                        variant={badgeVariant}
                        className="uppercase text-xs tracking-wide"
                    >
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
                <div className="flex flex-col md:flex-row items-start gap-4 md:items-center md:justify-between mb-8">
                    <Heading
                        title="Transaksi"
                        description="Halaman untuk mengelola data transaksi pelanggan dan status pencucian sepatu."
                    />
                    <CreateTransactionDialog
                        customers={customers}
                        services={services}
                        branches={branches}
                        paymentMethods={paymentMethods}
                        paymentStatuses={paymentStatuses}
                    />
                </div>

                <div className="flex flex-col gap-4">
                    {/* Ini adalah Section Card */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        {/* 1. Total Transaksi */}
                        <div className="relative overflow-hidden bg-white border border-neutral-200/80 rounded-xl p-5 shadow-xs hover:shadow-md transition-all duration-300 group">
                            <div className="flex items-start justify-between">
                                <div className="flex flex-col space-y-1">
                                    <span className="font-semibold text-neutral-400 uppercase text-xs tracking-wider">
                                        Total Transaksi
                                    </span>
                                    <span className="text-sm text-neutral-700 font-semibold">
                                        Keseluruhan
                                    </span>
                                </div>
                                <div className="p-2.5 ml-4 bg-sky-50 text-sky-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                    <FileText className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-4 pt-3">
                                <span className="text-xl font-bold text-neutral-900 tracking-tight font-mono">
                                    {card.total_transactions}
                                </span>
                            </div>
                        </div>

                        {/* 2. Sukses */}
                        <div className="relative overflow-hidden bg-white border border-neutral-200/80 rounded-xl p-5 shadow-xs hover:shadow-md transition-all duration-300 group">
                            <div className="flex items-start justify-between">
                                <div className="flex flex-col space-y-1">
                                    <span className="font-semibold text-neutral-400 uppercase text-xs tracking-wider">
                                        Sukses
                                    </span>
                                    <span className="text-sm text-neutral-700 font-semibold">
                                        Transaksi Selesai
                                    </span>
                                </div>
                                <div className="p-2.5 ml-4 bg-emerald-50 text-emerald-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-4 pt-3">
                                <span className="text-xl font-bold text-neutral-900 tracking-tight font-mono">
                                    {card.success_transactions}
                                </span>
                            </div>
                        </div>

                        {/* 3. Pending */}
                        <div className="relative overflow-hidden bg-white border border-neutral-200/80 rounded-xl p-5 shadow-xs hover:shadow-md transition-all duration-300 group">
                            <div className="flex items-start justify-between">
                                <div className="flex flex-col space-y-1">
                                    <span className="font-semibold text-neutral-400 uppercase text-xs tracking-wider">
                                        Pending
                                    </span>
                                    <span className="text-sm font-semibold text-neutral-700">
                                        Transaksi Pending
                                    </span>
                                </div>
                                <div className="p-2.5 ml-4 bg-amber-50 text-amber-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                    <Clock className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-4 pt-3">
                                <span className="text-xl font-bold text-neutral-900 tracking-tight font-mono">
                                    {card.pending_transactions}
                                </span>
                            </div>
                        </div>

                        {/* 4. Total Cash Hari Ini */}
                        <div className="relative overflow-hidden bg-white border border-neutral-200/80 rounded-xl p-5 shadow-xs hover:shadow-md transition-all duration-300 group">
                            <div className="flex items-start justify-between">
                                <div className="flex flex-col space-y-1">
                                    <span className="font-semibold text-neutral-400 uppercase text-xs tracking-wider">
                                        Total Cash Hari Ini
                                    </span>
                                    <span className="text-sm font-semibold text-neutral-700">
                                        Pembayaran Tunai
                                    </span>
                                </div>
                                <div className="p-2.5 ml-4 bg-emerald-50 text-emerald-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                    <Banknote className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-4 pt-3">
                                <span className="text-xl font-bold text-neutral-900 tracking-tight font-mono">
                                    {formatRupiah(card.total_cash_today)}
                                </span>
                            </div>
                        </div>

                        {/* 5. Total Transfer Hari Ini */}
                        <div className="relative overflow-hidden bg-white border border-neutral-200/80 rounded-xl p-5 shadow-xs hover:shadow-md transition-all duration-300 group">
                            <div className="flex items-start justify-between">
                                <div className="flex flex-col space-y-1">
                                    <span className="font-semibold text-neutral-400 uppercase text-xs tracking-wider">
                                        Total Transfer Hari Ini
                                    </span>
                                    <span className="text-sm font-semibold text-neutral-700">
                                        Pembayaran Digital
                                    </span>
                                </div>
                                <div className="p-2.5 ml-4 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-4 pt-3">
                                <span className="text-xl font-bold text-neutral-900 tracking-tight font-mono">
                                    {formatRupiah(card.total_transfer_today)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-start gap-20">
                            <SortTransactionForm
                                branches={branchOptions}
                                services={serviceOptions}
                                transactionStatuses={transactionStatuses}
                                paymentStatuses={paymentStatuses}
                                paymentMethods={paymentMethods}
                                filters={filters}
                                globalFilter={globalFilter}
                                setGlobalFilter={setGlobalFilter}
                            />
                        </div>

                        <DataTable
                            columns={columns}
                            data={transactions}
                            globalFilter={globalFilter}
                            setGlobalFilter={setGlobalFilter}
                        />
                    </div>
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
            title: "Transaksi",
            href: index(),
        },
    ],
};
