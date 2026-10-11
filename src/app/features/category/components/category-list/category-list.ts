import { Component, inject, OnInit, signal } from '@angular/core';
import { CategoryModel } from '../../../../core/models/category.model';
import { CategoryService } from '../../services/category-service';
import { CommonModule } from '@angular/common';
import { PageResponse } from '../../../../core/models/api-response.model';

@Component({
  imports: [CommonModule],
  selector: 'app-category-list',
  styleUrl: './category-list.css',
  templateUrl: './category-list.html',
})
export class CategoryList implements OnInit {
  categories = signal<CategoryModel[]>([]);
  private categoryService = inject(CategoryService);

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data: PageResponse<CategoryModel>) => {
        console.log(data);
        this.categories.set(data.content);
      },
      error: (err) => {
        console.error(err.error);
        this.categories.set([]);
      },
    });
  }
}
