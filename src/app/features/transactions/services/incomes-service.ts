import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { TransactionRequestModel, TransactionResponseModel } from '../models/transactions.model';
import { Observable } from 'rxjs';

@Service()
export class IncomesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/income`;

  create(req: TransactionRequestModel): Observable<TransactionResponseModel> {
    return this.http.post<TransactionResponseModel>(this.apiUrl, req);
  }

  deleteIncome(id: string):Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
