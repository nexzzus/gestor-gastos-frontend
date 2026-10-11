import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  matAccountBalanceFillOutline,
  matAccountBalanceWalletOutline,
  matDashboardOutline,
  matReceiptLongOutline,
  matLogoutOutline,
} from '@ng-icons/material-symbols/outline';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
  imports: [NgIcon, RouterLink, RouterLinkActive],
  selector: 'app-sidebar',
  styleUrl: './sidebar.css',
  templateUrl: './sidebar.html',
  providers: [
    provideIcons({
      matDashboardOutline,
      matAccountBalanceFillOutline,
      matReceiptLongOutline,
      matLogoutOutline,
      matAccountBalanceWalletOutline,
    }),
  ],
})
export class Sidebar {
  private readonly authService = inject(AuthService);
  private readonly toast = inject(HotToastService);
  private readonly router = inject(Router);

  logout(): void {
    this.authService.logout();
    localStorage.removeItem('accessToken');
    this.router.navigate(['/']);
    this.toast.success('Hasta pronto!', { icon: '👋' });
  }
}
