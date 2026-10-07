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
