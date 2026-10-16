import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { matTrendingDownOutline, matTrendingUpOutline } from '@ng-icons/material-icons/outline';
import { CurrencyPipe, NgClass } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TransactionRequestModel } from '../../models/transactions.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { ExpensesService } from '../../services/expenses-service';
import { IncomesService } from '../../services/incomes-service';
import { CategoryModel } from '@core/models/category.model';
import { CategoryService } from '../../../category/services/category-service';
import { PageResponse } from '@core/models/api-response.model';
import { InputComponent } from '@shared/components/input/input';
import { Router } from '@angular/router';
import { HotToastService } from '@ngxpert/hot-toast';
import { Button } from '@shared/components/button/button';

@Component({
  imports: [
    NgIcon,
    NgClass,
    FormsModule,
    CurrencyPipe,
    ReactiveFormsModule,
    InputComponent,
    Button,
  ],
  selector: 'app-transactions-form',
  styleUrl: './transactions-form.css',
  templateUrl: './transactions-form.html',
  providers: [provideIcons({ matTrendingDownOutline, matTrendingUpOutline })],
})
export class TransactionsForm implements OnInit {
  symbol = computed(() => (this.type() === 'gasto' ? '-' : '+'));
  isSubmitting = signal(false);

  private fb = inject(FormBuilder);

  private router = inject(Router);

  private expensesService = inject(ExpensesService);
  private incomesService = inject(IncomesService);
  private readonly toast = inject(HotToastService);

  categoryService = inject(CategoryService);
  categories = signal<CategoryModel[]>([]);

  ngOnInit() {
    this.getCategories();
  }

  private userData = localStorage.getItem('user');
  private userId: string | null = null;

  transactForm = this.fb.group({
    type: ['gasto', Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    // date: ['', Validators.required], // yyyy-MM-dd
    // hour: ['', Validators.required], // HH:mm o HH:mm:ss
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [null, [Validators.minLength(5)]],
    category: ['', Validators.required],
    paymentMethod: ['', Validators.required],
  });

  type = toSignal(this.transactForm.get('type')!.valueChanges, {
    initialValue: this.transactForm.get('type')!.value,
  });

  // Signal derivado del FormControl "amount"
  amount = toSignal(this.transactForm.get('amount')!.valueChanges, {
    initialValue: this.transactForm.get('amount')!.value,
  });

  private extractTransactionData() {
    if (this.transactForm.invalid) {
      this.transactForm.markAllAsTouched();
      return;
    }

    const dto: TransactionRequestModel = {
      title: this.transactForm.value.title!,
      amount: this.transactForm.value.amount!,
      // createdAt: this.buildLocalDateTime()!,
      categoryId: this.transactForm.value.category!,
      description: this.transactForm.value.description!,
      paymentMethod: this.transactForm.value.paymentMethod!,
    };

    return dto;
  }

  saveIncomeOrExpense(type: string | null, dto: TransactionRequestModel) {
    const request$ =
      type === 'gasto' ? this.expensesService.create(dto) : this.incomesService.create(dto);

    return request$.pipe(
      this.toast.observe({
        loading: 'Guardando...',
        success: 'Transacción exitosa',
        error: 'Algo salió mal',
      }),
    );
  }

  saveAndAddAnother(): void {
    const transaction = this.extractTransactionData();
    if (!transaction || this.isSubmitting()) return;

    this.isSubmitting.set(true);

    this.saveIncomeOrExpense(this.type(), transaction).subscribe({
      next: () => {
        this.transactForm.reset({
          type: 'gasto',
          amount: null,
          title: '',
          description: null,
          category: '',
          paymentMethod: '',
        });
        this.isSubmitting.set(false);
      },
      error: (err) => {
        console.error('Error al guardar y agregar otra', err);
        this.isSubmitting.set(false);
      },
    });
  }

  saveAndGoDahboard(): void {
    const transaction = this.extractTransactionData();
    if (!transaction || this.isSubmitting()) return;

    this.isSubmitting.set(true);

    this.saveIncomeOrExpense(this.type(), transaction).subscribe({
      next: () => {
        // La navegación ocurre únicamente cuando el observe() lanza el toast de "success"
        this.router.navigate(['/app/dashboard']);
      },
      error: (err) => {
        console.error('Error al guardar y salir', err);
        this.isSubmitting.set(false);
      },
    });
  }

  selection(valor: 'gasto' | 'ingreso'): void {
    this.transactForm.get('type')?.setValue(valor);
  }

  summer(value: number) {
    const raw = this.transactForm.get('amount')?.value;
    const actual = Number(raw) || 0;
    const nuevo = Math.round((actual + value) * 100) / 100;
    (this.transactForm.get('amount') as any)?.setValue(nuevo);
  }

  colorClase = computed(() =>
    this.type() === 'ingreso'
      ? '!text-green-700 placeholder:text-green-700'
      : '!text-red-700 !placeholder:text-red-700',
  );

  changeType = computed(() => {
    console.log(`Tipo de transacción cambiado a: ${this.type()}`);
  })

  getCategories() {
    this.categoryService.getCategories().subscribe({
      next: (data: PageResponse<CategoryModel>) => {
        this.categories.set(data.content);
        // console.log(data.content);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  discardChanges(): void {
    this.router.navigate(['/app/dashboard']);
  }

  incomeCategoryId = computed(() => {
    const incomeCategory = this.categories().find((c) =>
      c?.name?.toUpperCase() === 'INGRESO'
    );
    return incomeCategory?.id;
  });
}
