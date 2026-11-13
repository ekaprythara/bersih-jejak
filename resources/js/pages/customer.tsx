import CustomerStatusSwitch from "@/components/customer-status-switch";
import DataTable, { features } from "@/components/data-table";
import Heading from "@/components/heading";
import { CreateCustomerDialog } from "@/components/partials/customer/create-customer-dialog";
import { dashboard } from "@/routes";
import { index } from "@/routes/branches";
import { updateStatus } from "@/routes/customers";
import { Head, router } from "@inertiajs/react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import type { CustomerType } from "@/types/data-types";
import { UpdateCustomerDialog } from "@/components/partials/customer/update-customer-dialog";
import { Badge } from "@/components/ui/badge";
import {
    Award,
    FileText,
    Repeat,
    Search,
    UserPlus,
    Users,
    X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";

const handleStatusChange = (id: number, newStatus: boolean) => {
    router.patch(
        updateStatus.url(id),
        {
            status: newStatus,
        },
        {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Status pelanggan berhasil diubah.");
            },
        },
    );
};

export default function Customer({
    customers,
    card,
}: {
    customers: CustomerType[];
    card: {
        total_customers: number;
        new_customers: number;
        loyal_customers: number;
        avg_transactions: number;
    };
}) {
    const [globalFilter, setGlobalFilter] = useState("");

    const columns: ColumnDef<typeof features, CustomerType>[] = [
        {
            header: "Nama",
            accessorKey: "name",
            cell: ({ row }) => (
                <span className="font-medium">{row.original.name}</span>
            ),
        },
        {
            header: "No. Telepon",
            accessorKey: "phone_number",
            cell: ({ row }) => {
                const phone = row.original.phone_number;
                return (
                    <span className="font-mono text-xs">{phone ?? "-"}</span>
                );
            },
        },
        {
            header: "Bergabung pada",
            accessorFn: (row: CustomerType) => {
                if (!row.created_at) return "-";
                const date = new Date(row.created_at);
                if (isNaN(date.getTime())) return "-";

                const day = String(date.getDate()).padStart(2, "0");
                const month = String(date.getMonth() + 1).padStart(2, "0"); // +1 karena getMonth() mulai dari 0
                const year = date.getFullYear();

                return `${day}-${month}-${year}`;
            },
            cell: ({ row }) => {
                const createdAt = row.original.created_at;
                if (!createdAt)
                    return <span className="font-mono text-xs">-</span>;
                const date = new Date(createdAt);
                if (isNaN(date.getTime()))
                    return <span className="font-mono text-xs">-</span>;

                const day = String(date.getDate()).padStart(2, "0");
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const year = date.getFullYear();

                return (
                    <span className="font-mono text-xs">{`${day}-${month}-${year}`}</span>
                );
            },
        },
        {
            header: "Total Transaksi",
            accessorKey: "transactions",
            cell: ({ row }) => {
                const transactionCount = row.original.transactions?.length ?? 0;

                return (
                    <Badge variant="secondary" className="font-mono text-xs">
                        {transactionCount}x Transaksi
                    </Badge>
                );
            },
        },
        {
            header: "Status",
            cell: ({ row }) => {
                return (
                    <CustomerStatusSwitch
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
                        <UpdateCustomerDialog customer={row.original} />
                    </div>
                );
            },
        },
    ];

    return (
        <>
            <Head title="Pelanggan" />

            <div className="p-4">
                <div className="flex flex-col md:flex-row items-start gap-4 md:items-center md:justify-between mb-8">
                    <Heading
                        title="Pelanggan"
                        description="Halaman untuk mengelola data pelanggan."
                    />

                    <CreateCustomerDialog />
                </div>

                {/* Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full mb-6">
                    {/* 1. Total Anggota */}
                    <div className="relative overflow-hidden bg-white border border-neutral-200/80 rounded-xl p-5 shadow-xs hover:shadow-md transition-all duration-300 group flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex flex-col space-y-1 overflow-hidden">
                                <span className="font-semibold text-neutral-400 uppercase text-xs tracking-wider truncate">
                                    Total Anggota
                                </span>
                                <span className="text-sm text-neutral-700 font-semibold truncate">
                                    Keseluruhan
                                </span>
                            </div>
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform duration-300 shrink-0">
                                <Users className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4 pt-3">
                            <span className="text-xl font-bold text-neutral-900 tracking-tight font-mono block truncate">
                                {card.total_customers}
                            </span>
                        </div>
                    </div>

                    {/* 2. Anggota Baru */}
                    <div className="relative overflow-hidden bg-white border border-neutral-200/80 rounded-xl p-5 shadow-xs hover:shadow-md transition-all duration-300 group flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex flex-col space-y-1 overflow-hidden">
                                <span className="font-semibold text-neutral-400 uppercase text-xs tracking-wider truncate">
                                    Anggota Baru
                                </span>
                                <span className="text-sm text-neutral-700 font-semibold truncate">
                                    7 Hari Terakhir
                                </span>
                            </div>
                            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg group-hover:scale-110 transition-transform duration-300 shrink-0">
                                <UserPlus className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4 pt-3">
                            <span className="text-xl font-bold text-emerald-600 tracking-tight font-mono block truncate">
                                +{card.new_customers}
                            </span>
                        </div>
                    </div>

                    {/* 3. Loyalitas / Pelanggan Setia */}
                    <div className="relative overflow-hidden bg-white border border-neutral-200/80 rounded-xl p-5 shadow-xs hover:shadow-md transition-all duration-300 group flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex flex-col space-y-1 overflow-hidden">
                                <span className="font-semibold text-neutral-400 uppercase text-xs tracking-wider truncate">
                                    Loyalitas
                                </span>
                                <span className="text-sm font-semibold text-neutral-700 truncate">
                                    Pelanggan Setia
                                </span>
                            </div>
                            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg group-hover:scale-110 transition-transform duration-300 shrink-0">
                                <Award className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4 pt-3">
                            <span className="text-xl font-bold text-neutral-900 tracking-tight font-mono block truncate">
                                {card.loyal_customers}
                            </span>
                        </div>
                    </div>

                    {/* 4. Rata-rata Transaksi */}
                    <div className="relative overflow-hidden bg-white border border-neutral-200/80 rounded-xl p-5 shadow-xs hover:shadow-md transition-all duration-300 group flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex flex-col space-y-1 overflow-hidden">
                                <span className="font-semibold text-neutral-400 uppercase text-xs tracking-wider truncate">
                                    Transaksi
                                </span>
                                <span className="text-sm font-semibold text-neutral-700 truncate">
                                    Rata-rata per orang
                                </span>
                            </div>
                            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg group-hover:scale-110 transition-transform duration-300 shrink-0">
                                <Repeat className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4 pt-3">
                            <span className="text-xl font-bold text-neutral-900 tracking-tight font-mono block truncate">
                                {card.avg_transactions}
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
                        data={customers}
                        globalFilter={globalFilter}
                        setGlobalFilter={setGlobalFilter}
                    />
                </div>
            </div>
        </>
    );
}

Customer.layout = {
    breadcrumbs: [
        {
            title: "Dashboard",
            href: dashboard(),
        },
        {
            title: "Pelanggan",
            href: index(),
        },
    ],
};
