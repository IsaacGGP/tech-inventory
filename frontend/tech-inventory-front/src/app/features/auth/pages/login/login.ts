import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

import { AuthService } from '../../../../core/services/auth/auth.service';
import { LoginRequest } from '../../../../core/models/auth/login-request.model';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
    MatButton,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatProgressSpinner,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loginForm = new FormGroup({
    username: new FormControl<string>('', Validators.required),
    password: new FormControl<string>('', Validators.required),
  });

  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const request: LoginRequest = {
      username: this.loginForm.value.username ?? '',
      password: this.loginForm.value.password ?? '',
    };

    this.authService.login(request).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Credenciales inválidas.');
      },
    });
  }
}