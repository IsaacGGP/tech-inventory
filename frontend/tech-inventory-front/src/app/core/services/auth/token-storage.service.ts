import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private readonly TOKEN_KEY = 'auth_token';

  saveToken(token: string): void {
    if (!token || token === 'undefined' || token === 'null') {
      this.removeToken();
      return;
    }
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token || token === 'undefined' || token === 'null') {
      return null;
    }
    return token;
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  hasToken(): boolean {
    return this.getToken() !== null;
  }
}