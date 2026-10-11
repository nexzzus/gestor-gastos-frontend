import { Routes } from '@angular/router';
import { LoginForm } from './features/auth/login/components/login-form/login-form';
import { authGuard } from './core/guards/auth-guard';
import { AuthLayout } from './core/layout/auth-layout/auth-layout';
import { MainLayout } from './core/layout/main-layout/main-layout';
import { RegisterForm } from './features/auth/register/components/register-form/register-form';
import { AuthCallback } from './features/auth/auth-callback/auth-callback';
import { NotFound } from '@features/not-found/components/not-found/not-found';

export const routes: Routes = [
  // AUTH
  {
    path: '',
    component: AuthLayout,
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
      {
        path: 'login',
        component: LoginForm,
        title: 'Iniciar Sesión',
      },
      {
        path: 'register',
        component: RegisterForm,
        title: 'Registro',
      },
      {
        path: 'auth/callback',
        component: AuthCallback,
      },
    ],
  },

  // APP
  {
    path: 'app',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.DashboardRoutes),
      },
      {
        path: 'transactions',
        loadChildren: () =>
          import('./features/transactions/transactions.routes').then((m) => m.TransactionsRoutes),
      },
      {
        path: 'budgets',
        loadChildren: () =>
          import('./features/budgets/budgets.routes').then((m) => m.BudgetsRoutes),
      },
      {
        path: 'category',
        loadChildren: () =>
          import('./features/category/category.routes').then((m) => m.CategoryRoutes),
      },
    ],
  },
  {path: '**', component: NotFound}
];
