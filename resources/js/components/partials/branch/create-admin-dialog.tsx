import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BranchType } from "@/pages/branch";
import { useForm } from "@inertiajs/react";
import { toast } from "sonner";
import { SubmitEventHandler, useState } from "react";
import { store } from "@/routes/admin";
import InputError from "@/components/input-error";

export const CreateAdminDialog = ({ branches }: { branches: BranchType[] }) => {
    const [isOpen, setIsOpen] = useState(false);

    const form = useForm({
        name: "",
        username: "",
        address: "",
        phone_number: "",
        email: "",
        branch_id: "",
    });

    const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        form.post(store.url(), {
            onSuccess: () => {
                toast.success("Admin berhasil ditambahkan.");
                form.reset();
                setIsOpen(false);
            },
            onError: (errors) => {
                console.log("Validation Errors:", errors);
                toast.error("Gagal menyimpan data admin.");
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>Tambah Admin</Button>
            </DialogTrigger>

            <DialogContent>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <DialogHeader>
                        <DialogTitle>Tambah Admin</DialogTitle>
                        <DialogDescription>
                            Menambahkan admin baru ke dalam sistem, dan tentukan
                            cabang operasionalnya.
                        </DialogDescription>
                    </DialogHeader>

                    <FieldGroup>
                        <div className="grid grid-cols-2 gap-4">
                            <Field>
                                <Label htmlFor="name">Nama</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="Budi Santoso"
                                    value={form.data.name}
                                    onChange={(e) =>
                                        form.setData("name", e.target.value)
                                    }
                                />
                                <InputError message={form.errors.name} />
                            </Field>
                            <Field>
                                <Label htmlFor="username">Nama Pengguna</Label>
                                <Input
                                    id="username"
                                    name="username"
                                    placeholder="budisantoso"
                                    value={form.data.username}
                                    onChange={(e) =>
                                        form.setData("username", e.target.value)
                                    }
                                />
                                <InputError message={form.errors.username} />
                            </Field>
                        </div>
                        <Field>
                            <Label htmlFor="address">Alamat</Label>
                            <Input
                                id="address"
                                name="address"
                                placeholder="Jl. Raya Tuban No. 100X"
                                value={form.data.address}
                                onChange={(e) =>
                                    form.setData("address", e.target.value)
                                }
                            />
                            <InputError message={form.errors.address} />
                        </Field>
                        <Field>
                            <Label htmlFor="phone_number">No. Telepon</Label>
                            <Input
                                id="phone_number"
                                name="phone_number"
                                type="tel"
                                placeholder="085588885555"
                                value={form.data.phone_number}
                                onChange={(e) =>
                                    form.setData("phone_number", e.target.value)
                                }
                            />
                            <InputError message={form.errors.phone_number} />
                        </Field>
                        <Field>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Contoh: budi@mail.com"
                                value={form.data.email}
                                onChange={(e) =>
                                    form.setData("email", e.target.value)
                                }
                            />
                            <InputError message={form.errors.email} />
                        </Field>
                        <Field>
                            <Label htmlFor="branch_id">Cabang Penempatan</Label>
                            <Select
                                value={form.data.branch_id}
                                onValueChange={(value) =>
                                    form.setData("branch_id", value)
                                }
                            >
                                <SelectTrigger
                                    id="branch_id"
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Pilih Cabang..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
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
                            <InputError message={form.errors.branch_id} />
                        </Field>
                    </FieldGroup>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? "Menyimpan..." : "Tambah"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
