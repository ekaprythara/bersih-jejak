import { Head, router, useForm } from "@inertiajs/react";
import { dashboard } from "@/routes";
import Heading from "@/components/heading";
import financial from "@/routes/financial";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { BranchType } from "@/types/data-types";
import { index, printPdf } from "@/routes/financial/report";
import { formatRupiah } from "@/lib/utils";
import {
    CreditCard,
    Printer,
    ReceiptText,
    Sheet,
    TrendingUp,
    Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportExcel } from "@/routes/financial-report";

interface ExpenseSummary {
    id: number;
    name: string;
    amount: number;
}

export default function FinancialReport({
    branches,
    filters,
    summary,
}: {
    branches: BranchType[];
    filters: {
        month: string;
        branch_id: string;
    };
    summary: {
        cashRevenue: number;
        digitalRevenue: {
            transferRevenue: number;
            qrisRevenue: number;
        };
        totalRevenue: number;
        expenses: ExpenseSummary[];
        totalExpense: number;
        netProfit: number;
    };
}) {
    const date = new Date();
    const monthNumber = date.getMonth() + 1;

    const form = useForm({
        month: String(filters.month ?? monthNumber),
        branch_id: String(filters.branch_id ?? "all"),
    });

    const isFiltered =
        form.data.month !== String(monthNumber) ||
        form.data.branch_id !== "all";

    const handleReset = () => {
        form.setData({
            month: String(monthNumber),
            branch_id: "all",
        });

        router.get(
            index(),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const handleFilterChange = (
        field: "branch_id" | "month",
        value: string,
    ) => {
        const updatedData = {
            ...form.data,
            [field]: value,
        };

        form.setData(updatedData);

        router.get(index(), updatedData, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const months = [
        { id: 1, name: "Januari" },
        { id: 2, name: "Februari" },
        { id: 3, name: "Maret" },
        { id: 4, name: "April" },
        { id: 5, name: "Mei" },
        { id: 6, name: "Juni" },
        { id: 7, name: "Juli" },
        { id: 8, name: "Agustus" },
        { id: 9, name: "September" },
        { id: 10, name: "Oktober" },
        { id: 11, name: "November" },
        { id: 12, name: "Desember" },
    ];

    const handleExportExcel = () => {
        const url = new URL(exportExcel.url(), window.location.origin);

        Object.entries(form.data).forEach(([key, value]) => {
            if (value && value !== "all") {
                url.searchParams.set(key, String(value));
            }
        });

        window.location.href = url.toString();
    };

    const handlePrintPdf = () => {
        const url = new URL(printPdf.url(), window.location.origin);

        Object.entries(form.data).forEach(([key, value]) => {
            if (value && value !== "all") {
                url.searchParams.set(key, String(value));
            }
        });

        window.open(url.toString(), "_blank");
    };

    return (
        <>
            <Head title="Laporan Keuangan" />

            <div className="p-4">
                <Heading
                    title="Laporan Keuangan"
                    description="Halaman untuk melihat laporan keuangan per outlet."
                />

                <div className="flex flex-col gap-4">
                    <form className="flex gap-2">
                        <Select
                            value={String(form.data.month)}
                            onValueChange={(value) =>
                                handleFilterChange("month", value)
                            }
                        >
                            <SelectTrigger id="month" className="w-50">
                                <SelectValue placeholder="Pilih Bulan" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="all">
                                        Pilih Bulan
                                    </SelectItem>
                                    {months.map((month) => (
                                        <SelectItem
                                            key={month.id}
                                            value={String(month.id)}
                                        >
                                            {month.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        <Select
                            value={form.data.branch_id}
                            onValueChange={(value) =>
                                handleFilterChange("branch_id", value)
                            }
                        >
                            <SelectTrigger id="branch_id" className="w-50">
                                <SelectValue placeholder="Semua Cabang" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="all">
                                        Semua Cabang
                                    </SelectItem>
                                    {branches.map((branch) => (
                                        <SelectItem
                                            key={branch.id}
                                            value={String(branch.id)}
                                        >
                                            {branch.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        {isFiltered && (
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleReset}
                            >
                                Hapus Filter
                            </Button>
                        )}

                        {/* Tombol Ekspor Excel */}
                        <Button
                            type="button"
                            variant="success"
                            onClick={handleExportExcel}
                        >
                            <Sheet className="w-4 h-4 mr-1" />
                            Ekspor
                        </Button>

                        {/* Tombol Cetak PDF */}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handlePrintPdf}
                        >
                            <Printer className="w-4 h-4 mr-1" />
                            Cetak
                        </Button>
                    </form>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="relative overflow-hidden bg-white border border-neutral-200/80 rounded-xl p-5 shadow-xs hover:shadow-md transition-all duration-300 group">
                            <div className="flex items-start justify-between">
                                <div className="flex flex-col space-y-1">
                                    <span className="font-semibold text-neutral-400 uppercase text-xs tracking-wider">
                                        Pendapatan Tunai
                                    </span>
                                    <span className="text-sm text-neutral-700 font-semibold">
                                        Tunai
                                    </span>
                                </div>
                                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                    <Wallet className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-4 pt-3">
                                <span className="text-xl font-bold text-neutral-900 tracking-tight font-mono">
                                    {formatRupiah(summary.cashRevenue)}
                                </span>
                            </div>
                        </div>

                        {/* 2. Pendapatan Digital */}
                        <div className="relative overflow-hidden bg-white border border-neutral-200/80 rounded-xl p-5 shadow-xs hover:shadow-md transition-all duration-300 group">
                            <div className="flex items-start justify-between">
                                <div className="flex flex-col space-y-1">
                                    <span className="font-semibold text-neutral-400 uppercase text-xs tracking-wider">
                                        Pendapatan Digital
                                    </span>
                                    <span className="text-sm text-neutral-700 font-semibold">
                                        Transfer & QRIS
                                    </span>
                                </div>
                                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-4 pt-3">
                                <span className="text-xl font-bold text-neutral-900 tracking-tight font-mono">
                                    {formatRupiah(
                                        summary.digitalRevenue.transferRevenue +
                                            summary.digitalRevenue.qrisRevenue,
                                    )}
                                </span>
                            </div>
                        </div>

                        {/* 3. Total Beban Usaha */}
                        <div className="relative overflow-hidden bg-white border border-neutral-200/80 rounded-xl p-5 shadow-xs hover:shadow-md transition-all duration-300 group">
                            <div className="flex items-start justify-between">
                                <div className="flex flex-col space-y-1">
                                    <span className="font-semibold text-neutral-400 uppercase text-xs tracking-wider">
                                        Total Beban Usaha
                                    </span>
                                    <span className="text-sm font-semibold text-neutral-700">
                                        Pengeluaran
                                    </span>
                                </div>
                                <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                    <ReceiptText className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-4 pt-3">
                                <span className="text-xl font-bold text-neutral-900 tracking-tight font-mono">
                                    {formatRupiah(summary.totalExpense)}
                                </span>
                            </div>
                        </div>

                        {/* 4. Laba Bersih Outlet */}
                        <div className="relative overflow-hidden bg-white border border-neutral-200/80 rounded-xl p-5 shadow-xs hover:shadow-md transition-all duration-300 group">
                            <div className="flex items-start justify-between">
                                <div className="flex flex-col space-y-1">
                                    <span className="font-semibold text-neutral-400 uppercase text-xs tracking-wider">
                                        Laba Bersih
                                    </span>
                                    <span className="text-sm font-semibold text-neutral-700">
                                        Pendapatan Bersih
                                    </span>
                                </div>
                                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-4 pt-3">
                                <span className="text-xl font-bold text-neutral-900 tracking-tight font-mono">
                                    {formatRupiah(summary.netProfit)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-neutral-200/80 rounded-xl p-6 shadow-xs space-y-6">
                        <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                            <h2 className="text-base font-semibold text-neutral-800">
                                Laporan Laba Bersih
                            </h2>
                        </div>

                        {/* Section 1: Pendapatan */}
                        <div className="space-y-3">
                            <span className="font-bold text-sm text-neutral-900 block">
                                Pendapatan
                            </span>
                            <div className="flex flex-col gap-2.5 pl-4 text-sm text-neutral-600">
                                <div className="flex justify-between items-center">
                                    <span>Pendapatan Cash</span>
                                    <span className="font-medium text-neutral-800 font-mono">
                                        {formatRupiah(summary.cashRevenue)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Pendapatan Transfer</span>
                                    <span className="font-medium text-neutral-800 font-mono">
                                        {formatRupiah(
                                            summary.digitalRevenue
                                                .transferRevenue,
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Pendapatan QRIS</span>
                                    <span className="font-medium text-neutral-800 font-mono">
                                        {formatRupiah(
                                            summary.digitalRevenue.qrisRevenue,
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Separator className="bg-neutral-100" />

                        {/* Subtotal Pendapatan */}
                        <div className="flex justify-between items-center text-sm font-bold text-neutral-900 py-0.5">
                            <span>Total Pendapatan</span>
                            <span className="font-mono text-base">
                                {formatRupiah(summary.totalRevenue)}
                            </span>
                        </div>

                        <Separator className="bg-neutral-100" />

                        <div className="space-y-3">
                            <span className="font-bold text-sm text-neutral-900 block">
                                Pengeluaran
                            </span>
                            <div className="flex flex-col gap-2.5 pl-4 text-sm text-neutral-600">
                                {summary.expenses &&
                                summary.expenses.filter(
                                    (expense) => expense.amount > 0,
                                ).length > 0 ? (
                                    summary.expenses
                                        .filter((expense) => expense.amount > 0) // Sembunyikan jika amount 0 atau kurang
                                        .map((expense) => (
                                            <div
                                                key={expense.id}
                                                className="flex justify-between items-center"
                                            >
                                                <span>{expense.name}</span>
                                                <span className="font-medium text-neutral-800 font-mono">
                                                    {formatRupiah(
                                                        expense.amount,
                                                    )}
                                                </span>
                                            </div>
                                        ))
                                ) : (
                                    <span className="italic text-neutral-400">
                                        Tidak ada data pengeluaran
                                    </span>
                                )}
                            </div>
                        </div>

                        <Separator className="bg-neutral-100" />

                        {/* Subtotal Pengeluaran */}
                        <div className="flex justify-between items-center text-sm font-bold text-neutral-900 py-0.5">
                            <span>Total Pengeluaran</span>
                            <span className="font-mono text-base">
                                {formatRupiah(summary.totalExpense)}
                            </span>
                        </div>

                        <Separator className="bg-neutral-100" />

                        {/* Section 3: Ringkasan Akhir */}
                        <div className="space-y-3">
                            <span className="font-bold text-sm text-neutral-900 block">
                                Ringkasan
                            </span>
                            <div className="flex flex-col gap-2.5 pl-4 text-sm text-neutral-600">
                                <div className="flex justify-between items-center">
                                    <span>Total Pendapatan</span>
                                    <span className="font-medium text-neutral-800 font-mono">
                                        {formatRupiah(summary.totalRevenue)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Total Pengeluaran</span>
                                    <span className="font-medium text-neutral-800 font-mono">
                                        {formatRupiah(summary.totalExpense)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Separator className="bg-neutral-100" />

                        {/* Grand Total Laba Bersih */}
                        <div
                            className={`flex justify-between items-center text-sm font-bold p-3 rounded-lg border ${
                                summary.netProfit >= 0
                                    ? "text-emerald-700 bg-emerald-50/60 border-emerald-100"
                                    : "text-rose-700 bg-rose-50/60 border-rose-100"
                            }`}
                        >
                            <span>Total Laba Bersih</span>
                            <span className="font-mono text-lg">
                                {formatRupiah(summary.netProfit)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

FinancialReport.layout = {
    breadcrumbs: [
        {
            title: "Dashboard",
            href: dashboard(),
        },
        {
            title: "Laporan Keuangan",
            href: financial.report.index(),
        },
    ],
};
