import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const guestGuard: CanActivateFn = () => {
  const router = inject(Router);

  if (localStorage.getItem('accessToken')) {
    router.navigate(['/app/dashboard']);
    return false;
  }
  return true;
};
