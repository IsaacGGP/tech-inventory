import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  MatTable,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatCell,
  MatCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
} from '@angular/material/table';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

import { AuthService } from '../../../../core/services/auth/auth.service';
import { CategoryApiService } from '../../../../core/services/category/category-api.service';
import { CategoryResponse } from '../../../../core/models/category/category-response.model';

@Component({
  selector: 'app-category-list',
  imports: [
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatCell,
    MatCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatIconButton,
    MatButton,
    MatIcon,
  ],
  templateUrl: './category-list.html',
  styleUrl: './category-list.scss',
})
export class CategoryList {
  private readonly categoryApiService = inject(CategoryApiService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly displayedColumns = ['id', 'name', 'prefix', 'actions'];

  readonly categories = signal<CategoryResponse[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal('');

  readonly showNewCategoryButton = signal(this.authService.role() === 'ADMIN');

  constructor() {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.isLoading.set(true);
    this.error.set('');

    this.categoryApiService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.error.set('No se pudieron cargar las categorías.');
      },
    });
  }

  goToNewCategory(): void {
    this.router.navigate(['/categories/new']);
  }
}