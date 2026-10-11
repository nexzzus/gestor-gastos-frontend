import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DashBoardResponseModel } from '../models/dashboard.model';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Service()
export class DashboardServices {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/dashboard`;

  getDashboardSummary(): Observable<DashBoardResponseModel> {
    return this.http.get<DashBoardResponseModel>(`${this.apiUrl}`);
  }
}
