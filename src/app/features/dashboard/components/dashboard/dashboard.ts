import { Component, inject, OnInit, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matPlusOutline } from '@ng-icons/material-icons/outline';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
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
  imports: [NgIcon, CurrencyPipe, DatePipe, Button, NgClass, StatusCategoryPipe],
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
        this.expenseByCategory.set(data.budgetsByCategory ?? []);
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
