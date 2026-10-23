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

export default function Service({ services }: { services: ServiceType[] }) {
    const columns: ColumnDef<typeof features, ServiceType>[] = [
        {
            header: "Nama",
            accessorKey: "name",
        },
        {
            header: "Harga",
            accessorKey: "price",
        },
        {
            header: "Estimasi Waktu (Hari)",
            accessorKey: "estimated_days",
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
                <Heading
                    title="Layanan"
                    description="Halaman untuk mengelola data pelanggan."
                />

                <div className="flex flex-col gap-4">
                    <div className="flex justify-end items-center">
                        <CreateServiceDialog />
                    </div>

                    <DataTable columns={columns} data={services} />
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
