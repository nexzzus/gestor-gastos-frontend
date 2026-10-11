import { Routes } from '@angular/router';
import { Budgets } from './components/budgets/budgets';
import { BudgetsForm } from './components/budgets-form/budgets-form';

export const BudgetsRoutes: Routes = [
  { path: '', component: Budgets, title: 'Presupuestos' },
  { path: 'new', component: BudgetsForm, title: 'Nuevo Presupuesto' },
];
