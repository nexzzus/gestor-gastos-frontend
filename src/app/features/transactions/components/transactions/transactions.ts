import { Component, inject, OnInit, signal } from '@angular/core';
import { Button } from '../../../../shared/components/button/button';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matPlusOutline } from '@ng-icons/material-icons/outline';
import { matDownloadOutline, matShoppingCartOutline } from '@ng-icons/material-symbols/outline';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import * as XLSX from 'xlsx';
import { Router } from '@angular/router';
import { HotToastService } from '@ngxpert/hot-toast';
import { TransactionResponseModel } from '../../models/transactions.model';
import { TransactionService } from '../../services/transaction-service';
import { SliceResponse } from '../../../../core/models/api-response.model';

@Component({
  imports: [Button, NgIcon, DatePipe, CurrencyPipe, NgClass],
  selector: 'app-transactions',
  styleUrl: './transactions.css',
  templateUrl: './transactions.html',
  providers: [provideIcons({ matPlusOutline, matDownloadOutline, matShoppingCartOutline })],
})
export class Transactions implements OnInit {
  private readonly transactionService = inject(TransactionService);
  private readonly router = inject(Router);
  private readonly toast = inject(HotToastService);
  data = signal<TransactionResponseModel[]>([]);

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

    this.transactionService.getTransactions(this.currentPage, this.pageSize).pipe(
      this.toast.observe({
        loading: 'Cargando transacciones...',
        success: this.currentPage === 0
          ? 'Transacciones cargadas'
        : "Más transacciones cargadas",
        error: 'No se pudieron cargar las transacciones'
      })
    ).subscribe({
      next: (data: SliceResponse<TransactionResponseModel>) => {
        console.log(data)
        this.data.update((current) => [
          ...current, ...data.content
          ]);
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

  loadMore(): void{
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
}
