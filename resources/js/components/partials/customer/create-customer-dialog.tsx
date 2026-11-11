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
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "@inertiajs/react";
import { toast } from "sonner";
import { useState } from "react";
import { store } from "@/routes/customers";
import InputError from "@/components/input-error";

export const CreateCustomerDialog = ({
    btnTitle = "Tambah Pelanggan",
}: {
    btnTitle?: string;
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const form = useForm({
        name: "",
        phone_number: "",
    });

    const handleSubmit = () => {
        form.post(store.url(), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Pelanggan berhasil ditambahkan.");
                form.reset();
                setIsOpen(false);
            },
            onError: (errors) => {
                console.log("Validation Errors:", errors);
                toast.error("Gagal menyimpan data pelanggan.");
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {/* Gunakan type="button" agar tidak mentrigger form luar */}
                <Button type="button" className="border-dashed">
                    {btnTitle}
                </Button>
            </DialogTrigger>

            <DialogContent>
                {/* Cegah default submit dengan e.preventDefault() pada onsubmit */}
                <form
                    onSubmit={(e) => e.preventDefault()}
                    className="flex flex-col gap-4"
                >
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
                    </FieldGroup>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </DialogClose>
                        {/* Panggil handleSubmit lewat onClick dan set type="button" */}
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={form.processing}
                        >
                            {form.processing ? "Menyimpan..." : "Tambah"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
