import {
  ChangeDetectorRef,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { solarEyeClosed } from '@ng-icons/solar-icons/outline';
import { solarEyeLinear } from '@ng-icons/solar-icons/linear';

@Component({
  imports: [NgIcon],
  selector: 'app-input',
  styleUrl: './input.css',
  templateUrl: './input.html',
  providers: [
    provideIcons({
      solarEyeLinear,
      solarEyeClosed,
    }),
  ],
})
export class InputComponent implements ControlValueAccessor {
  uniqueId = 'uid-' + Math.random().toString(36).slice(2);

  // ─────────────────────────────────────
  // Inputs
  // ─────────────────────────────────────

  label = input('');
  type = input<'text' | 'email' | 'password' | 'number' | 'date'>('text');
  placeholder = input('');
  id = input('');
  autocomplete = input('off');
  isCurrency = input<boolean>(false); // Nuevo input para el modo moneda
  colorSymbol = input('');

  inputId = computed(() => (this.id() ? `${this.id()}-input` : this.uniqueId));

  // ─────────────────────────────────────
  // ElementRef & Change Detection
  // ─────────────────────────────────────

  nativeInput = viewChild<ElementRef<HTMLInputElement>>('nativeInput');
  private cdr = inject(ChangeDetectorRef);

  // ─────────────────────────────────────
  // Angular Forms
  // ─────────────────────────────────────

  readonly ngControl = inject(NgControl, {
    self: true,
    optional: true,
  });

  // ─────────────────────────────────────
  // Estado
  // ─────────────────────────────────────

  value = signal('');
  disabled = false;
  showPassword = false;
  required = input<boolean>(true);

  // ─────────────────────────────────────
  // ControlValueAccessor
  // ─────────────────────────────────────

  private onChange: (value: string | number) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  // ─────────────────────────────────────
  // Input type
  // ─────────────────────────────────────

  get inputType(): string {
    if (this.type() === 'password') {
      return this.showPassword ? 'text' : 'password';
    }
    if (this.isCurrency()) {
      return 'text'; // Obligamos a usar texto para poder renderizar los puntos de mil
    }

    return this.type();
  }

  // ─────────────────────────────────────
  // Estado del formulario
  // ─────────────────────────────────────

  get control() {
    return this.ngControl?.control;
  }

  get hasError(): boolean {
    return !!(this.control?.invalid && this.control?.touched);
  }

  // ─────────────────────────────────────
  // Mensaje de error
  // ─────────────────────────────────────

  get errorMessage(): string {
    const errors = this.control?.errors;
    if (!errors) return '';
    if (errors['required']) return 'Este campo es obligatorio';
    if (errors['email']) return 'Ingresa un correo válido';
    if (errors['minlength']) return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength']) return `Máximo ${errors['maxlength'].requiredLength} caracteres`;

    return 'El valor ingresado no es válido';
  }

  // ─────────────────────────────────────
  // ControlValueAccessor
  // ─────────────────────────────────────

  writeValue(value: string | number | null): void {
    let val = value?.toString() ?? '';

    // Formatear valor inicial si viene de la base de datos o de un parcheo del form
    if (this.isCurrency() && val) {
      const cleanValue = val.replace(/\D/g, '');
      val = cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    this.value.set(val);

    const input = this.nativeInput()?.nativeElement;
    if (input) {
      input.value = val;
    }

    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: string | number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  // ─────────────────────────────────────
  // Eventos
  // ─────────────────────────────────────

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const rawValue = input.value;

    if (this.isCurrency()) {
      // 1. Quitar todo lo que no sea número
      const cleanNumber = rawValue.replace(/\D/g, '');

      // 2. Formatear con puntos
      const formattedNumber = cleanNumber.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

      // 3. Importante: Guardar la versión FORMATEADA en la señal para que Angular no la borre
      this.value.set(formattedNumber);
      input.value = formattedNumber;

      // 4. Emitir el valor LIMPIO (numérico) a Angular Forms
      this.onChange(Number(cleanNumber) || 0);
    } else {
      this.value.set(rawValue);
      this.onChange(this.value());
    }
  }

  onBlur(): void {
    this.onTouched();
  }

  // ─────────────────────────────────────
  // Password
  // ─────────────────────────────────────

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}
