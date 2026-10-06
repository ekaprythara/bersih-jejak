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

export default function Customer({ customers }: { customers: CustomerType[] }) {
    const columns: ColumnDef<typeof features, CustomerType>[] = [
        {
            header: "Nama",
            accessorKey: "name",
        },
        {
            header: "No. Telepon",
            accessorKey: "phone_number",
        },
        {
            header: "Bergabung pada",
            accessorFn: (row: CustomerType) => {
                const date = new Date(row.created_at);

                if (!date) return "-";

                const day = String(date.getDate()).padStart(2, "0");
                const month = String(date.getMonth()).padStart(2, "0");
                const year = date.getFullYear();

                return `${day}-${month}-${year}`;
            },
        },
        {
            header: "Total Transaksi",
            accessorKey: "#",
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
                <Heading
                    title="Pelanggan"
                    description="Halaman untuk mengelola data pelanggan."
                />

                <div className="flex flex-col gap-4">
                    <div className="flex justify-end items-center">
                        <CreateCustomerDialog />
                    </div>
                    <DataTable columns={columns} data={customers} />
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
