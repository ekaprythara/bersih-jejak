import React from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
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
import { SubmitEventHandler, useState, ChangeEvent, useEffect } from "react";
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
import { CalendarIcon, ImagePlus, AlertTriangleIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const CreateTransactionDialog = ({
    customers,
    services,
    branches,
    paymentMethods,
}: {
    customers: CustomerType[];
    services: ServiceType[];
    branches: BranchType[];
    paymentMethods: PaymentMethodType[];
    paymentStatuses?: PaymentStatusType[];
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const today = new Date();
    const { isOwner } = useAuth();
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
        discount: "",
        payment_method_id: "",
        transaction_status_id: "",
        description: "",
        image_before: null as File | null,
    });

    useEffect(() => {
        if (form.data.service_id) {
            const selectedService = services.find(
                (service) => service.id.toString() === form.data.service_id,
            );
            if (selectedService && selectedService.estimated_days) {
                const calculatedPickupDate = addDays(
                    today,
                    Number(selectedService.estimated_days),
                );
                setPickupDate(calculatedPickupDate);
                form.setData(
                    "pickup_date",
                    format(calculatedPickupDate, "yyyy-MM-dd"),
                );
            }
        }
    }, [form.data.service_id, services]);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setData("image_before", file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleDateSelect = (selectedDate: Date | undefined) => {
        setPickupDate(selectedDate);
        if (selectedDate) {
            form.setData("pickup_date", format(selectedDate, "yyyy-MM-dd"));
        } else {
            form.setData("pickup_date", "");
        }
    };

    const calculateSubtotal = () => {
        const serviceId = Number(form.data.service_id);
        const qty = Number(form.data.shoe_count) || 0;
        const selectedService = services.find(
            (service) => service.id === serviceId,
        );
        const price = selectedService ? Number(selectedService.price) : 0;
        return price * qty;
    };

    const getTotalAmount = () => {
        const subtotal = calculateSubtotal();
        const discount = Number(form.data.discount) || 0;
        return Math.max(0, subtotal - discount);
    };

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        form.post(store.url(), {
            forceFormData: true,
            onSuccess: () => {
                toast.success("Transaksi berhasil ditambahkan.");
                form.reset();
                setPickupDate(undefined);
                setPreviewImage(undefined);
                setIsOpen(false);
            },
            onError: (errors) => {
                console.log("ValidationErrors:", errors);
                toast.error("Gagal menyimpan data transaksi.");
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <span className="font-semibold">Tambah Transaksi</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl overflow-y-auto scrollbar-none overscroll-contain max-h-[92dvh]">
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-1 border-b pb-4">
                        <h2 className="text-lg font-semibold text-foreground">
                            Tambah Transaksi Baru
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Menambahkan transaksi baru ke dalam sistem, dan
                            tentukan cabang operasionalnya.
                        </p>
                    </div>

                    <FieldGroup className="flex flex-col gap-5">
                        {/* 1. Pelanggan & Cabang */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field
                                data-invalid={!!form.errors.customer_id}
                                className="sm:col-span-2"
                            >
                                <Label htmlFor="customer_id">Pelanggan</Label>
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                    <div className="flex-1">
                                        <Combobox
                                            items={customers}
                                            onValueChange={(
                                                customer: CustomerType | null,
                                            ) =>
                                                form.setData(
                                                    "customer_id",
                                                    customer?.id.toString() ??
                                                        "",
                                                )
                                            }
                                            itemToStringLabel={(
                                                customer: CustomerType,
                                            ) => customer.name}
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
                                    </div>
                                    <div className="shrink-0">
                                        <CreateCustomerDialog btnTitle="Tambah Pelanggan Baru" />
                                    </div>
                                </div>
                                <InputError message={form.errors.customer_id} />
                            </Field>
                        </div>

                        {isOwner && (
                            <Field data-invalid={!!form.errors.branch_id}>
                                <Label htmlFor="branch_id">Pilih Cabang</Label>
                                <Select
                                    value={form.data.branch_id}
                                    onValueChange={(value) =>
                                        form.setData("branch_id", value)
                                    }
                                >
                                    <SelectTrigger
                                        id="branch_id"
                                        className="w-full"
                                        aria-invalid={!!form.errors.branch_id}
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

                        {/* 2. Layanan & Jumlah Sepatu */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field data-invalid={!!form.errors.service_id}>
                                <Label htmlFor="service_id">
                                    Pilih Layanan
                                </Label>
                                <Select
                                    value={form.data.service_id}
                                    onValueChange={(value) =>
                                        form.setData("service_id", value)
                                    }
                                >
                                    <SelectTrigger
                                        id="service_id"
                                        className="w-full"
                                        aria-invalid={!!form.errors.service_id}
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
                                                    {service.name} (
                                                    {service.estimated_days}{" "}
                                                    Hari)
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <InputError message={form.errors.service_id} />
                            </Field>

                            <Field data-invalid={!!form.errors.shoe_count}>
                                <Label
                                    htmlFor="shoe_count"
                                    className="text-xs font-medium text-muted-foreground"
                                >
                                    Jumlah Sepatu (Pasang)
                                </Label>
                                <Input
                                    id="shoe_count"
                                    type="number"
                                    step={1}
                                    min={1}
                                    className="bg-background"
                                    value={form.data.shoe_count}
                                    onChange={(e) =>
                                        form.setData(
                                            "shoe_count",
                                            e.target.value,
                                        )
                                    }
                                    aria-invalid={!!form.errors.shoe_count}
                                />
                                <InputError message={form.errors.shoe_count} />
                            </Field>
                        </div>

                        {/* 3. Kalkulasi Harga & Diskon */}
                        <div className="rounded-xl border bg-muted/30 p-4 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field data-invalid={!!form.errors.discount}>
                                    <Label
                                        htmlFor="discount"
                                        className="text-xs font-medium text-muted-foreground"
                                    >
                                        Diskon (Rp.)
                                    </Label>
                                    <Input
                                        id="discount"
                                        type="number"
                                        placeholder="0"
                                        step={500}
                                        min={0}
                                        max={calculateSubtotal()}
                                        className="bg-background"
                                        value={form.data.discount}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            const subtotal =
                                                calculateSubtotal();
                                            if (val <= subtotal) {
                                                form.setData(
                                                    "discount",
                                                    e.target.value,
                                                );
                                            } else {
                                                form.setData(
                                                    "discount",
                                                    subtotal.toString(),
                                                );
                                            }
                                        }}
                                        aria-invalid={!!form.errors.discount}
                                    />
                                    <InputError
                                        message={form.errors.discount}
                                    />
                                </Field>

                                <Field>
                                    <Label
                                        htmlFor="total_amount"
                                        className="text-xs font-medium text-muted-foreground"
                                    >
                                        Harga Total Akhir
                                    </Label>
                                    <Input
                                        id="total_amount"
                                        type="text"
                                        disabled
                                        className="bg-background font-semibold text-primary cursor-default"
                                        value={formatRupiah(getTotalAmount())}
                                    />
                                </Field>
                            </div>
                        </div>

                        {/* 4. Metode Pembayaran */}
                        <Field data-invalid={!!form.errors.payment_method_id}>
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
                                    aria-invalid={
                                        !!form.errors.payment_method_id
                                    }
                                >
                                    <SelectValue placeholder="Pilih Metode Pembayaran" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {paymentMethods.map((paymentMethod) => (
                                            <SelectItem
                                                key={paymentMethod.id}
                                                value={paymentMethod.id.toString()}
                                            >
                                                {paymentMethod.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <InputError
                                message={form.errors.payment_method_id}
                            />
                        </Field>

                        <Alert className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
                            <AlertTriangleIcon />
                            <AlertTitle>Perhatian</AlertTitle>
                            <AlertDescription>
                                Biarkan kosong jika transaksi belum lunas.
                                Transaksi akan otomatis dianggap lunas jika
                                metode pembayaran diubah.
                            </AlertDescription>
                        </Alert>

                        {/* 5. Tanggal Transaksi & Tanggal Ambil */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field
                                data-invalid={!!form.errors.transaction_date}
                            >
                                <Label htmlFor="transaction_date">
                                    Tanggal Transaksi
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild disabled>
                                        <Button
                                            variant="outline"
                                            className="justify-start text-left font-normal w-full bg-muted/45"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
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

                            <Field data-invalid={!!form.errors.pickup_date}>
                                <Label htmlFor="pickup_date">
                                    Tanggal Diambil
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            data-empty={!pickupDate}
                                            className="justify-start text-left font-normal data-[empty=true]:text-muted-foreground w-full"
                                            aria-invalid={
                                                !!form.errors.pickup_date
                                            }
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
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

                        {/* 6. Deskripsi & Foto Sepatu */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                            <Field
                                data-invalid={!!form.errors.description}
                                className="h-full flex flex-col"
                            >
                                <Label htmlFor="description">Deskripsi</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Catatan tambahan..."
                                    className="flex-1 min-h-36 resize-none"
                                    value={form.data.description}
                                    onChange={(e) =>
                                        form.setData(
                                            "description",
                                            e.target.value,
                                        )
                                    }
                                    aria-invalid={!!form.errors.description}
                                />
                                <InputError message={form.errors.description} />
                            </Field>

                            <Field>
                                <Label htmlFor="image_before">
                                    Foto Sepatu (Sebelum)
                                </Label>
                                <div className="mt-2 w-full">
                                    <label
                                        htmlFor="image_before"
                                        className={`group relative flex min-h-36 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-3 text-center transition-all ${
                                            form.errors.image_before
                                                ? "border-red-500 bg-red-50/10 hover:border-red-600"
                                                : "border-muted-foreground/25 bg-muted/20 hover:border-primary/50 hover:bg-muted/40"
                                        }`}
                                    >
                                        {!previewImage ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background shadow-xs border">
                                                    <ImagePlus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-xs font-medium text-foreground">
                                                        Pilih gambar atau
                                                        drag-and-drop di sini.
                                                    </p>
                                                    <p className="text-[11px] text-muted-foreground">
                                                        PNG, JPG, dan WEBP
                                                        <br />
                                                        Maks. 2MB
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                className={`relative w-full overflow-hidden rounded-lg bg-white p-2 border ${
                                                    form.errors.image_before
                                                        ? "border-red-500"
                                                        : "border-gray-100"
                                                }`}
                                            >
                                                <img
                                                    src={previewImage}
                                                    alt="Preview Bukti"
                                                    className="h-32 w-full object-contain rounded-md"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 rounded-md">
                                                    <span className="rounded-md bg-white px-2.5 py-1 text-xs font-medium text-gray-800 shadow">
                                                        Klik untuk mengganti
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                        <input
                                            id="image_before"
                                            type="file"
                                            name="image_before"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                </div>
                                <InputError
                                    message={form.errors.image_before}
                                />
                            </Field>
                        </div>
                    </FieldGroup>

                    <div className="flex items-center justify-end gap-2 pt-4 border-t">
                        <DialogClose asChild>
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? "Menyimpan..." : "Tambah"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
