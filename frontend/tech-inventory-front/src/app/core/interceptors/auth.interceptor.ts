import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { TokenStorageService } from '../services/auth/token-storage.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(TokenStorageService).getToken();

  const authorizedReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authorizedReq);
};