import { BudgetModel, BudgetResponseModel } from '@features/budgets/models/budget.model';
import { BudgetStatus } from '@shared/constants/budget-status-styles';

export function computeStatus(budget: BudgetResponseModel): BudgetStatus {
  const percent = budget.amount > 0 ? (budget.spentAmount / budget.amount) * 100 : 0;
  const expired = new Date(`${budget.endDate}T23:59:59`) < new Date();

  if (percent > 100) return 'excedido';
  if (expired || percent === 100) return 'completado';
  if (percent >= 80) return 'alerta';
  return 'activo';
}

export function toBudgetModel(budget: BudgetResponseModel): BudgetModel{
  return {budget: budget, status: computeStatus(budget)}
}
