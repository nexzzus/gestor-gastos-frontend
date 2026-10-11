import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryCreateModel, CategoryModel } from '../../models/category.model';
import { CategoryService } from '../../services/category-service';
import { Router } from '@angular/router';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-category-form',
  styleUrl: './category-form.css',
  templateUrl: './category-form.html',
})
export class CategoryForm {
  private readonly categoryService = inject(CategoryService);
  private readonly router = inject(Router);

  apiError: string | null = null;

  categoryForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5), Validators.maxLength(255)],
    }),
  });

  save(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }
    this.apiError = null;

    const category: CategoryCreateModel = this.categoryForm.getRawValue();

    console.log(category);

    this.categoryService.create(category).subscribe({
      next: (data: CategoryModel) => {
        console.log('Categoría agregada con exito', data);
        this.router.navigate(['/app/category']);
      },
      error: (err) => {
        console.error('Ocurrió un error al crear la categoría', err.error.message);
        this.apiError = err.error?.message || 'Error al crear la categoría';
      },
    });
  }
}
