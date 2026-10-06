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
import { BranchType } from "@/pages/branch";
import { useForm } from "@inertiajs/react";
import { toast } from "sonner";
import { SubmitEventHandler, useState } from "react";
import { update } from "@/routes/branches";
import InputError from "@/components/input-error";

export const UpdateBranchDialog = ({ branch }: { branch: BranchType }) => {
    const [isOpen, setIsOpen] = useState(false);

    const form = useForm({
        name: branch.name,
        address: branch.address,
        phone_number: branch.phone_number,
    });

    const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        form.patch(update.url(branch.id), {
            onSuccess: () => {
                toast.success(`Cabang berhasil diperbarui.`);

                setIsOpen(false);
            },
            onError: (errors) => {
                console.log("Validation Errors:", errors);
                toast.error(`Gagal memperbarui data cabang.`);
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
                        <DialogTitle>Edit Cabang</DialogTitle>
                        <DialogDescription>
                            Edit data cabang yang ada.
                        </DialogDescription>
                    </DialogHeader>

                    <FieldGroup>
                        <Field>
                            <Label htmlFor="name">Nama</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Tukad Badung"
                                value={form.data.name}
                                onChange={(e) =>
                                    form.setData("name", e.target.value)
                                }
                            />
                            <InputError message={form.errors.name} />
                        </Field>
                        <Field>
                            <Label htmlFor="address">Alamat</Label>
                            <Input
                                id="address"
                                name="address"
                                placeholder="Jalan Tukad Badung No. 50"
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
                                placeholder="085277778888"
                                type="tel"
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
                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
