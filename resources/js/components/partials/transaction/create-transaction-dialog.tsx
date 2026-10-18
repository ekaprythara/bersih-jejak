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
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "@inertiajs/react";
import { toast } from "sonner";
import { SubmitEventHandler, useState, ChangeEvent } from "react";
import { store } from "@/routes/transactions";
import InputError from "@/components/input-error";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    BranchType,
    CustomerType,
    PaymentMethodType,
    PaymentStatusType,
    ServiceType,
} from "@/types/data-types";
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
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";

export const CreateTransactionDialog = ({
    customers,
    services,
    branches,
    paymentMethods,
    paymentStatuses,
}: {
    customers: CustomerType[];
    services: ServiceType[];
    branches: BranchType[];
    paymentMethods: PaymentMethodType[];
    paymentStatuses: PaymentStatusType[];
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const today = new Date();
    const { isOwner } = useAuth();

    const [transactionDate, setTransactionDate] = useState<Date | undefined>(
        today,
    );
    const [pickupDate, setPickupDate] = useState<Date | undefined>();
    const [previewImage, setPreviewImage] = useState<string>();

    const form = useForm({
        customer_id: "",
        transaction_date: today.toISOString().split("T")[0],
        pickup_date: "",
        service_id: "",
        shoe_count: "1",
        total_amount: "",
        branch_id: "",
        payment_method_id: "",
        transaction_status_id: "",
        payment_status_id: "",
        description: "",
        image: null as File | null,
    });
    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            form.setData("image", file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleDateSelect = (selectedDate: Date | undefined) => {
        setPickupDate(selectedDate);
        if (selectedDate) {
            // Format ke YYYY-MM-DD agar sesuai dengan tipe date MySQL
            form.setData("pickup_date", format(selectedDate, "yyyy-MM-dd"));
        } else {
            form.setData("pickup_date", "");
        }
    };

    const setTotalAmount = () => {
        const serviceId = Number(form.data.service_id);
        const qty = Number(form.data.shoe_count);

        const selectedService = services.find(
            (service) => service.id === serviceId,
        );
        const price = selectedService ? Number(selectedService.price) : 0;

        return price * qty;
    };

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
        // console.log(form.data);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>Tambah Transaksi</Button>
            </DialogTrigger>

            <DialogContent className="overflow-y-scroll scrollbar-none scroll-smooth max-h-[95dvh]">
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
                                items={customers}
                                onValueChange={(
                                    customer: CustomerType | null,
                                ) =>
                                    form.setData(
                                        "customer_id",
                                        customer?.id.toString() ?? "",
                                    )
                                }
                                itemToStringLabel={(customer: CustomerType) =>
                                    customer.name
                                }
                            >
                                <ComboboxInput
                                    placeholder="Pilih Pelanggan"
                                    showClear
                                />
                                <ComboboxContent className="pointer-events-auto">
                                    <ComboboxEmpty>
                                        Tidak ada data.
                                    </ComboboxEmpty>
                                    <ComboboxList>
                                        {(customer) => (
                                            <ComboboxItem
                                                key={customer.id}
                                                value={customer}
                                            >
                                                {customer.name}
                                            </ComboboxItem>
                                        )}
                                    </ComboboxList>
                                </ComboboxContent>
                            </Combobox>

                            <InputError message={form.errors.customer_id} />
                        </Field>

                        <CreateCustomerDialog btnTitle="Tambah Pelanggan Baru" />

                        {isOwner && (
                            <Field>
                                <Label htmlFor="branch_id">
                                    Pilih Cabang...
                                </Label>
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
                        )}

                        <Field>
                            <Label htmlFor="service_id">Pilih Layanan</Label>

                            <Select
                                value={form.data.service_id}
                                onValueChange={(value) =>
                                    form.setData("service_id", value)
                                }
                            >
                                <SelectTrigger
                                    id="service_id"
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Pilih Layanan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {services.map((service) => (
                                            <SelectItem
                                                key={service.id}
                                                value={service.id.toString()}
                                            >
                                                {service.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>

                            <InputError message={form.errors.service_id} />
                        </Field>

                        <div className="grid grid-cols-2 gap-4">
                            <Field>
                                <Label htmlFor="shoe_count">
                                    Jumlah Sepatu (Pasang)
                                </Label>

                                <Input
                                    id="shoe_count"
                                    type="number"
                                    step={1}
                                    min={1}
                                    value={form.data.shoe_count}
                                    onChange={(e) =>
                                        form.setData(
                                            "shoe_count",
                                            e.target.value,
                                        )
                                    }
                                />

                                <InputError message={form.errors.shoe_count} />
                            </Field>

                            <Field>
                                <Label htmlFor="total_amount">
                                    Harga Total
                                </Label>

                                <Input
                                    id="total_amount"
                                    type="number"
                                    disabled
                                    value={setTotalAmount()}
                                />

                                <InputError
                                    message={form.errors.total_amount}
                                />
                            </Field>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Field>
                                <Label htmlFor="payment_method_id">
                                    Metode Pembayaran
                                </Label>

                                <Select
                                    value={form.data.payment_method_id}
                                    onValueChange={(value) =>
                                        form.setData("payment_method_id", value)
                                    }
                                >
                                    <SelectTrigger
                                        id="payment_method_id"
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Metode Pembayaran" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {paymentMethods.map(
                                                (paymentMethod) => (
                                                    <SelectItem
                                                        key={paymentMethod.id}
                                                        value={paymentMethod.id.toString()}
                                                    >
                                                        {paymentMethod.name}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>

                                <InputError
                                    message={form.errors.payment_method_id}
                                />
                            </Field>

                            <Field>
                                <Label htmlFor="payment_status">
                                    Status Pembayaran
                                </Label>

                                <Select
                                    value={form.data.payment_status_id}
                                    onValueChange={(value) =>
                                        form.setData("payment_status_id", value)
                                    }
                                >
                                    <SelectTrigger
                                        id="payment_status"
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Status Pembayaran" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {paymentStatuses.map(
                                                (paymentStatus) => (
                                                    <SelectItem
                                                        key={paymentStatus.id}
                                                        value={paymentStatus.id.toString()}
                                                    >
                                                        {paymentStatus.name}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>

                                <InputError
                                    message={form.errors.payment_status_id}
                                />
                            </Field>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Field>
                                <Label htmlFor="expense_date">
                                    Tanggal Transaksi
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild disabled>
                                        <Button
                                            variant="outline"
                                            className="justify-start text-left font-normal data-[empty=true]:text-muted-foreground w-full"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {today ? (
                                                format(today, "dd-MM-yyyy")
                                            ) : (
                                                <span>Pilih Tanggal</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={today}
                                            disabled
                                        />
                                    </PopoverContent>
                                </Popover>
                                <InputError
                                    message={form.errors.transaction_date}
                                />
                            </Field>

                            <Field>
                                <Label htmlFor="pickup_date">
                                    Tanggal Diambil
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            data-empty={!pickupDate}
                                            className="justify-start text-left font-normal data-[empty=true]:text-muted-foreground w-full"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {pickupDate ? (
                                                format(pickupDate, "dd-MM-yyyy")
                                            ) : (
                                                <span>Pilih Tanggal</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={pickupDate}
                                            onSelect={handleDateSelect}
                                            disabled={(date) => date < today}
                                        />
                                    </PopoverContent>
                                </Popover>
                                <InputError message={form.errors.pickup_date} />
                            </Field>
                        </div>

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

                        <Field>
                            <Label htmlFor="before_image">
                                Foto Sepatu (Sebelum)
                            </Label>
                            <div className="mt-2 w-full">
                                <label
                                    htmlFor="image"
                                    className="group relative flex min-h-40 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-2 text-center transition-all hover:border-gray-400 hover:bg-gray-50"
                                >
                                    {!previewImage ? (
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white shadow-xs transition-colors group-hover:border-gray-400">
                                                <svg
                                                    className="h-6 w-6 text-gray-400 transition-colors group-hover:text-gray-600"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                                                    />
                                                </svg>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <p className="text-xs font-medium text-gray-600">
                                                    Pilih gambar atau
                                                    drag-and-drop di sini.
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    PNG, JPG, dan WEBP <br />
                                                    Maks. 5 MB
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative w-full overflow-hidden rounded-xl border border-gray-100 bg-white p-2">
                                            <img
                                                src={previewImage}
                                                alt="Preview Bukti"
                                                className="h-44 w-full object-contain"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                                <span className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm">
                                                    Klik untuk mengganti
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    <input
                                        id="image"
                                        type="file"
                                        name="image"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </label>
                            </div>
                            <InputError message={form.errors.image} />
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
