import { Component, inject, signal } from '@angular/core';
import { MatCard, MatCardContent } from '@angular/material/card';
import { forkJoin } from 'rxjs';

import { AssetApiService } from '../../../../core/services/asset/asset-api.service';
import { CategoryApiService } from '../../../../core/services/category/category-api.service';
import { AssetStatus } from '../../../../core/models/asset/asset-status.enum';

@Component({
  selector: 'app-dashboard',
  imports: [MatCard, MatCardContent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly assetApiService = inject(AssetApiService);
  private readonly categoryApiService = inject(CategoryApiService);

  readonly totalAssets = signal(0);
  readonly totalCategories = signal(0);
  readonly availableAssets = signal(0);
  readonly assignedAssets = signal(0);
  readonly isLoading = signal(false);
  readonly error = signal('');

  constructor() {
    this.loadMetrics();
  }

  loadMetrics(): void {
    this.isLoading.set(true);
    this.error.set('');

    const totalAssets$ = this.assetApiService.getAssets(0, 1);
    const availableAssets$ = this.assetApiService.getAssets(0, 1, {
      status: AssetStatus.AVAILABLE,
    });
    const assignedAssets$ = this.assetApiService.getAssets(0, 1, {
      status: AssetStatus.ASSIGNED,
    });
    const categories$ = this.categoryApiService.getCategories();

    forkJoin({
      totalAssets: totalAssets$,
      availableAssets: availableAssets$,
      assignedAssets: assignedAssets$,
      categories: categories$,
    }).subscribe({
      next: (result) => {
        this.totalAssets.set(result.totalAssets.totalElements);
        this.availableAssets.set(result.availableAssets.totalElements);
        this.assignedAssets.set(result.assignedAssets.totalElements);
        this.totalCategories.set(result.categories.length);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.error.set('No se pudieron cargar las métricas del dashboard.');
      },
    });
  }
}