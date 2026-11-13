import DataTable, { features } from "@/components/data-table";
import Heading from "@/components/heading";
import { dashboard } from "@/routes";
import { index } from "@/routes/services";
import { updateStatus } from "@/routes/services";
import { Head, router } from "@inertiajs/react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { CreateServiceDialog } from "@/components/partials/service/create-service-dialog";
import type { ServiceType } from "@/types/data-types";
import ServiceStatusSwitch from "@/components/service-status-switch";
import { UpdateServiceDialog } from "@/components/partials/service/update-service-dialog";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import { useState } from "react";
import { Search, X, Layers, CheckCircle2, XCircle, Tag } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

const handleStatusChange = (id: number, newStatus: boolean) => {
    router.patch(
        updateStatus.url(id),
        { status: newStatus },
        {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Status layanan berhasil diubah.");
            },
        },
    );
};

export default function Service({
    services,
    card,
}: {
    services: ServiceType[];
    card: {
        total_services: number;
        active_services: number;
        inactive_services: number;
        avg_price: number;
    };
}) {
    const [globalFilter, setGlobalFilter] = useState("");

    const columns: ColumnDef<typeof features, ServiceType>[] = [
        {
            header: "Nama",
            accessorKey: "name",
            cell: ({ row }) => (
                <span className="font-medium">{row.original.name}</span>
            ),
        },
        {
            header: "Harga",
            accessorKey: "price",
            cell: ({ row }) => {
                const price = row.original.price;
                return (
                    <span className="font-mono font-medium text-sm">
                        {formatRupiah(price)}
                    </span>
                );
            },
        },
        {
            header: "Estimasi Waktu (Hari)",
            accessorKey: "estimated_days",
            cell: ({ row }) => {
                const days = row.original.estimated_days;
                return <span className="font-mono text-xs">{days} Hari</span>;
            },
        },
        {
            header: "Status",
            cell: ({ row }) => {
                return (
                    <ServiceStatusSwitch
                        checked={row.original.status}
                        onCheckedChange={() =>
                            handleStatusChange(
                                row.original.id,
                                !row.original.status,
                            )
                        }
                    />
                );
            },
        },
        {
            header: "Aksi",
            cell: ({ row }) => {
                return (
                    <div className="flex items-center justify-center gap-1">
                        <UpdateServiceDialog service={row.original} />
                    </div>
                );
            },
        },
    ];

    return (
        <>
            <Head title="Layanan" />
            <div className="p-4">
                <div className="flex flex-col md:flex-row items-start gap-4 md:items-center md:justify-between mb-8">
                    <Heading
                        title="Layanan"
                        description="Halaman untuk mengelola data layanan cuci sepatu."
                    />
                    <CreateServiceDialog />
                </div>

                {/* --- CARD STATISTIK LAYANAN --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full mb-6">
                    {/* Card 1: Total Layanan */}
                    <div className="relative overflow-hidden bg-white border border-neutral-200/80 rounded-xl p-5 shadow-xs hover:shadow-md transition-all duration-300 group flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex flex-col space-y-1 overflow-hidden">
                                <span className="font-semibold text-neutral-400 uppercase text-xs tracking-wider truncate">
                                    Total Layanan
                                </span>
                                <span className="text-sm text-neutral-700 font-semibold truncate">
                                    Keseluruhan Menu
                                </span>
                            </div>
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform duration-300 shrink-0">
                                <Layers className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4 pt-3">
                            <span className="text-xl font-bold text-neutral-900 tracking-tight font-mono block truncate">
                                {card.total_services}
                            </span>
                        </div>
                    </div>

                    {/* Card 2: Layanan Aktif */}
                    <div className="relative overflow-hidden bg-white border border-neutral-200/80 rounded-xl p-5 shadow-xs hover:shadow-md transition-all duration-300 group flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex flex-col space-y-1 overflow-hidden">
                                <span className="font-semibold text-neutral-400 uppercase text-xs tracking-wider truncate">
                                    Layanan Aktif
                                </span>
                                <span className="text-sm text-neutral-700 font-semibold truncate">
                                    Tersedia untuk Pelanggan
                                </span>
                            </div>
                            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg group-hover:scale-110 transition-transform duration-300 shrink-0">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4 pt-3">
                            <span className="text-xl font-bold text-emerald-600 tracking-tight font-mono block truncate">
                                {card.active_services}
                            </span>
                        </div>
                    </div>

                    {/* Card 3: Layanan Nonaktif */}
                    <div className="relative overflow-hidden bg-white border border-neutral-200/80 rounded-xl p-5 shadow-xs hover:shadow-md transition-all duration-300 group flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex flex-col space-y-1 overflow-hidden">
                                <span className="font-semibold text-neutral-400 uppercase text-xs tracking-wider truncate">
                                    Layanan Nonaktif
                                </span>
                                <span className="text-sm font-semibold text-neutral-700 truncate">
                                    Disembunyikan
                                </span>
                            </div>
                            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg group-hover:scale-110 transition-transform duration-300 shrink-0">
                                <XCircle className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4 pt-3">
                            <span className="text-xl font-bold text-rose-600 tracking-tight font-mono block truncate">
                                {card.inactive_services}
                            </span>
                        </div>
                    </div>

                    {/* Card 4: Rata-rata Harga */}
                    <div className="relative overflow-hidden bg-white border border-neutral-200/80 rounded-xl p-5 shadow-xs hover:shadow-md transition-all duration-300 group flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex flex-col space-y-1 overflow-hidden">
                                <span className="font-semibold text-neutral-400 uppercase text-xs tracking-wider truncate">
                                    Rata-rata Harga
                                </span>
                                <span className="text-sm font-semibold text-neutral-700 truncate">
                                    Tarif Layanan
                                </span>
                            </div>
                            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg group-hover:scale-110 transition-transform duration-300 shrink-0">
                                <Tag className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4 pt-3">
                            <span className="text-lg font-bold text-neutral-900 tracking-tight font-mono block truncate">
                                {formatRupiah(card.avg_price)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <InputGroup className="max-w-xs">
                        <InputGroupInput
                            placeholder="Cari pada tabel..."
                            value={globalFilter ?? ""}
                            onChange={(e) =>
                                setGlobalFilter?.(String(e.target.value))
                            }
                        />
                        <InputGroupAddon>
                            <Search className="w-4 h-4 text-muted-foreground" />
                        </InputGroupAddon>
                        {globalFilter && (
                            <InputGroupAddon align="inline-end">
                                <button
                                    type="button"
                                    onClick={() => setGlobalFilter?.("")}
                                    className="text-muted-foreground hover:text-foreground transition-colors p-1"
                                    aria-label="Clear search"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </InputGroupAddon>
                        )}
                    </InputGroup>

                    <DataTable
                        columns={columns}
                        data={services}
                        globalFilter={globalFilter}
                        setGlobalFilter={setGlobalFilter}
                    />
                </div>
            </div>
        </>
    );
}

Service.layout = {
    breadcrumbs: [
        {
            title: "Dashboard",
            href: dashboard(),
        },
        {
            title: "Layanan",
            href: index(),
        },
    ],
};
