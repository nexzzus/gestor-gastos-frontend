import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { BudgetsService } from '@features/budgets/services/budgets-service';
import { BudgetModel, BudgetResponseModel } from '@features/budgets/models/budget.model';
import { HotToastService } from '@ngxpert/hot-toast';
import { PageResponse } from '@core/models/api-response.model';
import { toBudgetModel } from '../../mappers/budget.maper';
import { BudgetsList } from '@features/budgets/components/budgets-list/budgets-list';
import { CurrencyPipe, DecimalPipe, NgClass } from '@angular/common';
import { BudgetStatus, STATUS_STYLES } from '@shared/constants/budget-status-styles';
import {
  matAccountBalanceFillOutline,
  matCalendarMonthOutline,
  matChevronLeftOutline,
  matChevronRightOutline,
  matDownloadOutline,
  matSavingsOutline,
  matShoppingCartOutline,
  matTrendingUpOutline,
} from '@ng-icons/material-symbols/outline';
import {
  matPlusOutline,
  matTrendingDownOutline,
} from '@ng-icons/material-icons/outline';
import { solarStream } from '@ng-icons/solar-icons/outline';
import * as XLSX from 'xlsx';

@Component({
  standalone: true,
  imports: [NgIcon, BudgetsList, CurrencyPipe, DecimalPipe, NgClass],
  selector: 'app-budgets',
  styleUrl: './budgets.css',
  templateUrl: './budgets.html',
  providers: [
    provideIcons({
      matAccountBalanceFillOutline,
      matCalendarMonthOutline,
      matChevronLeftOutline,
      matChevronRightOutline,
      matDownloadOutline,
      matSavingsOutline,
      matShoppingCartOutline,
      matTrendingUpOutline,
      matTrendingDownOutline,
      matPlusOutline,
      solarStream,
    }),
  ],
})
export class Budgets implements OnInit {
  private readonly router = inject(Router);
  private readonly toast = inject(HotToastService);
  private readonly budgetsService = inject(BudgetsService);

  private readonly today = new Date();

  // Fecha seleccionada para filtrar (por defecto, primer día del mes actual)
  selectedDate = signal<Date>(new Date(this.today.getFullYear(), this.today.getMonth(), 1));

  year = computed(() => this.selectedDate().getFullYear());
  monthIndex = computed(() => this.selectedDate().getMonth());
  monthName = computed(() => this.selectedDate().toLocaleDateString('es-CO', { month: 'long' }));
  formattedPeriod = computed(() => {
    const name = this.monthName();
    const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
    return `${capitalized} ${this.year()}`;
  });

  lastDay = computed(() => new Date(this.year(), this.monthIndex() + 1, 0).getDate());

  // Estado del periodo ('En curso' | 'Finalizado' | 'Próximo')
  periodStatus = computed<'En curso' | 'Finalizado' | 'Próximo'>(() => {
    const currYear = this.today.getFullYear();
    const currMonth = this.today.getMonth();
    const y = this.year();
    const m = this.monthIndex();

    if (y === currYear && m === currMonth) return 'En curso';
    if (y < currYear || (y === currYear && m < currMonth)) return 'Finalizado';
    return 'Próximo';
  });

  daysLeft = computed(() => {
    const currYear = this.today.getFullYear();
    const currMonth = this.today.getMonth();
    const y = this.year();
    const m = this.monthIndex();

    if (y < currYear || (y === currYear && m < currMonth)) return 0;
    if (y > currYear || (y === currYear && m > currMonth)) return this.lastDay();
    return Math.max(0, this.lastDay() - this.today.getDate());
  });

  styles = STATUS_STYLES;

  allBudgets = signal<BudgetModel[]>([]);

  // Filtro de presupuestos por el mes seleccionado
  budgets = computed(() => {
    const list = this.allBudgets();
    const y = this.year();
    const m = this.monthIndex() + 1;
    const mStr = String(m).padStart(2, '0');
    const lastDayStr = String(this.lastDay()).padStart(2, '0');

    const monthStartStr = `${y}-${mStr}-01`;
    const monthEndStr = `${y}-${mStr}-${lastDayStr}`;

    return list.filter((b) => {
      const start = (b.budget.startDate || '').slice(0, 10);
      const end = (b.budget.endDate || '').slice(0, 10);
      if (!start || !end) return false;
      return start <= monthEndStr && end >= monthStartStr;
    });
  });

  activeBudget = computed(() => this.budgets().length);

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
          loading: 'Cargando presupuestos...',
          success: 'Presupuestos cargados correctamente',
          error: 'Error al cargar presupuestos',
        }),
      )
      .subscribe({
        next: (res: PageResponse<BudgetResponseModel>) => {
          this.allBudgets.set(res.content.map(toBudgetModel));
        },
      });
  }

  prevMonth(): void {
    const d = this.selectedDate();
    this.selectedDate.set(new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  nextMonth(): void {
    const d = this.selectedDate();
    this.selectedDate.set(new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  goToCurrentMonth(): void {
    this.selectedDate.set(new Date(this.today.getFullYear(), this.today.getMonth(), 1));
  }

  exportBudgets(): void {
    const list = this.budgets();
    if (list.length === 0) {
      this.toast.error('No hay presupuestos para exportar en este periodo');
      return;
    }

    const data = list.map((b) => ({
      Categoría: b.budget.category?.name || 'General',
      'Monto Presupuestado': b.budget.amount,
      'Gasto Acumulado': b.budget.spentAmount,
      'Disponible Restante': Math.max(0, b.budget.amount - b.budget.spentAmount),
      '% Ejecutado':
        b.budget.amount > 0
          ? `${((b.budget.spentAmount / b.budget.amount) * 100).toFixed(1)}%`
          : '0%',
      'Fecha Inicio': b.budget.startDate,
      'Fecha Fin': b.budget.endDate,
      Estado: this.styles[b.status]?.label || b.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      `Presupuestos_${this.year()}_${this.monthIndex() + 1}`,
    );
    XLSX.writeFile(
      workbook,
      `presupuestos_${this.year()}_${String(this.monthIndex() + 1).padStart(2, '0')}.xlsx`,
    );
    this.toast.success('Presupuestos exportados correctamente');
  }

  goNewBudget(): void {
    this.router.navigate(['app/budgets/new']);
  }
}
