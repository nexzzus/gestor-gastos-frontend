import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth-service';
import { Router } from '@angular/router';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = localStorage.getItem('accessToken');

  const authReq =
    token && !req.url.includes('/auth/refresh-token')
      ? req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        })
      : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/refresh-token')) {
        if (isRefreshing) {
          return throwError(() => error);
        }

        isRefreshing = true;

        return authService.refreshToken().pipe(
          switchMap(() => {
            const newToken = localStorage.getItem('accessToken');

            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`,
              },
              withCredentials: true,
            });

            isRefreshing = false;
            return next(retryReq);
          }),
          catchError((refreshError) => {
            // Refresh failed: token probably revoked. Ensure user is logged out.
            isRefreshing = false;

            // Clear local token and call backend logout to clear cookies if possible.
            localStorage.removeItem('accessToken');

            // Call logout endpoint (subscribe to execute) and navigate to login/root.
            authService.logout().subscribe({
              next: () => {
                router.navigate(['/']);
              },
              error: () => {
                // Even if logout request fails, force navigation to login
                router.navigate(['/']);
              },
            });

            return throwError(() => refreshError);
          }),
        );
      }

      return throwError(() => error);
    }),
  );
};
