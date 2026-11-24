import React, { useEffect } from "react";
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
import { SubmitEventHandler, useState, ChangeEvent } from "react";
import InputError from "@/components/input-error";
import {
    BranchType,
    PaymentMethodType,
    PaymentStatusType,
    ServiceType,
    TransactionStatusType,
    TransactionType,
} from "@/types/data-types";
import { Input } from "@/components/ui/input";
import { update } from "@/routes/transactions";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    CalendarIcon,
    SquarePen,
    ImagePlus,
    AlertTriangleIcon,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const UpdateTransactionDialog = ({
    transaction,
    branches,
    paymentMethods,
    paymentStatuses,
    transactionStatuses,
    services,
}: {
    transaction: TransactionType & {
        discount?: number;
        shoe_count?: number;
        service_id?: number;
        image_before?: string;
        image_after?: string;
    };
    branches: BranchType[];
    paymentMethods: PaymentMethodType[];
    paymentStatuses: PaymentStatusType[];
    transactionStatuses: TransactionStatusType[];
    services?: ServiceType[];
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [pickupDate, setPickupDate] = useState<Date | undefined>(
        transaction.pickup_date ? parseISO(transaction.pickup_date) : undefined,
    );
    const [previewImage, setPreviewImage] = useState({
        before: transaction.image_before
            ? `/storage/${transaction.image_before}`
            : "",
        after: transaction.image_after
            ? `/storage/${transaction.image_after}`
            : "",
    });

    useEffect(() => {
        setPreviewImage({
            before: transaction.image_before
                ? `/storage/${transaction.image_before}`
                : "",
            after: transaction.image_after
                ? `/storage/${transaction.image_after}`
                : "",
        });
    }, [transaction]);

    const form = useForm({
        pickup_date: transaction.pickup_date || "",
        payment_method_id: transaction.payment_method_id
            ? String(transaction.payment_method_id)
            : "",
        transaction_status_id: transaction.transaction_status_id,
        discount: transaction.discount ?? 0,
        shoe_count: transaction.shoe_count ?? 1,
        service_id: transaction.service_id ?? "",
        description: transaction.description || "",
        branch_id: transaction.branch_id || "",
        image_before: null as File | null,
        image_after: null as File | null,
    });

    const isPaidOff = Boolean(form.data.payment_method_id);

    const handlePaymentMethodChange = (value: string) => {
        const isEmpty = value === "__none__" || value === "";
        const nextMethodId = isEmpty ? "" : value;
        const nextStatusId = isEmpty ? 1 : 2;

        form.setData((prev) => ({
            ...prev,
            payment_method_id: nextMethodId,
            payment_status_id: nextStatusId,
        }));
    };

    const handleDateSelect = (selectedDate: Date | undefined) => {
        setPickupDate(selectedDate);
        if (selectedDate) {
            form.setData("pickup_date", format(selectedDate, "yyyy-MM-dd"));
        } else {
            form.setData("pickup_date", "");
        }
    };

    const handleSubmit: SubmitEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        form.patch(update.url(transaction.invoice_number), {
            forceFormData: true,
            onSuccess: () => {
                toast.success(`Transaksi berhasil diperbarui.`);
                setIsOpen(false);
            },
            onError: (errors) => {
                console.log("ValidationErrors:", errors);
                toast.error(`Gagal memperbarui data Transaksi.`);
            },
        });
    };

    const handleImageBeforeChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setData("image_before", file);
            setPreviewImage((prev) => ({
                ...prev,
                before: URL.createObjectURL(file),
            }));
        }
    };

    const handleImageAfterChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setData("image_after", file);
            setPreviewImage((prev) => ({
                ...prev,
                after: URL.createObjectURL(file),
            }));
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="icon" variant="warning">
                    <SquarePen />
                </Button>
            </DialogTrigger>
            <DialogContent className="overflow-y-auto scrollbar-none overscroll-contain max-h-[92dvh] sm:max-w-2xl">
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <DialogHeader>
                        <DialogTitle>Edit Transaksi</DialogTitle>
                        <DialogDescription>
                            Perbarui data transaksi cuci sepatu.
                        </DialogDescription>
                    </DialogHeader>

                    <FieldGroup className="flex flex-col gap-5">
                        {/* 1. Ringkasan Invoice & Total Tagihan */}
                        <div className="rounded-xl border bg-muted/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-0.5">
                                <p className="text-xs font-medium text-muted-foreground">
                                    No. Invoice
                                </p>
                                <p className="text-sm font-bold font-mono text-foreground">
                                    {transaction.invoice_number}
                                </p>
                            </div>
                            <div className="sm:text-right space-y-0.5 border-t sm:border-t-0 pt-2 sm:pt-0">
                                <p className="text-xs font-medium text-muted-foreground">
                                    Total Tagihan
                                </p>
                                <p
                                    className={`text-lg font-bold font-mono ${
                                        isPaidOff
                                            ? "text-emerald-600"
                                            : "text-rose-600"
                                    }`}
                                >
                                    {new Intl.NumberFormat("id-ID", {
                                        style: "currency",
                                        currency: "IDR",
                                        maximumFractionDigits: 0,
                                    }).format(transaction.total_amount)}
                                </p>
                            </div>
                        </div>

                        {/* 2. Cabang */}
                        <Field data-invalid={!!form.errors.branch_id}>
                            <Label htmlFor="branch_id">Cabang</Label>
                            <Select
                                value={String(form.data.branch_id)}
                                onValueChange={(value) =>
                                    form.setData("branch_id", value)
                                }
                                disabled={true || isPaidOff}
                            >
                                <SelectTrigger
                                    id="branch_id"
                                    className="w-full bg-muted/40"
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

                        {/* 3. Layanan & Jumlah Sepatu */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {services && (
                                <Field data-invalid={!!form.errors.service_id}>
                                    <Label
                                        htmlFor="service_id"
                                        className="text-xs font-medium text-muted-foreground"
                                    >
                                        Layanan
                                    </Label>
                                    <Select
                                        value={String(form.data.service_id)}
                                        onValueChange={(value) =>
                                            form.setData(
                                                "service_id",
                                                Number(value),
                                            )
                                        }
                                        disabled={isPaidOff}
                                    >
                                        <SelectTrigger
                                            id="service_id"
                                            className="w-full bg-background"
                                            aria-invalid={
                                                !!form.errors.service_id
                                            }
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
                                    <InputError
                                        message={form.errors.service_id}
                                    />
                                </Field>
                            )}

                            <Field
                                data-invalid={!!form.errors.shoe_count}
                                className={!services ? "sm:col-span-2" : ""}
                            >
                                <Label
                                    htmlFor="shoe_count"
                                    className="text-xs font-medium text-muted-foreground"
                                >
                                    Jumlah Sepatu (Pasang)
                                </Label>
                                <Input
                                    id="shoe_count"
                                    type="number"
                                    min={1}
                                    className="bg-background"
                                    value={form.data.shoe_count}
                                    onChange={(e) =>
                                        form.setData(
                                            "shoe_count",
                                            Number(e.target.value),
                                        )
                                    }
                                    disabled={isPaidOff}
                                    aria-invalid={!!form.errors.shoe_count}
                                />
                                <InputError message={form.errors.shoe_count} />
                            </Field>
                        </div>

                        {/* 4. Diskon */}
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
                                step={500}
                                className="bg-background"
                                value={form.data.discount}
                                onChange={(e) =>
                                    form.setData(
                                        "discount",
                                        Number(e.target.value),
                                    )
                                }
                                disabled={isPaidOff}
                                aria-invalid={!!form.errors.discount}
                            />
                            <InputError message={form.errors.discount} />
                        </Field>

                        {/* 5. Status Pengerjaan & Tanggal Pengambilan */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field
                                data-invalid={
                                    !!form.errors.transaction_status_id
                                }
                            >
                                <Label htmlFor="transaction_status_id">
                                    Status Pengerjaan
                                </Label>
                                <Select
                                    value={String(
                                        form.data.transaction_status_id,
                                    )}
                                    onValueChange={(value) =>
                                        form.setData(
                                            "transaction_status_id",
                                            Number(value),
                                        )
                                    }
                                >
                                    <SelectTrigger
                                        id="transaction_status_id"
                                        className="w-full"
                                        aria-invalid={
                                            !!form.errors.transaction_status_id
                                        }
                                    >
                                        <SelectValue placeholder="Status Pengerjaan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {transactionStatuses.map(
                                                (transactionStatus) => (
                                                    <SelectItem
                                                        key={
                                                            transactionStatus.id
                                                        }
                                                        value={transactionStatus.id.toString()}
                                                    >
                                                        {transactionStatus.name}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <InputError
                                    message={form.errors.transaction_status_id}
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
                                        />
                                    </PopoverContent>
                                </Popover>
                                <InputError message={form.errors.pickup_date} />
                            </Field>
                        </div>

                        <Field data-invalid={!!form.errors.payment_method_id}>
                            <Label htmlFor="payment_method_id">
                                Metode Pembayaran
                            </Label>
                            <Select
                                value={form.data.payment_method_id}
                                onValueChange={handlePaymentMethodChange}
                                disabled={
                                    transaction.payment_status?.name.toLowerCase() ===
                                    "lunas"
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

                        {/* 7. Deskripsi */}
                        <Field data-invalid={!!form.errors.description}>
                            <Label htmlFor="description">Deskripsi</Label>
                            <Textarea
                                id="description"
                                placeholder="Catatan tambahan..."
                                className="min-h-24 resize-none"
                                value={form.data.description}
                                onChange={(e) =>
                                    form.setData("description", e.target.value)
                                }
                                aria-invalid={!!form.errors.description}
                            />
                            <InputError message={form.errors.description} />
                        </Field>

                        {/* 8. Foto Sebelum & Sesudah */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field>
                                <Label htmlFor="image_before">
                                    Foto Sepatu (Sebelum)
                                </Label>
                                <label
                                    htmlFor="image_before"
                                    className={`group relative flex min-h-36 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-3 text-center transition-all ${
                                        form.errors.image_before
                                            ? "border-red-500 bg-red-50/10 hover:border-red-600"
                                            : "border-muted-foreground/25 bg-muted/20 hover:border-primary/50 hover:bg-muted/40"
                                    }`}
                                >
                                    {!previewImage.before ? (
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
                                                src={previewImage.before}
                                                alt="Preview Before"
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
                                        onChange={handleImageBeforeChange}
                                    />
                                </label>
                                <InputError
                                    message={form.errors.image_before}
                                />
                            </Field>

                            <Field>
                                <Label htmlFor="image_after">
                                    Foto Sepatu (Sesudah)
                                </Label>
                                <label
                                    htmlFor="image_after"
                                    className={`group relative flex min-h-36 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-3 text-center transition-all ${
                                        form.errors.image_after
                                            ? "border-red-500 bg-red-50/10 hover:border-red-600"
                                            : "border-muted-foreground/25 bg-muted/20 hover:border-primary/50 hover:bg-muted/40"
                                    }`}
                                >
                                    {!previewImage.after ? (
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
                                                form.errors.image_after
                                                    ? "border-red-500"
                                                    : "border-gray-100"
                                            }`}
                                        >
                                            <img
                                                src={previewImage.after}
                                                alt="Preview After"
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
                                        id="image_after"
                                        type="file"
                                        name="image_after"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageAfterChange}
                                    />
                                </label>
                                <InputError message={form.errors.image_after} />
                            </Field>
                        </div>
                    </FieldGroup>
                    <div className="flex items-center justify-end gap-2 pt-4 border-t">
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
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
