import { Routes } from '@angular/router';
import { Transactions } from './components/transactions/transactions';
import { TransactionsForm } from './components/transactions-form/transactions-form';

export const TransactionsRoutes: Routes = [
  { path: '', component: Transactions, title: 'Transacciones' },
  { path: 'new', component: TransactionsForm, title: 'Nueva Transacción' },
];
