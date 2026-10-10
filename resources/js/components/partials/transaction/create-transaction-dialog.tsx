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

import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox";

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

                            <Combobox
                                items={customers.map((customers) => ({
                                    label: customers.name,
                                    value: customers.id,
                                }))}
                                onValueChange={(
                                    customer: {
                                        label: string;
                                        value: string;
                                    } | null,
                                ) =>
                                    form.setData(
                                        "customer_id",
                                        customer?.value ?? "",
                                    )
                                }
                            >
                                <ComboboxInput placeholder="Pilih Pelanggan" />
                                <ComboboxContent className="pointer-events-auto">
                                    <ComboboxEmpty>
                                        Tidak ada data.
                                    </ComboboxEmpty>
                                    <ComboboxList>
                                        {(customer) => (
                                            <ComboboxItem
                                                key={customer.value}
                                                value={customer}
                                            >
                                                {customer.label}
                                            </ComboboxItem>
                                        )}
                                    </ComboboxList>
                                </ComboboxContent>
                            </Combobox>

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
