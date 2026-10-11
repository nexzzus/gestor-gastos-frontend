import { inject, Service } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SliceResponse } from '../../../core/models/api-response.model';
import { TransactionResponseModel } from '../models/transactions.model';
import { environment } from '@environments/environment';

@Service()
export class TransactionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/transaction`;

  getTransactions(page: number, size: number): Observable<SliceResponse<TransactionResponseModel>> {

    const params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.http.get<SliceResponse<TransactionResponseModel>>(this.apiUrl, { params });
  }
}
