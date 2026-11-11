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

    // const canModify = (transaction: TransactionType) => {
    //     if (currentUser.is_owner) {
    //         return transaction.user_id === currentUser.id;
    //     }

    //     return (
    //         transaction.branch_id === currentUser.branch_id &&
    //          !transaction.user?.is_owner
    //     );
    // };

    const columns: ColumnDef<typeof features, TransactionType>[] = [
        {
            accessorKey: "transaction_date",
            header: "Tanggal Transaksi",
            cell: ({ row }) => {
                const transactionDate = row.original.transaction_date;
                return (
                    <span className="font-mono text-xs">{transactionDate}</span>
                );
            },
        },
        {
            accessorKey: "pickup_date",
            header: "Tanggal Ambil",
            cell: ({ row }) => {
                const pickupDate = row.original.pickup_date;
                return <span className="font-mono text-xs">{pickupDate}</span>;
            },
        },
        {
            accessorKey: "branch.name",
            header: "Cabang",
            cell: ({ row }) => {
                const branchName = row.original.branch?.name ?? "-";
                return <Badge variant="secondary">{branchName}</Badge>;
            },
        },
        {
            accessorKey: "customer.name",
            header: "Nama Pelanggan",
            cell: ({ row }) => (
                <span className="text-sm">
                    {row.original.customer?.name ?? "-"}
                </span>
            ),
        },
        {
            accessorKey: "service.name",
            header: "Layanan",
            cell: ({ row }) => (
                <span className="text-sm">
                    {row.original.service?.name ?? "-"}
                </span>
            ),
        },
        {
            accessorKey: "total_amount",
            header: "Bayar",
            cell: ({ row }) => {
                return (
                    <span className="font-mono font-medium text-sm">
                        {formatRupiah(row.original.total_amount)}
                    </span>
                );
            },
        },
        {
            accessorKey: "transaction_status.name",
            header: "Status Transaksi",
            cell: ({ row }) => {
                const statusName =
                    row.original.transaction_status?.name?.toLowerCase() || "";

                let badgeVariant:
                    | "default"
                    | "secondary"
                    | "destructive"
                    | "outline"
                    | "success"
                    | "warning"
                    | "info"
                    | "dark" = "secondary";

                if (statusName.includes("selesai")) {
                    badgeVariant = "success"; // Hijau
                } else if (statusName.includes("proses")) {
                    badgeVariant = "info"; // Biru / Sky
                } else if (statusName.includes("pending")) {
                    badgeVariant = "warning"; // Kuning / Amber
                }

                return (
                    <Badge
                        variant={badgeVariant}
                        className="uppercase text-[10px] tracking-wide"
                    >
                        {row.original.transaction_status?.name ?? "-"}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "payment_status.name",
            header: "Status Pembayaran",
            cell: ({ row }) => {
                const payStatus =
                    row.original.payment_status?.name?.toLowerCase() || "";
                const isLunas = payStatus.includes("lunas");

                return (
                    <Badge
                        variant={isLunas ? "success" : "outline"}
                        className="uppercase text-[10px] tracking-wide"
                    >
                        {row.original.payment_status?.name ?? "-"}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "payment_method.name",
            header: "Metode Pembayaran",
            cell: ({ row }) => (
                <span className="text-sm">
                    {row.original.payment_method?.name ?? "-"}
                </span>
            ),
        },
        {
            accessorKey: "user.name",
            header: "Dibuat Oleh",
            cell: ({ row }) => (
                <span className="text-sm">
                    {row.original.user?.name ?? "-"}
                </span>
            ),
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

                return (
                    <div className="flex items-center justify-center gap-1">
                        <UpdateTransactionDialog
                            transaction={row.original}
                            branches={branchOptions}
                            paymentMethods={paymentMethods}
                            paymentStatuses={paymentStatuses}
                            transactionStatuses={transactionStatuses}
                        />
                        <Button
                            size="icon"
                            variant="outline"
                            onClick={handlePrintPdf}
                        >
                            <Printer className="w-4 h-4" />
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
                        {/* 1. Total Transaksi */}
                        <div className="relative overflow-hidden bg-white border border-neutral-200/80 rounded-xl p-5 shadow-xs hover:shadow-md transition-all duration-300 group flex flex-col justify-between">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex flex-col space-y-1 overflow-hidden">
                                    <span className="font-semibold text-neutral-400 uppercase text-xs tracking-wider truncate">
                                        Total Transaksi
                                    </span>
                                    <span className="text-sm text-neutral-700 font-semibold truncate">
                                        Keseluruhan
                                    </span>
                                </div>
                                <div className="p-2.5 bg-sky-50 text-sky-600 rounded-lg group-hover:scale-110 transition-transform duration-300 shrink-0">
                                    <FileText className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-4 pt-3">
                                <span className="text-xl font-bold text-neutral-900 tracking-tight font-mono block truncate">
                                    {card.total_transactions}
                                </span>
                            </div>
                        </div>

                        {/* 2. Sukses */}
                        <div className="relative overflow-hidden bg-white border border-neutral-200/80 rounded-xl p-5 shadow-xs hover:shadow-md transition-all duration-300 group flex flex-col justify-between">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex flex-col space-y-1 overflow-hidden">
                                    <span className="font-semibold text-neutral-400 uppercase text-xs tracking-wider truncate">
                                        Sukses
                                    </span>
                                    <span className="text-sm text-neutral-700 font-semibold truncate">
                                        Transaksi Selesai
                                    </span>
                                </div>
                                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg group-hover:scale-110 transition-transform duration-300 shrink-0">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-4 pt-3">
                                <span className="text-xl font-bold text-neutral-900 tracking-tight font-mono block truncate">
                                    {card.success_transactions}
                                </span>
                            </div>
                        </div>

                        {/* 3. Pending */}
                        <div className="relative overflow-hidden bg-white border border-neutral-200/80 rounded-xl p-5 shadow-xs hover:shadow-md transition-all duration-300 group flex flex-col justify-between">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex flex-col space-y-1 overflow-hidden">
                                    <span className="font-semibold text-neutral-400 uppercase text-xs tracking-wider truncate">
                                        Pending
                                    </span>
                                    <span className="text-sm font-semibold text-neutral-700 truncate">
                                        Transaksi Pending
                                    </span>
                                </div>
                                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg group-hover:scale-110 transition-transform duration-300 shrink-0">
                                    <Clock className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-4 pt-3">
                                <span className="text-xl font-bold text-neutral-900 tracking-tight font-mono block truncate">
                                    {card.pending_transactions}
                                </span>
                            </div>
                        </div>

                        {/* 4. Total Cash Hari Ini */}
                        <div className="relative overflow-hidden bg-white border border-neutral-200/80 rounded-xl p-5 shadow-xs hover:shadow-md transition-all duration-300 group flex flex-col justify-between">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex flex-col space-y-1 overflow-hidden">
                                    <span className="font-semibold text-neutral-400 uppercase text-xs tracking-wider truncate">
                                        Total Cash Hari Ini
                                    </span>
                                    <span className="text-sm font-semibold text-neutral-700 truncate">
                                        Pembayaran Tunai
                                    </span>
                                </div>
                                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg group-hover:scale-110 transition-transform duration-300 shrink-0">
                                    <Banknote className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-4 pt-3">
                                <span className="text-lg font-bold text-neutral-900 tracking-tight font-mono block truncate">
                                    {formatRupiah(card.total_cash_today)}
                                </span>
                            </div>
                        </div>

                        {/* 5. Total Transfer Hari Ini */}
                        <div className="relative overflow-hidden bg-white border border-neutral-200/80 rounded-xl p-5 shadow-xs hover:shadow-md transition-all duration-300 group flex flex-col justify-between sm:col-span-2 lg:col-span-1">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex flex-col space-y-1 overflow-hidden">
                                    <span className="font-semibold text-neutral-400 uppercase text-xs tracking-wider truncate">
                                        Total Transfer Hari Ini
                                    </span>
                                    <span className="text-sm font-semibold text-neutral-700 truncate">
                                        Pembayaran Digital
                                    </span>
                                </div>
                                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform duration-300 shrink-0">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-4 pt-3">
                                <span className="text-lg font-bold text-neutral-900 tracking-tight font-mono block truncate">
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
