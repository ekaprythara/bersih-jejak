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
import {
    BranchType,
    CustomerType,
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
import { CalendarIcon, SquarePen } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { ChangeEvent } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";

export const UpdateTransactionDialog = ({
    transaction,
    paymentMethods,
    branches,
    paymentStatuses,
    transactionStatuses,
}: {
    transaction: TransactionType;
    branches: BranchType[];
    paymentMethods: PaymentMethodType[];
    paymentStatuses: PaymentStatusType[];
    transactionStatuses: TransactionStatusType[];
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const { isOwner } = useAuth();

    // Parse tanggal string dari database ke objek Date untuk kalender
    const [pickupDate, setPickupDate] = useState<Date | undefined>(
        transaction.pickup_date ? parseISO(transaction.pickup_date) : undefined,
    );

    // State preview gambar (mengambil URL lama dari database jika ada)
    const [previewImage, setPreviewImage] = useState({
        before: transaction.before_image_url || "",
        after: transaction.after_image_url || "",
    });

    const form = useForm({
        pickup_date: transaction.pickup_date || "",
        payment_method_id: transaction.payment_method_id,
        payment_status_id: transaction.payment_status_id,
        transaction_status_id: transaction.transaction_status_id,
        description: transaction.description || "",
        branch_id: transaction.branch_id || "",
        beforeImage: null as File | null,
        afterImage: null as File | null,
    });

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

        form.patch(update.url(transaction.id), {
            // Gunakan post dengan _method: 'PATCH' jika mengirim file via Inertia.js,
            // atau pastikan backend mendukung patch dengan file.
            forceFormData: true,
            onSuccess: () => {
                toast.success(`Transaksi berhasil diperbarui.`);
                setIsOpen(false);
            },
            onError: (errors) => {
                console.log("Validation Errors:", errors);
                toast.error(`Gagal memperbarui data Transaksi.`);
            },
        });
    };

    // Handler untuk Foto Before
    const handleImageBeforeChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setData("beforeImage", file);
            setPreviewImage((prev) => ({
                ...prev,
                before: URL.createObjectURL(file),
            }));
        }
    };

    // Handler untuk Foto After
    const handleImageAfterChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setData("afterImage", file);
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

            <DialogContent className="overflow-y-scroll scrollbar-none scroll-smooth max-h-[95dvh]">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <DialogHeader>
                        <DialogTitle>Edit Transaksi</DialogTitle>
                        <DialogDescription>
                            Perbarui data transaksi cuci sepatu.
                        </DialogDescription>
                    </DialogHeader>

                    <FieldGroup>
                        <Field>
                            <Label htmlFor="pickup_date">Tanggal Diambil</Label>
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
                                    />
                                </PopoverContent>
                            </Popover>
                            <InputError message={form.errors.pickup_date} />
                        </Field>
                        {isOwner && (
                            <Field>
                                <Label htmlFor="branch_id">
                                    Pilih Cabang...
                                </Label>
                                <Select
                                    value={String(form.data.branch_id)}
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

                                                    {!branch.status && (
                                                        <Badge className="bg-red-50 text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
                                                            Nonaktif
                                                        </Badge>
                                                    )}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <InputError message={form.errors.branch_id} />
                            </Field>
                        )}
                        <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                            <span className="text-sm font-medium text-neutral-600">
                                Total Tagihan:
                            </span>
                            <span
                                className={`text-lg font-bold font-mono ${
                                    paymentStatuses.find(
                                        (s) =>
                                            s.id ===
                                            Number(form.data.payment_status_id),
                                    )?.name === "Lunas"
                                        ? "text-emerald-600"
                                        : "text-rose-600"
                                }`}
                            >
                                {new Intl.NumberFormat("id-ID", {
                                    style: "currency",
                                    currency: "IDR",
                                    maximumFractionDigits: 0,
                                }).format(transaction.total_amount)}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Field>
                                <Label htmlFor="payment_method_id">
                                    Metode Pembayaran
                                </Label>

                                <Select
                                    value={String(form.data.payment_method_id)}
                                    onValueChange={(value) =>
                                        form.setData(
                                            "payment_method_id",
                                            Number(value),
                                        )
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
                                    value={String(form.data.payment_status_id)}
                                    onValueChange={(value) =>
                                        form.setData(
                                            "payment_status_id",
                                            Number(value),
                                        )
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
                        <Field>
                            <Label htmlFor="transaction_status_id">
                                Status Transaksi
                            </Label>

                            <Select
                                value={String(form.data.transaction_status_id)}
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
                                >
                                    <SelectValue placeholder="Status Transaksi" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {transactionStatuses.map(
                                            (transactionStatus) => (
                                                <SelectItem
                                                    key={transactionStatus.id}
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
                        <Field>
                            <Label htmlFor="description">Deskripsi</Label>
                            <Textarea
                                id="description"
                                placeholder="Catatan tambahan..."
                                value={form.data.description}
                                onChange={(e) =>
                                    form.setData("description", e.target.value)
                                }
                            />
                            <InputError message={form.errors.description} />
                        </Field>
                        <div className="grid grid-cols-2 gap-4">
                            {/* FOTO SEBELUM */}
                            <Field>
                                <Label htmlFor="before_image">
                                    Foto Sepatu (Sebelum)
                                </Label>
                                <div className="mt-2 w-full">
                                    <label
                                        htmlFor="before_image"
                                        className="group relative flex min-h-40 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-2 text-center transition-all hover:border-gray-400 hover:bg-gray-50"
                                    >
                                        {!previewImage.before ? (
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
                                                        PNG, JPG, dan WEBP{" "}
                                                        <br />
                                                        Maks. 5 MB
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="relative w-full overflow-hidden rounded-xl border border-gray-100 bg-white p-2">
                                                <img
                                                    src={previewImage.before}
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
                                            id="before_image"
                                            type="file"
                                            name="before_image"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageBeforeChange}
                                        />
                                    </label>
                                </div>
                                <InputError message={form.errors.beforeImage} />
                            </Field>

                            {/* FOTO SESUDAH */}
                            <Field>
                                <Label htmlFor="after_image">
                                    Foto Sepatu (After)
                                </Label>
                                <div className="mt-2 w-full">
                                    <label
                                        htmlFor="after_image"
                                        className="group relative flex min-h-40 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-2 text-center transition-all hover:border-gray-400 hover:bg-gray-50"
                                    >
                                        {!previewImage.after ? (
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
                                                        PNG, JPG, dan WEBP{" "}
                                                        <br />
                                                        Maks. 5 MB
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="relative w-full overflow-hidden rounded-xl border border-gray-100 bg-white p-2">
                                                <img
                                                    src={previewImage.after}
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
                                            id="after_image"
                                            type="file"
                                            name="after_image"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageAfterChange}
                                        />
                                    </label>
                                </div>
                                <InputError message={form.errors.afterImage} />
                            </Field>
                        </div>
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
