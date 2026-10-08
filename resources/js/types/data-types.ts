export type BranchType = {
    id: number;
    name: string;
    address: string;
    phone_number: string;
    status: boolean;
};

export type RoleType = {
    id: number;
    name: string;
};

export interface UserType {
    id: number;
    name: string;
    email: string;
    username?: string;
    role: RoleType;
    avatar?: string;
    branch: BranchType;
    branch_id: number;
    status: boolean;
}

export type BranchProps = {
    branches: BranchType[];
    users: UserType[];
};

export type CustomerType = {
    id: number;
    name: string;
    phone_number: string;
    email: string;
    status: boolean;
    created_at: string;
    updated_at: string;
};

export type ServiceType = {
    id: number;
    name: string;
    price: number;
    estimated_days: number;
    status: boolean;
    created_at: string;
    updated_at: string;
};

export type ExpenseType = {
    id: number;
    expense_date: string;
    description: string;
    expense_category_id: string;
    expense_category: ExpenseCategoryType;
    amount: string;
    user_id: string;
    user: UserType;
    image?: File | string;
    image_url?: string;
    image_public_id: string;
    branch_id: string;
    branch: BranchType;
    created_at: string;
    updated_at: string;
};

export type TransactionStatusType = {
    id: number;
    name: string;
};

export type PaymentStatusType = {
    id: number;
    name: string;
};

export type TransactionType = {
    id: number;
    customer_id: number;
    transaction_date: string; // Bisa menggunakan string (YYYY-MM-DD) atau Date
    pickup_date: string;
    service_id: number;
    transaction_status_id: number;
    payment_status_id: number;

    // Kolom foto Cloudinary (opsional/nullable karena bisa kosong)
    before_image_url?: string | null;
    before_image_public_id?: string | null;
    after_image_url?: string | null;
    after_image_public_id?: string | null;

    created_at?: string;
    updated_at?: string;

    // Opsional: Jika Anda menggunakan Eloquent Relationship dengan eager loading (with)
    customer?: CustomerType;
    service?: ServiceType;
    transaction_status?: TransactionStatusType;
    payment_status?: PaymentStatusType;
};

export type ExpenseCategoryType = {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
};
