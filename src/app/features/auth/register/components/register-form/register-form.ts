import { Component, inject, signal } from '@angular/core';
import { InputComponent } from '../../../../../shared/components/input/input';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Button } from '../../../../../shared/components/button/button';
import { Router, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { RegisterRequestModel } from '../../models/register.model';
import { AuthService } from '../../../../../core/services/auth-service';
import { HotToastService } from '@ngxpert/hot-toast';
import { AuthResponseModel } from '../../../../../core/models/auth.model';

@Component({
  imports: [InputComponent, ReactiveFormsModule, Button, RouterLink],
  selector: 'app-register-form',
  styleUrl: './register-form.css',
  templateUrl: './register-form.html',
})
export class RegisterForm {
  private readonly fb = inject(FormBuilder);
  protected readonly isSubmitted = signal<boolean>(false);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(HotToastService);
  private readonly router = inject(Router);

  registerForm = this.fb.nonNullable.group(
    {
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(3)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(3)]],
    },
    { validators: this.passwordMatchValidator() },
  );

  private passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('password')?.value;
      const confirmPassword = control.get('confirmPassword')?.value;

      if (!password || !confirmPassword) {
        return null;
      }

      return password === confirmPassword ? null : { passwordMismatch: true };
    };
  }

  save(): void {
    if (!this.registerForm.valid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isSubmitted.set(true);

    const dto: RegisterRequestModel = this.registerForm.getRawValue();

    this.authService.register(dto).pipe(
      this.toast.observe({
        loading: "Creando usuario...",
        success: "Registro exitoso",
        error: "Ocurrió un error al registrarse"
      })
    ).subscribe({
      next: (res: AuthResponseModel) => {
        localStorage.removeItem('accessToken');
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.removeItem('user');
        localStorage.setItem('user', JSON.stringify(res.user));
        console.log("Res", res);
        this.router.navigate(['/app/dashboard']);
        this.isSubmitted.set(false);
      },
      error: err => {
        console.warn(err);
        this.toast.error(err.error?.message);
        this.isSubmitted.set(false);
      }
    })
  }
}
