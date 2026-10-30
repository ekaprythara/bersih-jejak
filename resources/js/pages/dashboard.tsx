import Heading from "@/components/heading";
import { Head, router, useForm, usePage } from "@inertiajs/react";
import { dashboard } from "@/routes";
import { formatRupiah } from "@/lib/utils";
import { ArrowDownRight, TrendingUp, Wallet, X } from "lucide-react";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    LineChart,
    Line,
    Legend,
} from "recharts";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BranchType } from "@/types/data-types";

export default function Dashboard({
    card,
    charts,
    branches,
    filters,
}: {
    card: {
        total_revenue: number;
        total_expense: number;
        net_profit: number;
        total_cash: number;
        total_transfer: number;
    };
    charts: {
        status_pengerjaan: { name: string; value: number; color: string }[];
        layanan_terlaris: { name: string; total: number }[];
        pendapatan_bulanan: any[]; // Dibuat fleksibel (dynamic keys)
    };
    branches: BranchType[];
    filters: {
        branch_id: number | string;
    };
}) {
    const { auth } = usePage().props;
    const currentUser = auth.user;

    const form = useForm({
        branch_id: filters?.branch_id || "all",
    });

    const handleFilterChange = (updatedFields: Record<string, any>) => {
        const newData = {
            ...form.data,
            ...updatedFields,
        };

        form.setData(newData as any);

        router.get(dashboard(), newData, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleReset = () => {
        form.setData({
            branch_id: "all",
        });

        router.get(
            dashboard(),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const isFiltered = form.data.branch_id !== "all";

    // Daftar warna otomatis untuk garis grafik cabang yang dinamis
    const branchColors = [
        "#2563eb",
        "#f97316",
        "#10b981",
        "#8b5cf6",
        "#ec4899",
        "#06b6d4",
    ];

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col md:flex-row items-start gap-4 md:items-center md:justify-between">
                    <Heading
                        title="Dashboard"
                        description="Ringkasan pendapatan, pengeluaran, dan laba bersih bulan ini dari keseluruhan cabang."
                    />
                    <div className="flex items-center gap-2">
                        {currentUser.is_owner && (
                            <Select
                                value={String(form.data.branch_id)}
                                onValueChange={(value) =>
                                    handleFilterChange({ branch_id: value })
                                }
                            >
                                <SelectTrigger id="branch_id" className="w-52">
                                    <SelectValue
                                        placeholder="Pilih Cabang"
                                        className="text-muted-foreground"
                                    />
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
                        )}
                        {isFiltered && (
                            <Button
                                type="button"
                                className="w-full md:w-fit"
                                variant="destructive"
                                onClick={handleReset}
                            >
                                <X strokeWidth={2.5} />
                                <span className="font-semibold">
                                    Hapus Filter
                                </span>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Grid 3 Card Atas: Pendapatan, Pengeluaran, Laba Bersih */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* 1. Total Pendapatan */}
                    <div className="relative overflow-hidden bg-white border border-neutral-200/80 rounded-xl p-5 shadow-xs hover:shadow-md transition-all duration-300 group">
                        <div className="flex items-start justify-between">
                            <div className="flex flex-col space-y-1">
                                <span className="font-semibold text-neutral-400 uppercase text-xs tracking-wider">
                                    Total Pendapatan
                                </span>
                                <span className="text-sm text-neutral-700 font-semibold">
                                    Bulan Ini
                                </span>
                            </div>
                            <div className="p-2.5 ml-4 bg-emerald-50 text-emerald-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4 pt-3">
                            <span className="text-xl font-bold text-neutral-900 tracking-tight font-mono">
                                {formatRupiah(card.total_revenue)}
                            </span>
                        </div>
                    </div>

                    {/* 2. Total Pengeluaran */}
                    <div className="relative overflow-hidden bg-white border border-neutral-200/80 rounded-xl p-5 shadow-xs hover:shadow-md transition-all duration-300 group">
                        <div className="flex items-start justify-between">
                            <div className="flex flex-col space-y-1">
                                <span className="font-semibold text-neutral-400 uppercase text-xs tracking-wider">
                                    Total Pengeluaran
                                </span>
                                <span className="text-sm text-neutral-700 font-semibold">
                                    Bulan Ini
                                </span>
                            </div>
                            <div className="p-2.5 ml-4 bg-rose-50 text-rose-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                <ArrowDownRight className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4 pt-3">
                            <span className="text-xl font-bold text-neutral-900 tracking-tight font-mono">
                                {formatRupiah(card.total_expense)}
                            </span>
                        </div>
                    </div>

                    {/* 3. Laba Bersih */}
                    <div className="relative overflow-hidden bg-white border border-neutral-200/80 rounded-xl p-5 shadow-xs hover:shadow-md transition-all duration-300 group">
                        <div className="flex items-start justify-between">
                            <div className="flex flex-col space-y-1">
                                <span className="font-semibold text-neutral-400 uppercase text-xs tracking-wider">
                                    Laba Bersih
                                </span>
                                <span className="text-sm text-neutral-700 font-semibold">
                                    Pendapatan - Pengeluaran
                                </span>
                            </div>
                            <div
                                className={`p-2.5 ml-4 rounded-lg group-hover:scale-110 transition-transform duration-300 ${
                                    card.net_profit >= 0
                                        ? "bg-sky-50 text-sky-600"
                                        : "bg-amber-50 text-amber-600"
                                }`}
                            >
                                <Wallet className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4 pt-3">
                            <span
                                className={`text-xl font-bold tracking-tight font-mono ${
                                    card.net_profit >= 0
                                        ? "text-neutral-900"
                                        : "text-rose-600"
                                }`}
                            >
                                {formatRupiah(card.net_profit)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 1. Status Pengerjaan (Donut Chart) */}
                    <div className="bg-white border border-neutral-200/80 rounded-xl p-6 shadow-xs flex flex-col justify-between">
                        <h3 className="text-base font-bold text-neutral-900 mb-4">
                            Status Pengerjaan
                        </h3>
                        <div className="h-64 w-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={charts.status_pengerjaan}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {charts.status_pengerjaan.map(
                                            (entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.color}
                                                />
                                            ),
                                        )}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        {/* Keterangan Custom Legend */}
                        <div className="flex flex-col gap-2 mt-2">
                            {charts.status_pengerjaan.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between text-sm"
                                >
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="w-3 h-3 rounded-full"
                                            style={{
                                                backgroundColor: item.color,
                                            }}
                                        ></span>
                                        <span className="text-neutral-600 font-medium">
                                            {item.name}
                                        </span>
                                    </div>
                                    <span className="font-bold text-neutral-900">
                                        {item.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 2. Layanan Terlaris (Bar Chart) */}
                    <div className="bg-white border border-neutral-200/80 rounded-xl p-6 shadow-xs flex flex-col justify-between">
                        <h3 className="text-base font-bold text-neutral-900 mb-4">
                            Layanan Terlaris
                        </h3>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={charts.layanan_terlaris}
                                    margin={{
                                        top: 20,
                                        right: 10,
                                        left: -20,
                                        bottom: 0,
                                    }}
                                >
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 12 }}
                                        stroke="#888888"
                                    />
                                    <YAxis
                                        tick={{ fontSize: 12 }}
                                        stroke="#888888"
                                    />
                                    <Tooltip cursor={{ fill: "transparent" }} />
                                    <Bar
                                        dataKey="total"
                                        fill="#2563eb"
                                        radius={[6, 6, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 3. Pendapatan Bulanan (Line Chart Dinamis) */}
                    <div className="bg-white border border-neutral-200/80 rounded-xl p-6 shadow-xs flex flex-col justify-between">
                        <h3 className="text-base font-bold text-neutral-900 mb-4">
                            Pendapatan Bulanan
                        </h3>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={charts.pendapatan_bulanan}
                                    margin={{
                                        top: 20,
                                        right: 10,
                                        left: -10,
                                        bottom: 0,
                                    }}
                                >
                                    <XAxis
                                        dataKey="month"
                                        tick={{ fontSize: 12 }}
                                        stroke="#888888"
                                    />
                                    <YAxis
                                        tick={{ fontSize: 12 }}
                                        stroke="#888888"
                                    />
                                    <Tooltip
                                        formatter={(value) =>
                                            formatRupiah(Number(value))
                                        }
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                    />
                                    {/* Render garis cabang secara dinamis berdasarkan data */}
                                    {charts.pendapatan_bulanan &&
                                        charts.pendapatan_bulanan.length > 0 &&
                                        Object.keys(
                                            charts.pendapatan_bulanan[0],
                                        )
                                            .filter((key) => key !== "month")
                                            .map((branchName, idx) => (
                                                <Line
                                                    key={branchName}
                                                    type="monotone"
                                                    dataKey={branchName}
                                                    stroke={
                                                        branchColors[
                                                            idx %
                                                                branchColors.length
                                                        ]
                                                    }
                                                    strokeWidth={2}
                                                    dot={false}
                                                />
                                            ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Ringkasan Keuangan Keseluruhan */}
                <div className="bg-white border border-neutral-200/80 rounded-xl p-6 shadow-xs">
                    <h3 className="text-base font-bold text-neutral-900 mb-6">
                        Ringkasan Keuangan Keseluruhan
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                        <div className="flex flex-col space-y-1">
                            <span className="text-xs sm:text-sm font-medium text-neutral-400">
                                Total Cash
                            </span>
                            <span className="text-base sm:text-lg font-bold text-neutral-900 font-mono">
                                {formatRupiah(card.total_cash)}
                            </span>
                        </div>
                        <div className="flex flex-col space-y-1">
                            <span className="text-xs sm:text-sm font-medium text-neutral-400">
                                Total Transfer
                            </span>
                            <span className="text-base sm:text-lg font-bold text-neutral-900 font-mono">
                                {formatRupiah(card.total_transfer)}
                            </span>
                        </div>
                        <div className="flex flex-col space-y-1">
                            <span className="text-xs sm:text-sm font-medium text-neutral-400">
                                Total Pendapatan
                            </span>
                            <span className="text-base sm:text-lg font-bold text-neutral-900 font-mono">
                                {formatRupiah(card.total_revenue)}
                            </span>
                        </div>
                        <div className="flex flex-col space-y-1">
                            <span className="text-xs sm:text-sm font-medium text-neutral-400">
                                Total Pengeluaran
                            </span>
                            <span className="text-base sm:text-lg font-bold text-rose-600 font-mono">
                                {formatRupiah(card.total_expense)}
                            </span>
                        </div>
                        <div className="flex flex-col space-y-1 col-span-2 sm:col-span-1">
                            <span className="text-xs sm:text-sm font-medium text-neutral-400">
                                Total Laba Bersih
                            </span>
                            <span
                                className={`text-base sm:text-lg font-bold font-mono ${card.net_profit >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                            >
                                {formatRupiah(card.net_profit)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: "Dashboard",
            href: dashboard(),
        },
    ],
};
