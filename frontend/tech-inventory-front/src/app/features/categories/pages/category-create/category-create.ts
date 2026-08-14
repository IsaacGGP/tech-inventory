import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

import { CategoryApiService } from '../../../../core/services/category/category-api.service';
import { CreateCategoryRequest } from '../../../../core/models/category/create-category-request.model';

@Component({
  selector: 'app-category-create',
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
    MatCardActions,
    MatProgressSpinner,
  ],
  templateUrl: './category-create.html',
  styleUrl: './category-create.scss',
})
export class CategoryCreate {
  private readonly router = inject(Router);
  private readonly categoryApiService = inject(CategoryApiService);

  readonly categoryForm = new FormGroup({
    name: new FormControl<string>('', Validators.required),
    prefixCode: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(3),
    ]),
  });

  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  createCategory(): void {
    this.categoryForm.markAllAsTouched();

    if (this.categoryForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const request: CreateCategoryRequest = {
      name: this.categoryForm.value.name ?? '',
      prefixCode: this.categoryForm.value.prefixCode ?? '',
    };

    this.categoryApiService.createCategory(request).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/categories']);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('No se pudo crear la categoría.');
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/categories']);
  }
}