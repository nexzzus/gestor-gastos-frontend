import { Component, inject } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '@core/services/auth-service';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
  imports: [NgIcon, RouterLink, RouterLinkActive],
  selector: 'app-navbar',
  styleUrl: './navbar.css',
  templateUrl: './navbar.html',
})
export class Navbar {
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
