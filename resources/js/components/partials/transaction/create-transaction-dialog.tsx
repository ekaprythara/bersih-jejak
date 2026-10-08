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
import { useForm } from "@inertiajs/react";
import { toast } from "sonner";
import { SubmitEventHandler, useState } from "react";
import { store } from "@/routes/admin";
import InputError from "@/components/input-error";
import { BranchType, CustomerType } from "@/types/data-types";
import { Textarea } from "@/components/ui/textarea";
import { CreateCustomerDialog } from "../customer/create-customer-dialog";

export const CreateTransactionDialog = ({
    customers,
}: {
    customers: CustomerType[];
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const form = useForm({
        customer_id: "",
        transaction_date: "",
        pickup_date: "",
        service_id: "",
        transaction_status_id: "",
        payment_status_id: "",
        description: "",
        beforeImage: null as File | null,
        afterImage: null as File | null,
    });

    const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        // form.post(store.url(), {
        //     onSuccess: () => {
        //         toast.success("Admin berhasil ditambahkan.");
        //         form.reset();
        //         setIsOpen(false);
        //     },
        //     onError: (errors) => {
        //         console.log("Validation Errors:", errors);
        //         toast.error("Gagal menyimpan data admin.");
        //     },
        // });
        console.log(form.data);
    };
    const frameworks = ["Next.js", "SvelteKit", "Nuxt.js", "Remix", "Astro"];

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>Tambah Transaksi</Button>
            </DialogTrigger>

            <DialogContent>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <DialogHeader>
                        <DialogTitle>Tambah Transaksi</DialogTitle>
                        <DialogDescription>
                            Menambahkan transaksi baru ke dalam sistem, dan
                            tentukan cabang operasionalnya.
                        </DialogDescription>
                    </DialogHeader>

                    <FieldGroup>
                        <Field>
                            <Label htmlFor="customer_id">
                                Pilih Pelanggan...
                            </Label>

                            <Select
                                value={form.data.customer_id}
                                onValueChange={(value) =>
                                    form.setData("customer_id", value)
                                }
                            >
                                <SelectTrigger
                                    id="customer_id"
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Pilih Pelanggan..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {customers.map((customer) => (
                                            <SelectItem
                                                key={customer.id}
                                                value={String(customer.id)}
                                            >
                                                {customer.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>

                            <InputError message={form.errors.customer_id} />
                        </Field>

                        <CreateCustomerDialog btnTitle="Tambah Pelanggan Baru" />

                        <Field>
                            <Label htmlFor="description">Deskripsi</Label>
                            <Textarea
                                id="description"
                                placeholder="SSS"
                                value={form.data.description}
                                onChange={(e) =>
                                    form.setData("description", e.target.value)
                                }
                            />
                            <InputError message={form.errors.description} />
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
