import { CategoryModel } from '@core/models/category.model';

export interface TransactionRequestModel {
  title: string;
  amount: number;
  // createdAt: string;
  categoryId: string;
  // userId: string;
  description?: string;
  paymentMethod: string;
}

export interface TransactionResponseModel {
  id:string;
  title: string;
  amount: number;
  createdAt: string;
  description:string;
  paymentMethod: string;
  category: CategoryModel,
  type: 'INCOME' | 'EXPENSE'
}
