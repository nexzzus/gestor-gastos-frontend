import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, tap } from 'rxjs';
import { AuthResponseModel } from '../models/auth.model';
import { LoginRequestModel } from '../../features/auth/login/models/login.model';
import { RegisterRequestModel } from '../../features/auth/register/models/register.model';
import { UserResponseModel } from '../models/user.model';
import { Router } from '@angular/router';

@Service()
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly apiUserUrl = `${environment.apiUrl}/user`;
  private readonly router = inject(Router);

  refreshToken(): Observable<AuthResponseModel> {
    return this.http
      .post<AuthResponseModel>(`${this.apiUrl}/refresh-token`, {}, { withCredentials: true })
      .pipe(
        tap((res) => {
          localStorage.setItem('accessToken', res.accessToken);
        }),
      );
  }

  logout() {
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true });
  }

  loginService(req: LoginRequestModel): Observable<AuthResponseModel> {
    return this.http.post<AuthResponseModel>(`${this.apiUrl}/login`, req,{
      withCredentials: true
    });
  }

  register(req: RegisterRequestModel): Observable<AuthResponseModel>{
    return this.http.post<AuthResponseModel>(`${this.apiUrl}/register`, req,{withCredentials: true});
  }

  getMe(): Observable<UserResponseModel> {
    return this.http.get<UserResponseModel>(`${this.apiUserUrl}/me`, { withCredentials: true });
  }
}
