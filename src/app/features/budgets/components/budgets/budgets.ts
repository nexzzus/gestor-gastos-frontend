import { Component, computed, inject, Input, OnInit, signal } from '@angular/core';
import { Button } from '@shared/components/button/button';
import { Router } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { BudgetsService } from '@features/budgets/services/budgets-service';
import { BudgetModel, BudgetResponseModel } from '@features/budgets/models/budget.model';
import { HotToastService } from '@ngxpert/hot-toast';
import { PageResponse } from '@core/models/api-response.model';
import { toBudgetModel } from '../../mappers/budget.maper';
import { BudgetsList } from '@features/budgets/components/budgets-list/budgets-list';
import { CurrencyPipe, DecimalPipe, NgClass } from '@angular/common';
import { BudgetStatus, STATUS_STYLES } from '@shared/constants/budget-status-styles';

@Component({
  standalone: true,
  imports: [Button, NgIcon, BudgetsList, CurrencyPipe, DecimalPipe, NgClass],
  selector: 'app-budgets',
  styleUrl: './budgets.css',
  templateUrl: './budgets.html',
  providers: [],
})
export class Budgets implements OnInit {
  private readonly router = inject(Router);
  private readonly toast = inject(HotToastService);
  private readonly budgetsService = inject(BudgetsService);

  private readonly today = new Date();

  year = this.today.getFullYear();
  monthIndex = this.today.getMonth();
  monthName = this.today.toLocaleDateString('es-CO', { month: 'long' });
  lastDay = new Date(this.year, this.monthIndex + 1, 0).getDate();
  daysLeft = this.lastDay - this.today.getDate();

  styles = STATUS_STYLES;

  budgets = signal<BudgetModel[]>([]);
  activeBudget = computed(() => this.budgets().length);

  // Todo se deriva de `budgets`: no hace falta signals separados
  limitTotal = computed(() => this.budgets().reduce((sum, m) => sum + m.budget.amount, 0));

  accumulatedExpense = computed(() =>
    this.budgets().reduce((sum, m) => sum + m.budget.spentAmount, 0),
  );

  availableRemaining = computed(() => this.limitTotal() - this.accumulatedExpense());

  percentExpenseExecuted = computed(() => {
    const limit = this.limitTotal();
    return limit > 0 ? (this.accumulatedExpense() / limit) * 100 : 0;
  });

  status(): BudgetStatus {
    if (this.percentExpenseExecuted() > 100) return 'excedido';
    if (this.percentExpenseExecuted() === 100) return 'completado';
    if (this.percentExpenseExecuted() >= 80) return 'alerta';
    return 'activo';
  }

  ngOnInit(): void {
    this.loadBudgets();
  }

  loadBudgets(): void {
    this.budgetsService
      .getBudgets()
      .pipe(
        this.toast.observe({
          loading: 'Cargando presupuesto...',
          success: 'Presupuestos cargados correctamente',
          error: 'Error al cargar presupuestos',
        }),
      )
      .subscribe({
        next: (res: PageResponse<BudgetResponseModel>) => {
          this.budgets.set(res.content.map(toBudgetModel));
        },
      });
  }

  goNewBudget(): void {
    this.router.navigate(['app/budgets/new']);
  }
}
