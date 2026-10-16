import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matPlusOutline } from '@ng-icons/material-icons/outline';
import { CurrencyPipe, DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { matCheckCircleOutline, matTrendingUpOutline } from '@ng-icons/material-symbols/outline';
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

@Component({
  imports: [NgIcon, CurrencyPipe, DatePipe, Button, NgClass, StatusCategoryPipe, DecimalPipe],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
  providers: [provideIcons({ matPlusOutline, matCheckCircleOutline, matTrendingUpOutline })],
})
export class Dashboard implements OnInit {
  totalBalance = signal<number>(0);
  income = signal<number>(0);
  expenses = signal<number>(0);
  recentActivity = signal<RecentActivityResponseModel[]>([]);
  expenseByCategory = signal<ExpensesByCategoryProgressModel[]>([]);

  totalBudgetAmount = signal<number>(0);
  totalExpenseAmount = signal<number>(0);

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

  goNewTransaction() {
    this.router.navigate(['app/transactions/new']);
  }

  goTransactions() {
    this.router.navigate(['app/transactions']);
  }

  protected readonly Math = Math;
}
