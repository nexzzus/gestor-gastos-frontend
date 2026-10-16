import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Button } from '@shared/components/button/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matPlusOutline } from '@ng-icons/material-icons/outline';
import { matDownloadOutline, matShoppingCartOutline } from '@ng-icons/material-symbols/outline';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import * as XLSX from 'xlsx';
import { Router } from '@angular/router';
import { HotToastService } from '@ngxpert/hot-toast';
import { TransactionResponseModel } from '../../models/transactions.model';
import { TransactionService } from '../../services/transaction-service';
import { SliceResponse } from '@core/models/api-response.model';
import { CategoryIconPipe } from '@shared/pipes/category-icon-pipe';
import { MenuOption, OptionsMenu } from '@shared/components/options-menu/options-menu';
import { Observable } from 'rxjs';
import { ExpensesService } from '@features/transactions/services/expenses-service';
import { IncomesService } from '@features/transactions/services/incomes-service';
import { HttpErrorResponse } from '@angular/common/http';

type TransactionType = 'INCOME' | 'EXPENSE';

interface DayGroup {
  date: string; // "2026-10-11"
  label: string; // "Hoy", "Ayer" o "sábado, 10 de octubre"
  total: number; // ingresos - gastos del día
  items: TransactionResponseModel[];
}

@Component({
  imports: [Button, NgIcon, DatePipe, CurrencyPipe, NgClass, CategoryIconPipe, OptionsMenu],
  selector: 'app-transactions',
  styleUrl: './transactions.css',
  templateUrl: './transactions.html',
  providers: [provideIcons({ matPlusOutline, matDownloadOutline, matShoppingCartOutline })],
})
export class Transactions implements OnInit {
  private readonly transactionService = inject(TransactionService);
  private readonly incomeService = inject(IncomesService);
  private readonly expenseService = inject(ExpensesService);
  private readonly router = inject(Router);
  private readonly toast = inject(HotToastService);
  data = signal<TransactionResponseModel[]>([]);

  groups = computed<DayGroup[]>(() => {
    const byDay = new Map<string, TransactionResponseModel[]>();

    for (const t of this.data()) {
      const day = t.createdAt.slice(0, 10); // LocalDateTime ISO -> yyyy-MM-dd
      const list = byDay.get(day) ?? [];
      list.push(t);
      byDay.set(day, list);
    }

    return [...byDay.entries()].map(([date, items]) => ({
      date,
      label: this.dayLabel(date),
      items,
      total: items.reduce((sum, t) => sum + (t.type === 'INCOME' ? t.amount : -t.amount), 0),
    }));
  });

  private dayLabel(date: string): string {
    const d = new Date(`${date}T00:00:00`); // evita el desfase de zona horaria
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.round((today.getTime() - d.getTime()) / 86_400_000);
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';

    return d.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  today = new Date();
  year = new Date().getFullYear();
  monthName = this.today.toLocaleDateString('es-CO', { month: 'long' });

  currentPage = 0;
  readonly pageSize = 5;

  hasMore = signal(true);
  loading = signal(false);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    if (this.loading()) {
      return;
    }

    this.loading.set(true);

    this.transactionService
      .getTransactions(this.currentPage, this.pageSize)
      .pipe(
        this.toast.observe({
          loading: 'Cargando transacciones...',
          success: this.currentPage === 0 ? 'Transacciones cargadas' : 'Más transacciones cargadas',
          error: 'No se pudieron cargar las transacciones',
        }),
      )
      .subscribe({
        next: (data: SliceResponse<TransactionResponseModel>) => {
          // this.data.set([]);
          console.log(data);
          this.data.update((current) => [...current, ...data.content]);
          console.log('data', this.data());
          console.log('data', this.data());

          this.hasMore.set(!data.last);
          this.loading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.loading.set(false);
        },
      });
  }

  loadMore(): void {
    if (!this.hasMore() || this.loading()) {
      return;
    }

    this.currentPage++;
    this.loadData();
  }

  downloadTransactions(): void {
    const transactions = this.data();

    if (!transactions.length) {
      return;
    }

    const data = transactions.map((transaction) => ({
      Título: transaction.title,
      Monto: transaction.amount,
      Fecha: transaction.createdAt,
      Categoría: transaction.category.name,
      'Método de pago': transaction.paymentMethod,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transacciones');

    XLSX.writeFile(workbook, 'transacciones.xlsx');
  }

  goNewTransaction(): void {
    this.router.navigate(['app/transactions/new']);
  }


private readonly deleters: Record<TransactionType, (id: string) => Observable<void>> = {
  INCOME: (id) => this.incomeService.deleteIncome(id),
  EXPENSE: (id) => this.expenseService.deleteExpense(id),
};

deleteTransaction(transaction: TransactionResponseModel): void {
  this.deleters[transaction.type](transaction.id)
    .pipe(
      this.toast.observe({
        loading: 'Eliminando...',
        success: 'Transacción eliminada',
        error: (err: unknown) =>
          (err as HttpErrorResponse).error?.message ?? 'Error al eliminar la transacción',
      }),
    )
    .subscribe({
          next: () => {
            // Eliminar localmente para actualizar la lista sin recargar páginas completas
            this.data.update((current) => current.filter((t) => t.id !== transaction.id));
          },
          error: (err) => console.error(err),
        });
}

  menuOptions: MenuOption[] = [
    { id: 'edit', label: 'Editar' },
    { id: 'delete', label: 'Eliminar', danger: true },
  ];

  onMenuSelect(action: string, transaction: TransactionResponseModel): void {
    if (action === 'edit') {
      console.log('Editar', transaction.id);
    }
    if (action === 'delete') {
     this.deleteTransaction(transaction);
    }
  }
}
