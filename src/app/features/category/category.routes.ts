import { CategoryList } from './components/category-list/category-list';
import { CategoryForm } from './components/category-form/category-form';
import { Routes } from '@angular/router';

export const CategoryRoutes: Routes = [
  {path: '', component: CategoryList, title: 'Categorias'},
  {path: 'nueva', component: CategoryForm, title: 'Nueva'},
]
