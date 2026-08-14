import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { LoginRequest } from '../../models/auth/login-request.model';
import { LoginResponse } from '../../models/auth/login-response.model';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly loginUrl = `${environment.apiUrl}/auth/login`;

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.loginUrl, request);
  }
}