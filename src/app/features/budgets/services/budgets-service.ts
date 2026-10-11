import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { BudgetRequestModel, BudgetResponseModel } from '../models/budget.model';
import { PageResponse } from '../../../core/models/api-response.model';

@Service()
export class BudgetsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/budget`;

  create(req: BudgetRequestModel): Observable<BudgetResponseModel>{
    return this.http.post<BudgetResponseModel>(this.apiUrl, req);
  }

  getBudgets(): Observable<PageResponse<BudgetResponseModel>>{
    return this.http.get<PageResponse<BudgetResponseModel>>(`${this.apiUrl}/user`);
  }
}
