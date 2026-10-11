import { inject, Service } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { CategoryCreateModel, CategoryModel } from '../models/category.model';
import { Observable } from 'rxjs';
import { PageResponse } from '../../../core/models/api-response.model';

@Service()
export class CategoryService {
  private http = inject(HttpClient);
  private endpoint = `${environment.apiUrl}/category`;

  getCategories(): Observable<PageResponse<CategoryModel>> {
    return this.http.get<PageResponse<CategoryModel>>(this.endpoint);
  }

  getById(id: string): Observable<CategoryModel> {
    return this.http.get<CategoryModel>(`${this.endpoint}/${id}`);
  }

  create(req: CategoryCreateModel): Observable<CategoryModel>{
    return this.http.post<CategoryModel>(this.endpoint, req);
  }

  update(id:string, req: CategoryCreateModel): Observable<CategoryModel>{
    return this.http.put<CategoryModel>(`${this.endpoint}/${id}`, req);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }


}
