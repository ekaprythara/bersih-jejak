import DataTable, { features } from "@/components/data-table";
import Heading from "@/components/heading";
import { dashboard } from "@/routes";
import { index, printTransaction } from "@/routes/transactions";
import { updateStatus } from "@/routes/customers";
import { Head, router, usePage } from "@inertiajs/react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import {
    CalendarArrowDown,
    CalendarCheck2,
    CircleCheck,
    Sparkles,
    Store,
    Tag,
    User,
} from "lucide-react";
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
import ShowTransactionDialog from "@/components/partials/transaction/show-transaction-dialog";

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
            accessorKey: "invoice_number",
            header: "Invoice & Cabang",
            cell: ({ row }) => (
                <div className="flex flex-col items-start gap-1 text-xs sm:text-sm whitespace-nowrap">
                    <span className="font-medium">
                        {row.original.invoice_number}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs opacity-70">
                        <span className="inline-flex items-center gap-1">
                            <Store className="size-3 shrink-0" />
                            {row.original.branch?.name ?? "-"}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                            <User className="size-3 shrink-0" />
                            {row.original.user?.name ?? "-"}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "transaction_date",
            header: "Tanggal",
            cell: ({ row }) => (
                <div className="flex flex-col items-start gap-1 text-xs sm:text-sm tabular-nums whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5">
                        <CalendarArrowDown className="size-3.5 shrink-0 opacity-70" />
                        {row.original.transaction_date ?? "-"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs opacity-70">
                        <CalendarCheck2 className="size-3 shrink-0" />
                        {row.original.pickup_date ?? "-"}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: "customer.name",
            header: "Pelanggan & Layanan",
            cell: ({ row }) => {
                const customerName = row.original.customer?.name ?? "-";
                const serviceName = row.original.service?.name ?? "-";
                const shoeCount = row.original.shoe_count ?? 1;

                return (
                    <div className="min-w-[160px] max-w-[240px] sm:max-w-xs flex flex-col items-start gap-1 text-xs sm:text-sm whitespace-normal break-words leading-relaxed">
                        <span className="font-medium">{customerName}</span>
                        <span className="inline-flex items-center gap-1 text-xs opacity-70">
                            <Sparkles className="size-3 shrink-0" />
                            <span>
                                {serviceName} ({shoeCount} pasang)
                            </span>
                        </span>
                    </div>
                );
            },
        },
        {
            accessorKey: "total_amount",
            header: "Total Bayar",
            cell: ({ row }) => {
                const servicePrice = Number(row.original.service?.price ?? 0);
                const shoeCount = Number(row.original.shoe_count ?? 1);
                const subtotal = servicePrice * shoeCount;
                const discount = Number(row.original.discount ?? 0);
                const total = Number(row.original.total_amount ?? 0);

                // Cek berbagai kemungkinan struktur data status pembayaran dari backend
                const paymentObj = row.original.payment_status;

                // Jika payment_status berupa relasi object, ambil name atau slug-nya
                // Atau jika berupa ID langsung (misal ID 2 = Lunas/Paid), sesuaikan angkanya
                const statusName =
                    typeof paymentObj === "object" && paymentObj !== null
                        ? (paymentObj.name ?? "").toLowerCase()
                        : String(paymentObj ?? "").toLowerCase();

                // Deteksi apakah lunas/paid (pastikan tidak tertukar dengan unpaid)
                const isPaid =
                    statusName === "paid" ||
                    statusName === "lunas" ||
                    statusName.includes("paid");

                return (
                    <div className="flex flex-col items-start gap-1 text-xs sm:text-sm tabular-nums whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                            <span className="font-medium">
                                {formatRupiah(total)}
                            </span>
                            <span
                                title={
                                    typeof paymentObj === "object"
                                        ? paymentObj?.name
                                        : String(paymentObj)
                                }
                            >
                                {isPaid ? (
                                    <CircleCheck className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                    <Clock className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                                )}
                            </span>
                        </div>
                        {discount > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs opacity-70">
                                <Tag className="size-3 shrink-0" />
                                {formatRupiah(subtotal)} - Diskon{" "}
                                {formatRupiah(discount)}
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: "transaction_status.name",
            header: "Status",
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
                    badgeVariant = "success";
                } else if (statusName.includes("proses")) {
                    badgeVariant = "info";
                } else if (statusName.includes("pending")) {
                    badgeVariant = "warning";
                }

                return (
                    <Badge
                        variant={badgeVariant}
                        className="uppercase text-[10px] tracking-wide whitespace-nowrap"
                    >
                        {row.original.transaction_status?.name ?? "-"}
                    </Badge>
                );
            },
        },
        {
            id: "actions",
            header: "Aksi",
            cell: ({ row }) => {
                const handlePrintPdf = (e: React.FormEvent) => {
                    e.preventDefault();
                    const url = new URL(
                        printTransaction.url(row.original.invoice_number),
                        window.location.origin,
                    );
                    window.open(url.toString(), "_blank");
                };

                return (
                    <div className="flex items-center justify-start gap-1">
                        <ShowTransactionDialog transaction={row.original} />

                        <UpdateTransactionDialog
                            transaction={row.original}
                            branches={branchOptions}
                            services={services}
                            paymentMethods={paymentMethods}
                            paymentStatuses={paymentStatuses}
                            transactionStatuses={transactionStatuses}
                        />

                        <Button
                            size="icon"
                            variant="outline"
                            onClick={handlePrintPdf}
                            title="Print PDF"
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
