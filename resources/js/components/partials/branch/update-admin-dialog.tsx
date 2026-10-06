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
import { BranchType, UserType } from "@/pages/branch";
import { useForm } from "@inertiajs/react";
import { toast } from "sonner";
import { SubmitEventHandler, useEffect, useState } from "react";
import { update } from "@/routes/admin";
import InputError from "@/components/input-error";

export const UpdateAdminDialog = ({
    admin,
    branches,
}: {
    admin: UserType;
    branches: BranchType[];
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const form = useForm({
        branch_id: admin.branch.id,
    });

    const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        form.patch(update.url(admin.id), {
            onSuccess: () => {
                toast.success(
                    `Cabang Operasional ${admin.name} berhasil diperbarui.`,
                );

                setIsOpen(false);
            },
            onError: (errors) => {
                console.log("Validation Errors:", errors);
                toast.error(`Gagal memperbarui data Cabang ${admin.name}.`);
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
                        <DialogTitle>Edit Admin</DialogTitle>
                        <DialogDescription>
                            Mengganti cabang operasional dari admin.
                        </DialogDescription>
                    </DialogHeader>

                    <FieldGroup>
                        <Field>
                            <Label htmlFor="branch_id">
                                Cabang Operasional
                            </Label>
                            <Select
                                value={String(form.data.branch_id)}
                                onValueChange={(value) =>
                                    form.setData("branch_id", Number(value))
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
                                                {`Cabang ${branch.name}`}
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
                            {form.processing ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
