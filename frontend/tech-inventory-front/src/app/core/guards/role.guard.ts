import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as ('ADMIN' | 'USER')[];
  const currentRole = authService.role();

  if (!currentRole) {
    return router.createUrlTree(['/login']);
  }

  if (allowedRoles.includes(currentRole)) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};