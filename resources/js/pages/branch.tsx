import AdminStatusSwitch from "@/components/admin-status-switch";
import DataTable, { features } from "@/components/data-table";
import Heading from "@/components/heading";
import { CreateAdminDialog } from "@/components/partials/branch/create-admin-dialog";
import { CreateBranchDialog } from "@/components/partials/branch/create-branch-dialog";
import { UpdateAdminDialog } from "@/components/partials/branch/update-admin-dialog";
import { UpdateBranchDialog } from "@/components/partials/branch/update-branch-dialog";
import { dashboard } from "@/routes";
import { updateStatus as updateAdminStatus } from "@/routes/admin";
import { updateStatus as updateBranchStatus } from "@/routes/branches";
import { index } from "@/routes/branches";
import { BranchProps, BranchType, UserType } from "@/types/data-types";
import { Head, router } from "@inertiajs/react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import { useState } from "react";
import { Search, X } from "lucide-react";

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

export default function Branch({
    branches,
    branchOptionsCreate,
    branchOptionsUpdate,
    users,
}: BranchProps) {
    // Pisahkan state filter untuk masing-masing tabel
    const [adminFilter, setAdminFilter] = useState("");
    const [branchFilter, setBranchFilter] = useState("");

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
                            branches={branchOptionsUpdate}
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

                <div className="flex flex-col gap-4 mt-8">
                    {/* Tabel Data Admin */}
                    <div className="rounded-lg border border-neutral-200 p-4 flex flex-col gap-4 bg-white shadow-xs">
                        <div className="flex justify-between items-center">
                            <h2 className="font-bold text-neutral-800">
                                Data Admin
                            </h2>

                            <CreateAdminDialog branches={branchOptionsCreate} />
                        </div>
                        <InputGroup className="max-w-xs">
                            <InputGroupAddon>
                                <Search className="h-4 w-4 text-muted-foreground" />
                            </InputGroupAddon>
                            <InputGroupInput
                                placeholder="Cari admin..."
                                value={adminFilter}
                                onChange={(e) => setAdminFilter(e.target.value)}
                            />
                            {adminFilter && (
                                <InputGroupAddon align="inline-end">
                                    <button
                                        type="button"
                                        onClick={() => setAdminFilter("")}
                                        className="text-muted-foreground hover:text-foreground transition-colors p-1"
                                        aria-label="Clear search"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </InputGroupAddon>
                            )}
                        </InputGroup>
                        <div>
                            <DataTable
                                columns={adminColumns}
                                data={users}
                                globalFilter={adminFilter}
                                setGlobalFilter={setAdminFilter}
                            />
                        </div>
                    </div>

                    {/* Tabel Data Cabang */}
                    <div className="rounded-lg border border-neutral-200 p-4 flex flex-col gap-4 bg-white shadow-xs">
                        <div className="flex justify-between items-center">
                            <h2 className="font-bold text-neutral-800">
                                Data Cabang
                            </h2>

                            <CreateBranchDialog />
                        </div>
                        <InputGroup className="max-w-xs">
                            <InputGroupAddon>
                                <Search className="h-4 w-4 text-muted-foreground" />
                            </InputGroupAddon>
                            <InputGroupInput
                                placeholder="Cari cabang..."
                                value={branchFilter}
                                onChange={(e) =>
                                    setBranchFilter(e.target.value)
                                }
                            />
                            {branchFilter && (
                                <InputGroupAddon align="inline-end">
                                    <button
                                        type="button"
                                        onClick={() => setBranchFilter("")}
                                        className="text-muted-foreground hover:text-foreground transition-colors p-1"
                                        aria-label="Clear search"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </InputGroupAddon>
                            )}
                        </InputGroup>
                        <div>
                            <DataTable
                                columns={branchColumns}
                                data={branchOptionsUpdate}
                                globalFilter={branchFilter}
                                setGlobalFilter={setBranchFilter}
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
