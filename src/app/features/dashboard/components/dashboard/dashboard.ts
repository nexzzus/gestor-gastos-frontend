import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matPlusOutline } from '@ng-icons/material-icons/outline';
import { CurrencyPipe, DatePipe, DecimalPipe, NgClass } from '@angular/common';
import {
  matCheckCircleOutline,
  matScheduleOutline,
  matTrendingDownOutline,
  matTrendingUpOutline,
} from '@ng-icons/material-symbols/outline';
import { DashboardServices } from '../../services/dashboard-services';
import {
  DashBoardResponseModel,
  ExpensesByCategoryProgressModel,
  RecentActivityResponseModel,
} from '../../models/dashboard.model';
import { Router } from '@angular/router';
import { Button } from '@shared/components/button/button';
import { STATUS_STYLES } from '@shared/constants/budget-status-styles';
import { StatusCategoryPipe } from '@shared/pipes/status-category-pipe';
import { TransactionService } from '@features/transactions/services/transaction-service';
import { TransactionResponseModel } from '@features/transactions/models/transactions.model';

@Component({
  imports: [NgIcon, CurrencyPipe, DatePipe, Button, NgClass, StatusCategoryPipe, DecimalPipe],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
  providers: [
    provideIcons({
      matPlusOutline,
      matCheckCircleOutline,
      matTrendingUpOutline,
      matTrendingDownOutline,
      matScheduleOutline,
    }),
  ],
})
export class Dashboard implements OnInit {
  totalBalance = signal<number>(0);
  income = signal<number>(0);
  expenses = signal<number>(0);
  recentActivity = signal<RecentActivityResponseModel[]>([]);
  expenseByCategory = signal<ExpensesByCategoryProgressModel[]>([]);

  totalBudgetAmount = signal<number>(0);
  totalExpenseAmount = signal<number>(0);

  // Porcentaje de cambio en el balance respecto al mes pasado
  balancePercentage = signal<number>(0);

  // Estado del objetivo de ingresos
  incomeStatus = computed(() => {
    const inc = this.income();
    const exp = this.expenses();
    const budget = this.totalBudgetAmount();

    if (inc === 0) {
      return {
        text: 'Sin ingresos este mes',
        icon: 'matScheduleOutline',
        color: 'text-slate-500',
      };
    }

    // Si los ingresos cubren el presupuesto asignado o superan los gastos actuales
    if ((budget > 0 && inc >= budget) || (budget === 0 && inc >= exp)) {
      return {
        text: 'En camino al objetivo',
        icon: 'matCheckCircleOutline',
        color: 'text-primary-4',
      };
    }

    if (inc < exp) {
      return {
        text: 'Por debajo del objetivo',
        icon: 'matTrendingDownOutline',
        color: 'text-amber-600',
      };
    }

    return {
      text: 'En camino al objetivo',
      icon: 'matCheckCircleOutline',
      color: 'text-primary-4',
    };
  });

  percentBudgetExecuted = computed(() => {
    const limit = this.totalBudgetAmount();
    return limit > 0 ? (this.totalExpenseAmount() / limit) * 100 : 0;
  });

  budgetStatus(): string {
    if (this.percentBudgetExecuted() > 80) return "text-red-500";
    if (this.percentBudgetExecuted() > 50) return "text-orange-500";
    if (this.percentBudgetExecuted() > 30) return "text-yellow-500";
    else return "text-primary-4";
  }

  styles = STATUS_STYLES;

  private readonly router = inject(Router);
  protected dashService = inject(DashboardServices);
  private readonly transactionService = inject(TransactionService);

  ngOnInit(): void {
    this.loadDashboardSummary();
  }

  loadDashboardSummary() {
    this.dashService.getDashboardSummary().subscribe({
      next: (data: DashBoardResponseModel) => {
        this.totalBalance.set(data.totalBalance);
        this.income.set(data.totalIncome);
        this.expenses.set(data.totalExpense);
        this.recentActivity.set(data.recentActivity ?? []);

        // Si el backend incluye la métrica directamente, usarla
        if (data.percentageVsLastMonth !== undefined) {
          this.balancePercentage.set(data.percentageVsLastMonth);
        } else if (data.balancePercentageVsLastMonth !== undefined) {
          this.balancePercentage.set(data.balancePercentageVsLastMonth);
        } else {
          this.loadVsLastMonthComparison();
        }

        this.totalBudgetAmount.set(0);
        this.totalExpenseAmount.set(0);

        data.budgetsByCategory?.forEach((category) => {
          this.totalBudgetAmount.update((value) => value + category.budgetAmount);
          this.totalExpenseAmount.update((value) => value + category.spentAmount);
        });

        // Build a map keyed by categoryName to merge budgets and expenses correctly
        const catMap = new Map<string, ExpensesByCategoryProgressModel>();

        // Initialize map with budgets (if any)
        data.budgetsByCategory?.forEach((b) => {
          const key = b.categoryName;
          catMap.set(key, {
            categoryId: b.categoryId,
            categoryName: b.categoryName,
            budgetAmount: b.budgetAmount,
            spentAmount: 0,
            usedPercentage: 0,
            remainingAmount: b.budgetAmount,
            endDate: b.endDate,
          });
        });

        // Merge expenses into map, using categoryName as the key
        data.expensesByCategory?.forEach((exp) => {
          const key = exp.categoryName;
          const existing = catMap.get(key);
          if (existing) {
            // Update existing entry with expense data
            existing.spentAmount = exp.totalAmount;
            existing.usedPercentage =
              existing.budgetAmount > 0
                ? Math.round((exp.totalAmount / existing.budgetAmount) * 100)
                : 0;
            existing.remainingAmount = Math.max(existing.budgetAmount - exp.totalAmount, 0);
            // Ensure categoryId is present if previously missing
            if (!existing.categoryId && exp.categoryId) {
              existing.categoryId = exp.categoryId;
            }
          } else {
            // No budget defined for this category, create a new entry
            catMap.set(key, {
              categoryId: exp.categoryId ?? '',
              categoryName: exp.categoryName,
              budgetAmount: 0,
              spentAmount: exp.totalAmount,
              remainingAmount: 0,
              usedPercentage: 0,
              endDate: '',
            });
          }
        });

        // Keep only categories that have expenses
        const combined = Array.from(catMap.values()).filter((c) => c.spentAmount > 0);
        this.expenseByCategory.set(combined);
      },
      error: (error) => {
        console.error('Error al cargar el resumen del dashboard', error);
      },
    });
  }

  loadVsLastMonthComparison(): void {
    this.transactionService.getTransactions(0, 100).subscribe({
      next: (res) => {
        this.calculateVsLastMonth(res.content ?? []);
      },
      error: (err) => {
        console.warn('No se pudieron obtener transacciones para calcular vs mes pasado', err);
      },
    });
  }

  calculateVsLastMonth(transactions: TransactionResponseModel[]): void {
    if (!transactions || transactions.length === 0) {
      this.balancePercentage.set(0);
      return;
    }

    const now = new Date();
    const currYear = now.getFullYear();
    const currMonth = now.getMonth();

    const prevDate = new Date(currYear, currMonth - 1, 1);
    const prevYear = prevDate.getFullYear();
    const prevMonth = prevDate.getMonth();

    let currMonthNet = 0;
    let prevMonthNet = 0;

    for (const t of transactions) {
      if (!t.createdAt) continue;
      const tDate = new Date(t.createdAt);
      const tYear = tDate.getFullYear();
      const tMonth = tDate.getMonth();
      const amount = Number(t.amount) || 0;
      const net = t.type === 'INCOME' ? amount : -amount;

      if (tYear === currYear && tMonth === currMonth) {
        currMonthNet += net;
      } else if (tYear === prevYear && tMonth === prevMonth) {
        prevMonthNet += net;
      }
    }

    if (prevMonthNet !== 0) {
      const pct = ((currMonthNet - prevMonthNet) / Math.abs(prevMonthNet)) * 100;
      this.balancePercentage.set(Math.round(pct * 10) / 10);
    } else if (currMonthNet !== 0) {
      this.balancePercentage.set(currMonthNet > 0 ? 100 : -100);
    } else {
      this.balancePercentage.set(0);
    }
  }

  goNewTransaction() {
    this.router.navigate(['app/transactions/new']);
  }

  goTransactions() {
    this.router.navigate(['app/transactions']);
  }

  protected readonly Math = Math;
}
