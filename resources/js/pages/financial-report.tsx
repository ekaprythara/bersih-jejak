import React, { useEffect, useState } from "react";
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Field } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { BranchType } from "@/types/data-types";
import { index, printPdf } from "@/routes/financial/report";
import { formatRupiah } from "@/lib/utils";
import {
    CalendarIcon,
    ChevronDownIcon,
    CreditCard,
    Download,
    Printer,
    ReceiptText,
    Store,
    TrendingUp,
    Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportExcel } from "@/routes/financial-report";
import { useAuth } from "@/hooks/use-auth";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import type { DateRange } from "react-day-picker";

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
        start_date: string;
        end_date: string;
        branch_id: string;
    };
    summary: {
        cashRevenue: number;
        digitalRevenue: {
            transferRevenue: number;
            qrisRevenue: number;
        };
        totalDiscount: number;
        totalRevenue: number;
        expenses: ExpenseSummary[];
        totalExpense: number;
        netProfit: number;
    };
}) {
    const { isOwner } = useAuth();
    const now = new Date();
    const todayStr = format(now, "yyyy-MM-dd");

    const parseDateSafe = (dateStr?: string): Date => {
        if (!dateStr) return now;
        const parsed = parseISO(dateStr);
        return Number.isNaN(parsed.getTime()) ? now : parsed;
    };

    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: parseDateSafe(filters.start_date || todayStr),
        to: parseDateSafe(filters.end_date || filters.start_date || todayStr),
    });

    const form = useForm({
        start_date: filters.start_date || todayStr,
        end_date: filters.end_date || todayStr,
        branch_id: String(filters.branch_id ?? "all"),
    });

    useEffect(() => {
        const start = filters.start_date || todayStr;
        const end = filters.end_date || start;
        const branch = String(filters.branch_id ?? "all");

        form.setData({
            start_date: start,
            end_date: end,
            branch_id: branch,
        });

        setDateRange({
            from: parseDateSafe(start),
            to: parseDateSafe(end),
        });
    }, [filters.start_date, filters.end_date, filters.branch_id]);

    const isFiltered =
        form.data.start_date !== todayStr ||
        form.data.end_date !== todayStr ||
        form.data.branch_id !== "all";

    const handleReset = () => {
        const defaultData = {
            start_date: todayStr,
            end_date: todayStr,
            branch_id: "all",
        };
        form.setData(defaultData);
        setDateRange({
            from: parseDateSafe(todayStr),
            to: parseDateSafe(todayStr),
        });
        router.get(index(), defaultData, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleDateSelect = (range: DateRange | undefined) => {
        setDateRange(range);

        if (!range?.from) return;

        const startStr = format(range.from, "yyyy-MM-dd");
        const endStr = range.to ? format(range.to, "yyyy-MM-dd") : startStr;

        const updatedData = {
            ...form.data,
            start_date: startStr,
            end_date: endStr,
        };

        form.setData(updatedData);

        router.get(index(), updatedData, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleBranchChange = (value: string) => {
        const updatedData = {
            ...form.data,
            branch_id: value,
        };
        form.setData(updatedData);
        router.get(index(), updatedData, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

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

    const currentBranchName =
        branches.find((b) => String(b.id) === String(form.data.branch_id))
            ?.name || "Cabang Anda";

    const formattedToday = format(now, "dd MMMM yyyy", {
        locale: id,
    });

    return (
        <>
            <Head title="Laporan Keuangan" />
            <div className="p-4">
                <div className="flex flex-col md:flex-row items-start gap-4 md:items-center md:justify-between mb-8">
                    <Heading
                        title="Laporan Keuangan"
                        description={
                            isOwner
                                ? "Halaman untuk melihat laporan keuangan berdasarkan periode dan outlet."
                                : `Ringkasan laporan keuangan harian outlet hari ini (${formattedToday}).`
                        }
                    />
                </div>

                <div className="flex flex-col gap-4">
                    {/* Baris Filter & Aksi */}
                    <div className="flex flex-wrap items-end gap-2">
                        {isOwner ? (
                            <>
                                <Field className="w-auto min-w-60">
                                    <Label htmlFor="date-range-picker">
                                        Tanggal
                                    </Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                id="date-range-picker"
                                                variant="outline"
                                                type="button"
                                                className="w-full justify-between text-left font-normal text-xs sm:text-sm bg-white"
                                            >
                                                <span className="flex items-center truncate">
                                                    <CalendarIcon className="mr-2 size-4 shrink-0 text-muted-foreground" />
                                                    {dateRange?.from ? (
                                                        dateRange.to ? (
                                                            <>
                                                                {format(
                                                                    dateRange.from,
                                                                    "yyyy-MM-dd",
                                                                    {
                                                                        locale: id,
                                                                    },
                                                                )}{" "}
                                                                →{" "}
                                                                {format(
                                                                    dateRange.to,
                                                                    "yyyy-MM-dd",
                                                                    {
                                                                        locale: id,
                                                                    },
                                                                )}
                                                            </>
                                                        ) : (
                                                            format(
                                                                dateRange.from,
                                                                "yyyy-MM-dd",
                                                                {
                                                                    locale: id,
                                                                },
                                                            )
                                                        )
                                                    ) : (
                                                        <span className="text-muted-foreground">
                                                            Pilih Rentang
                                                            Tanggal
                                                        </span>
                                                    )}
                                                </span>
                                                <ChevronDownIcon className="ml-2 size-4 shrink-0 text-muted-foreground" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className="w-auto p-0"
                                            align="start"
                                        >
                                            <Calendar
                                                mode="range"
                                                defaultMonth={dateRange?.from}
                                                selected={dateRange}
                                                onSelect={handleDateSelect}
                                                numberOfMonths={1}
                                                locale={id}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </Field>

                                <Field className="w-48">
                                    <Label htmlFor="branch_id">Cabang</Label>
                                    <Select
                                        value={String(form.data.branch_id)}
                                        onValueChange={handleBranchChange}
                                    >
                                        <SelectTrigger
                                            id="branch_id"
                                            className="w-48 bg-white"
                                        >
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
                                                        value={String(
                                                            branch.id,
                                                        )}
                                                    >
                                                        {branch.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </Field>
                            </>
                        ) : (
                            /* Tampilan Info Terkunci untuk Admin */
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="inline-flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2 text-sm font-medium text-neutral-700">
                                    <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                                    <span>Hari Ini ({formattedToday})</span>
                                </div>
                                <div className="inline-flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2 text-sm font-medium text-neutral-700">
                                    <Store className="w-4 h-4 text-muted-foreground" />
                                    <span>{currentBranchName}</span>
                                </div>
                            </div>
                        )}

                        {/* Reset Filter di samping kiri Ekspor */}
                        {isOwner && isFiltered && (
                            <div className="flex items-center h-9 px-1">
                                <button
                                    className="text-xs text-red-500 hover:text-red-600 font-semibold hover:cursor-pointer"
                                    onClick={handleReset}
                                    type="button"
                                >
                                    Reset Filter
                                </button>
                            </div>
                        )}

                        {/* Tombol Ekspor Excel */}
                        <Button
                            type="button"
                            variant="success"
                            onClick={handleExportExcel}
                        >
                            <Download className="w-4 h-4 mr-1" />
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
                    </div>

                    {/* Kartu Ringkasan */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* 1. Pendapatan Tunai */}
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
                                <span className="text-xl font-bold text-neutral-900 tracking-tight tabular-nums">
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
                                <span className="text-xl font-bold text-neutral-900 tracking-tight tabular-nums">
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
                                <span className="text-xl font-bold text-neutral-900 tracking-tight tabular-nums">
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
                                <span className="text-xl font-bold text-neutral-900 tracking-tight tabular-nums">
                                    {formatRupiah(summary.netProfit)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Rincian Laba Bersih */}
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
                                    <span className="font-medium text-neutral-800 tabular-nums">
                                        {formatRupiah(summary.cashRevenue)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Pendapatan Transfer</span>
                                    <span className="font-medium text-neutral-800 tabular-nums">
                                        {formatRupiah(
                                            summary.digitalRevenue
                                                .transferRevenue,
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Pendapatan QRIS</span>
                                    <span className="font-medium text-neutral-800 tabular-nums">
                                        {formatRupiah(
                                            summary.digitalRevenue.qrisRevenue,
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-1 border-t border-dashed border-neutral-200">
                                    <span>Total Diskon Diberikan</span>
                                    <span className="font-medium text-amber-700 tabular-nums">
                                        {formatRupiah(
                                            summary.totalDiscount ?? 0,
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Separator className="bg-neutral-100" />

                        {/* Subtotal Pendapatan */}
                        <div className="flex justify-between items-center text-sm font-bold text-neutral-900 py-0.5">
                            <span>Total Pendapatan</span>
                            <span className="text-base tabular-nums">
                                {formatRupiah(summary.totalRevenue)}
                            </span>
                        </div>

                        <Separator className="bg-neutral-100" />

                        {/* Section 2: Pengeluaran */}
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
                                        .filter((expense) => expense.amount > 0)
                                        .map((expense) => (
                                            <div
                                                key={expense.id}
                                                className="flex justify-between items-center"
                                            >
                                                <span>{expense.name}</span>
                                                <span className="font-medium text-neutral-800 tabular-nums">
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
                            <span className="text-base tabular-nums">
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
                                    <span className="font-medium text-neutral-800 tabular-nums">
                                        {formatRupiah(summary.totalRevenue)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Total Pengeluaran</span>
                                    <span className="font-medium text-neutral-800 tabular-nums">
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
                            <span className="text-lg tabular-nums">
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
