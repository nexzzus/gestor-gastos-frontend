import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { InputComponent } from '@shared/components/input/input';
import { CategoryService } from '../../../category/services/category-service';
import { CategoryModel } from '@core/models/category.model';
import { HotToastService } from '@ngxpert/hot-toast';
import { PageResponse } from '@core/models/api-response.model';
import { Button } from '@shared/components/button/button';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BudgetRequestModel, BudgetResponseModel } from '../../models/budget.model';
import { BudgetsService } from '../../services/budgets-service';
import { Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  imports: [InputComponent, Button, ReactiveFormsModule, CurrencyPipe],
  selector: 'app-budgets-form',
  styleUrl: './budgets-form.css',
  templateUrl: './budgets-form.html',
})
export class BudgetsForm implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly budgetsService = inject(BudgetsService);
  private readonly toast = inject(HotToastService);
  private readonly router = inject(Router);

  categories = signal<CategoryModel[]>([]);
  isSubmitted = signal<boolean>(false);

  private readonly fb = inject(FormBuilder);
  budgetForm = this.fb.group({
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    categoryId: ['', Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
  });

  // Escuchar los cambios de todo el formulario
  formChanges = toSignal(this.budgetForm.valueChanges, {
    initialValue: this.budgetForm.getRawValue(),
  });

  // Calcular dinámicamente los días del periodo
  periodDays = computed(() => {
    const data = this.formChanges();
    if (data.startDate && data.endDate) {
      // Usar UTC evita problemas con cambios de horario de verano/invierno
      const start = new Date(data.startDate + 'T00:00:00Z');
      const end = new Date(data.endDate + 'T00:00:00Z');

      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Sumar 1 para incluir el día actual. Mínimo 1 día.
      return diffDays >= 0 ? diffDays + 1 : 1;
    }
    return 31; // Valor por defecto si faltan fechas
  });

  // Calcular el límite usando los días dinámicos
  limit = computed(() => {
    const amount = this.formChanges().amount ?? 0;
    if (amount <= 0) return 0;

    return amount / this.periodDays();
  });

  save() {
    if (this.budgetForm.invalid) {
      this.budgetForm.markAllAsTouched();
      return;
    }

    this.isSubmitted.set(true);

    const data = this.budgetForm.getRawValue() as BudgetRequestModel;

    this.budgetsService
      .create(data)
      .pipe(
        this.toast.observe({
          loading: 'Guardando presupuesto...',
          success: 'Presupuesto creado',
          error: 'Error al crear el presupuesto',
        }),
      )
      .subscribe({
        next: (data: BudgetResponseModel) => {
          this.isSubmitted.set(false);
          this.router.navigate(['app/budgets']);
        },
        error: (err) => {
          this.isSubmitted.set(false);
          this.toast.error(err.error?.message || 'Hubo un error al crear el presupuesto');
          this.router.navigate(['app/budgets']);
        },
      });
  }

  cancel() {
    this.router.navigate(['app/budgets']);
  }

  ngOnInit() {
    this.getCategories();
  }

  getCategories() {
    this.categoryService
      .getCategories()
      .pipe(
        this.toast.observe({
          loading: 'Cargando categorías...',
          success: 'Categorías cargadas',
          error: 'Hubo un error al cargar las categorías',
        }),
      )
      .subscribe({
        next: (res: PageResponse<CategoryModel>) => {
          this.categories.set(res.content);
        },
        error: (err) => {
          console.warn(err);
          this.toast.error(err.error?.message || 'Hubo un error al cargar las categorías');
        },
      });
  }
}
