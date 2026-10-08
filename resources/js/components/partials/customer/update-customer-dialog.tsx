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
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "@inertiajs/react";
import { toast } from "sonner";
import { SubmitEventHandler, useState } from "react";
import { update } from "@/routes/customers";
import InputError from "@/components/input-error";
import { CustomerType } from "@/types/data-types";
import { Input } from "@/components/ui/input";

export const UpdateCustomerDialog = ({
    customer,
}: {
    customer: CustomerType;
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const form = useForm({
        name: customer.name,
        phone_number: customer.phone_number,
        email: customer.email,
    });

    const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        form.patch(update.url(customer.id), {
            onSuccess: () => {
                toast.success(` ${customer.name} berhasil diperbarui.`);

                setIsOpen(false);
            },
            onError: (errors) => {
                console.log("Validation Errors:", errors);
                toast.error(`Gagal memperbarui data Cabang ${customer.name}.`);
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>Edit</Button>
            </DialogTrigger>

            <DialogContent>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <DialogHeader>
                        <DialogTitle>Tambah Pelanggan</DialogTitle>
                        <DialogDescription>
                            Menambahkan pelanggan baru ke dalam sistem.
                        </DialogDescription>
                    </DialogHeader>

                    <FieldGroup>
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
                    </FieldGroup>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
