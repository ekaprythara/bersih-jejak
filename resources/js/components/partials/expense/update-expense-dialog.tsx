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
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "@inertiajs/react";
import { toast } from "sonner";
import { SubmitEventHandler, useState } from "react";
import InputError from "@/components/input-error";
import { CustomerType, ServiceType } from "@/types/data-types";
import { Input } from "@/components/ui/input";
import { update } from "@/routes/services";

export const UpdateServiceDialog = ({ service }: { service: ServiceType }) => {
    const [isOpen, setIsOpen] = useState(false);

    const form = useForm({
        name: service.name,
        price: service.price,
        estimated_days: service.estimated_days,
    });

    const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        form.patch(update.url(service.id), {
            onSuccess: () => {
                toast.success(` ${service.name} berhasil diperbarui.`);

                setIsOpen(false);
            },
            onError: (errors) => {
                console.log("Validation Errors:", errors);
                toast.error(`Gagal memperbarui data Cabang ${service.name}.`);
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
                        <DialogTitle>Edit Layanan</DialogTitle>
                        <DialogDescription>
                            Menambahkan layanan baru ke dalam sistem.
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
                            <Label htmlFor="price">Harga (Rp.)</Label>
                            <Input
                                id="price"
                                name="price"
                                placeholder="25000"
                                type="number"
                                min={0}
                                step={1000}
                                value={form.data.price}
                                onChange={(e) =>
                                    form.setData(
                                        "price",
                                        Number(e.target.value),
                                    )
                                }
                            />
                            <InputError message={form.errors.price} />
                        </Field>
                        <Field>
                            <Label htmlFor="estimated_days">
                                Estimasi (Hari)
                            </Label>
                            <Input
                                id="estimated_days"
                                name="estimated_days"
                                placeholder="5"
                                type="number"
                                min={0}
                                step={1}
                                value={form.data.estimated_days}
                                onChange={(e) =>
                                    form.setData(
                                        "estimated_days",
                                        Number(e.target.value),
                                    )
                                }
                            />
                            <InputError message={form.errors.estimated_days} />
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
