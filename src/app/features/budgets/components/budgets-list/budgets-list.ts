import { Component, computed, inject, input, signal } from '@angular/core';
import { BudgetModel } from '../../models/budget.model';
import { CurrencyPipe, DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { NgIcon } from '@ng-icons/core';
import { CategoryIconPipe } from '@shared/pipes/category-icon-pipe';
import { STATUS_STYLES } from '@shared/constants/budget-status-styles';
import { Router } from '@angular/router';

type Filter = 'todos' | 'saludables' | 'riesgo' | 'finalizados';

@Component({
  imports: [NgClass, NgIcon, CurrencyPipe, DecimalPipe, DatePipe, CategoryIconPipe],
  selector: 'app-budgets-list',
  styleUrl: './budgets-list.css',
  templateUrl: './budgets-list.html',
})
export class BudgetsList {
  private readonly router = inject(Router);
  budgets = input.required<BudgetModel[]>();
  filter = signal<Filter>('todos');

  styles = STATUS_STYLES;

  counts = computed(() => {
    const b = this.budgets();
    return {
      todos: b.length,
      saludables: b.filter((x) => x.status === 'activo').length,
      riesgo: b.filter((x) => x.status === 'alerta' || x.status === 'excedido').length,
      finalizados: b.filter((x) => x.status === 'completado').length,
    };
  });

  setFilter(f: Filter): void {
    this.filter.set(f);
  }

  filteredBudgets = computed(() => {
    const b = this.budgets();
    const f = this.filter();
    switch (f) {
      case 'saludables':
        return b.filter((x) => x.status === 'activo');
      case 'riesgo':
        return b.filter((x) => x.status === 'alerta' || x.status === 'excedido');
      case 'finalizados':
        return b.filter((x) => x.status === 'completado');
      default:
        return b;
    }
  });

  percent(m: BudgetModel): number {
    const { amount, spentAmount } = m.budget;
    return amount > 0 ? Math.min((spentAmount / amount) * 100, 100) : 0;
  }

  available(m: BudgetModel): number {
    return Math.max(m.budget.amount - m.budget.spentAmount, 0);
  }

  goTransactions(): void {
    this.router.navigate(['app/transactions']);
  }
}
