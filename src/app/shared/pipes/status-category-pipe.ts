import { Pipe, PipeTransform } from '@angular/core';
import { ExpensesByCategoryProgressModel } from '@features/dashboard/models/dashboard.model';
import { ExpenseStatusModel } from '@core/models/expense.status.model';

export type CategoryStatus = 'activo' | 'alerta' | 'completado' | 'excedido';

@Pipe({ name: 'statusCategory', standalone: true })
export class StatusCategoryPipe implements PipeTransform {
  transform(expense?: ExpensesByCategoryProgressModel): CategoryStatus {
    if (!expense) return 'activo';

    const percent = Number(expense.usedPercentage ?? 0);
    const expired = expense.endDate ? new Date(`${expense.endDate}T23:59:59`) < new Date() : false;

    if (percent > 100) return 'excedido';
    if (expired || percent >= 100) return 'completado';
    if (percent >= 80) return 'alerta';
    return 'activo';
  }
}
