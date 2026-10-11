import { PageResponse } from '../../../core/models/api-response.model';
import { CategoryModel } from '../../../core/models/category.model';

export interface MovementItemModel {
  id: string;
  title: string;
  amount: number;
  createdAt: number;
  description: string;
  paymentMethod: string;
  category: CategoryModel;
}

export type IncomeResponseModel = MovementItemModel;
export type ExpenseResponseModel = MovementItemModel;

export interface RecentActivityResponseModel {
  id: string;
  title: string;
  amount: number;
  createdAt: string;
  type: string; // "INCOME" o "EXPENSE"
  category: {
    id: string;
    name: string;
  };
}

// export interface ExpensesByCategoryModel {
//   categoryName: string;
//   totalAmount: number;
// }

export interface ExpensesByCategoryProgressModel{
  categoryId: string
  categoryName: string,
  budgetAmount: number,
  spentAmount: number,
  remainingAmount: number,
  usedPercentage: number,
  endDate: string
}

export interface DashBoardResponseModel {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  // expensesByCategory: ExpensesByCategoryModel[];
  recentActivity: RecentActivityResponseModel[];
  budgetsByCategory: ExpensesByCategoryProgressModel[];
}
