import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { InputComponent } from '../../../../../shared/components/input/input';
import { LoginRequestModel } from '../../models/login.model';
import { Router, RouterLink } from '@angular/router';
import { matAccountBalanceOutline } from '@ng-icons/material-symbols/outline';
import { AuthService } from '../../../../../core/services/auth-service';
import { AuthResponseModel } from '../../../../../core/models/auth.model';
import { HotToastService } from '@ngxpert/hot-toast';
import { Button } from '../../../../../shared/components/button/button';
import { environment } from '../../../../../../environments/environment';

@Component({
  imports: [ReactiveFormsModule, InputComponent, NgIcon, Button, RouterLink],
  selector: 'app-login-form',
  styleUrl: './login-form.css',
  templateUrl: './login-form.html',
  providers: [provideIcons({ matAccountBalanceOutline })],
  host: { class: 'w-full flex justify-center' },
})
export class LoginForm {
  private readonly loginService = inject(AuthService);
  private readonly router = inject(Router);
  protected apiError = signal<string | null>(null);
  private readonly toast = inject(HotToastService);
  private readonly apiUrl = environment.apiUrl.replace("/api", "");

  loginForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
  });

  login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.apiError.set(null);

    const loginRequest: LoginRequestModel = this.loginForm.getRawValue();

    this.loginService.loginService(loginRequest).subscribe({
      next: (res: AuthResponseModel) => {
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.router.navigateByUrl('/app/dashboard');
        this.toast.success('Bienvenido de nuevo!', { icon: '🏠' });
      },
      error: (err: any) => {
        this.apiError.set(err.error?.message || 'Error el la petición');
        console.log('Error al hacer login', err.error?.message);
        console.log('Error al hacer login', err.error);
        this.toast.error('Algo salió mal', { icon: '😖' });
      },
    });
  }

  loginGoogle(): void {
    window.location.href = `${this.apiUrl}/oauth2/authorization/google`;
  }
}
