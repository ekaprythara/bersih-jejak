import AdminStatusSwitch from "@/components/admin-status-switch";
import DataTable, { features } from "@/components/data-table";
import Heading from "@/components/heading";
import { CreateAdminDialog } from "@/components/partials/branch/create-admin-dialog";
import { CreateBranchDialog } from "@/components/partials/branch/create-branch-dialog";
import { UpdateAdminDialog } from "@/components/partials/branch/update-admin-dialog";
import { UpdateBranchDialog } from "@/components/partials/branch/update-branch-dialog";
import { Button } from "@/components/ui/button";
import { dashboard } from "@/routes";
import { updateStatus as updateAdminStatus } from "@/routes/admin";
import { updateStatus as updateBranchStatus } from "@/routes/branches";
import { index } from "@/routes/branches";
import { BranchProps, BranchType, UserType } from "@/types/data-types";
import { Head, router } from "@inertiajs/react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

const handleAdminStatusChange = (id: number, newStatus: boolean) => {
    router.patch(
        updateAdminStatus.url(id),
        {
            status: newStatus,
        },
        {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Status berhasil diubah.");
            },
        },
    );
};

const handleBranchStatusChange = (id: number, newStatus: boolean) => {
    router.patch(
        updateBranchStatus.url(id),
        {
            status: newStatus,
        },
        {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Status berhasil diubah.");
            },
        },
    );
};

export default function Branch({ branches, users }: BranchProps) {
    const adminColumns: ColumnDef<typeof features, UserType>[] = [
        {
            header: "Nama",
            accessorKey: "name",
        },
        {
            header: "Nama Pengguna",
            accessorKey: "username",
        },
        {
            header: "Cabang",
            accessorFn: (row: UserType) => {
                return row.branch ? `Cabang ${row.branch.name}` : "-";
            },
        },
        {
            header: "Status",
            cell: ({ row }) => {
                return (
                    <AdminStatusSwitch
                        checked={row.original.status}
                        onCheckedChange={() =>
                            handleAdminStatusChange(
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
                    <div className="flex justify-center items-center gap-1">
                        <UpdateAdminDialog
                            admin={row.original}
                            branches={branches}
                        />
                    </div>
                );
            },
        },
    ];

    const branchColumns: ColumnDef<typeof features, BranchType>[] = [
        {
            header: "Nama",
            accessorFn: (row) => {
                const branch = row;

                return `Cabang ${branch.name}`;
            },
        },
        {
            header: "Alamat",
            accessorKey: "address",
        },
        {
            header: "Status",
            cell: ({ row }) => {
                return (
                    <AdminStatusSwitch
                        checked={row.original.status}
                        onCheckedChange={() =>
                            handleBranchStatusChange(
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
                        <UpdateBranchDialog branch={row.original} />
                    </div>
                );
            },
        },
    ];
    return (
        <>
            <Head title="Admin & Cabang" />

            <div className="p-4">
                <Heading
                    title="Admin & Cabang"
                    description="Halaman untuk mengelola data cabang dari pengguna."
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                    <div className="rounded-lg border border-neutral-200 p-4 flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <h2 className="font-bold text-neutral-800">
                                Data Admin
                            </h2>

                            <CreateAdminDialog branches={branches} />
                        </div>

                        <div>
                            <DataTable columns={adminColumns} data={users} />
                        </div>
                    </div>

                    <div className="rounded-lg border border-neutral-200 p-4 flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <h2 className="font-bold text-neutral-800">
                                Data Cabang
                            </h2>

                            <CreateBranchDialog />
                        </div>

                        <div>
                            <DataTable
                                columns={branchColumns}
                                data={branches}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Branch.layout = {
    breadcrumbs: [
        {
            title: "Dashboard",
            href: dashboard(),
        },
        {
            title: "Admin & Cabang",
            href: index(),
        },
    ],
};
