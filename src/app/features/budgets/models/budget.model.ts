import { CategoryModel } from '@core/models/category.model';
import { BudgetStatus } from '@shared/constants/budget-status-styles';

export interface BudgetRequestModel {
  amount: number;
  startDate: string;
  endDate: string;
  categoryId: string;
}

export interface BudgetResponseModel {
  id: string;
  amount: number;
  spentAmount: number;
  startDate: string;
  endDate: string;
  category: CategoryModel;
}

export interface BudgetModel {
  // id: string;
  // amount: number;
  // spendAmount: number;
  // startDate: string; // 2025-01-01
  // endDate: string; // 2025-01-31
  // category: CategoryModel;
  // name: string;
  // description: string;
  budget: BudgetResponseModel;
  // icon: string; // nombre del ng-icon
  status: BudgetStatus;
}
