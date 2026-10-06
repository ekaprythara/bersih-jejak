import { BranchType, UserType } from "@/pages/branch";
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
    expense_category_id: number;
    expense_category: ExpenseCategoryType;
    amount: number;
    user_id: number;
    user: UserType;
    branch_id: number;
    branch: BranchType;
    created_at: string;
    updated_at: string;
};

export type ExpenseCategoryType = {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
};
