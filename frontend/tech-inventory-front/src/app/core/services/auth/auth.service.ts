import { Injectable, inject, signal } from '@angular/core';
import { Observable, map } from 'rxjs';

import { AuthApiService } from './auth-api.service';
import { TokenStorageService } from './token-storage.service';
import { LoginRequest } from '../../models/auth/login-request.model';
import { LoginResponse } from '../../models/auth/login-response.model';

interface AuthLoginEnvelope {
  status: number;
  message: string;
  data: LoginResponse;
}

type AuthRole = 'ADMIN' | 'USER';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authApiService = inject(AuthApiService);
  private readonly tokenStorageService = inject(TokenStorageService);

  private readonly _isAuthenticated = signal(false);
  private readonly _role = signal<AuthRole | null>(null);

  readonly isAuthenticated = this._isAuthenticated.asReadonly();
  readonly role = this._role.asReadonly();

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.authApiService.login(request).pipe(
      map((response) => {
        const { data } = response as unknown as AuthLoginEnvelope;
        if (data?.token) {
          this.tokenStorageService.saveToken(data.token);
          this._role.set(this.decodeRole(data.token));
          this._isAuthenticated.set(this._role() !== null);
        }
        return data;
      })
    );
  }

  logout(): void {
    this.tokenStorageService.removeToken();
    this._isAuthenticated.set(false);
    this._role.set(null);
  }

  checkAuthentication(): void {
    const token = this.tokenStorageService.getToken();

    if (!token) {
      this._isAuthenticated.set(false);
      this._role.set(null);
      return;
    }

    const role = this.decodeRole(token);
    this._role.set(role);
    this._isAuthenticated.set(role !== null);
  }

  private decodeRole(token: string): AuthRole | null {
    try {
      const payloadPart = token.split('.')[1];
      if (!payloadPart) {
        return null;
      }

      const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      const role = payload['role'];

      return role === 'ADMIN' || role === 'USER' ? role : null;
    } catch {
      return null;
    }
  }
}