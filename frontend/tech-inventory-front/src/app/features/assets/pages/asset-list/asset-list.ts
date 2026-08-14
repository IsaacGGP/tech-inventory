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
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';

import { AssetApiService } from '../../../../core/services/asset/asset-api.service';
import { AssetResponse } from '../../../../core/models/asset/asset-response.model';
import { AssetStatus } from '../../../../core/models/asset/asset-status.enum';
import { CategoryApiService } from '../../../../core/services/category/category-api.service';
import { CategoryResponse } from '../../../../core/models/category/category-response.model';

@Component({
  selector: 'app-asset-list',
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
    MatFormField,
    MatLabel,
    MatInput,
    MatPaginator,
    MatSelect,
    MatOption,
    MatSort,
    MatSortHeader,
  ],
  templateUrl: './asset-list.html',
  styleUrl: './asset-list.scss',
})
export class AssetList {
  private readonly assetApiService = inject(AssetApiService);
  private readonly categoryApiService = inject(CategoryApiService);
  private readonly router = inject(Router);

  readonly displayedColumns = [
    'inventoryFolio',
    'serialNumber',
    'brand',
    'model',
    'status',
    'category',
    'actions',
  ];

  readonly assets = signal<AssetResponse[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal('');
  readonly searchTerm = signal('');

  readonly statusError = signal('');
  private readonly updatingStatuses = signal<ReadonlySet<string>>(new Set());
  private readonly displayedStatuses = signal<Record<string, AssetStatus>>({});

  readonly categories = signal<CategoryResponse[]>([]);
  readonly selectedCategoryId = signal<number | null>(null);
  readonly selectedStatus = signal<AssetStatus | null>(null);
  readonly minCost = signal('');
  readonly maxCost = signal('');
  readonly filterError = signal('');

  readonly statuses = Object.values(AssetStatus);

  readonly currentPage = signal(0);
  readonly pageSize = signal(10);
  readonly totalElements = signal(0);
  readonly totalPages = signal(0);

  readonly sortBy = signal<string | null>(null);
  readonly sortDirection = signal<'asc' | 'desc' | null>(null);

  constructor() {
    this.loadCategories();
    this.loadAssets();
  }

  onSearchTermChange(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  goToNewAsset(): void {
    this.router.navigate(['/assets/new']);
  }

  goToEditAsset(technicalId: string): void {
    this.router.navigate(['/assets/edit', technicalId]);
  }

  onAssetStatusChange(asset: AssetResponse, value: AssetStatus): void {
    if (!value || value === asset.status) {
      return;
    }
    if (asset.status === AssetStatus.RETIRED || this.updatingStatuses().has(asset.technicalId)) {
      return;
    }

    this.displayedStatuses.update((map) => ({ ...map, [asset.technicalId]: value }));
    this.statusError.set('');
    this.updatingStatuses.update((set) => new Set(set).add(asset.technicalId));

    this.assetApiService.updateAssetStatus(asset.technicalId, value).subscribe({
      next: () => {
        this.updatingStatuses.update((set) => {
          const next = new Set(set);
          next.delete(asset.technicalId);
          return next;
        });
        this.displayedStatuses.update((map) => {
          const next = { ...map };
          delete next[asset.technicalId];
          return next;
        });
        this.loadAssets();
      },
      error: () => {
        this.updatingStatuses.update((set) => {
          const next = new Set(set);
          next.delete(asset.technicalId);
          return next;
        });
        this.displayedStatuses.update((map) => {
          const next = { ...map };
          delete next[asset.technicalId];
          return next;
        });
        this.statusError.set('No se pudo actualizar el estado del activo.');
      },
    });
  }

  displayedStatus(technicalId: string, currentStatus: AssetStatus): AssetStatus {
    return this.displayedStatuses()[technicalId] ?? currentStatus;
  }

  statusClass(status: AssetStatus): string {
    return `asset-status-indicator asset-status-indicator--${status.toLowerCase()}`;
  }

  isStatusUpdating(technicalId: string): boolean {
    return this.updatingStatuses().has(technicalId);
  }

  isStatusDisabled(asset: AssetResponse): boolean {
    return asset.status === AssetStatus.RETIRED || this.isStatusUpdating(asset.technicalId);
  }

  onMinCostChange(event: Event): void {
    this.minCost.set((event.target as HTMLInputElement).value);
  }

  onMaxCostChange(event: Event): void {
    this.maxCost.set((event.target as HTMLInputElement).value);
  }

  onCategoryChange(value: number | ''): void {
    this.selectedCategoryId.set(value === '' ? null : value);
  }

  onStatusChange(value: AssetStatus | ''): void {
    this.selectedStatus.set(value === '' ? null : value);
  }

  search(): void {
    this.currentPage.set(0);
    this.loadAssets();
  }

  clear(): void {
    this.searchTerm.set('');
    this.currentPage.set(0);
    this.loadAssets();
  }

  applyFilters(): void {
    const min = this.parseCost(this.minCost());
    const max = this.parseCost(this.maxCost());

    if (min !== null && min < 0) {
      this.filterError.set('El costo mínimo no puede ser negativo.');
      return;
    }
    if (max !== null && max < 0) {
      this.filterError.set('El costo máximo no puede ser negativo.');
      return;
    }
    if (min !== null && max !== null && min > max) {
      this.filterError.set('El costo mínimo no puede ser mayor que el costo máximo.');
      return;
    }

    this.filterError.set('');
    this.currentPage.set(0);
    this.loadAssets();
  }

  clearFilters(): void {
    this.selectedCategoryId.set(null);
    this.selectedStatus.set(null);
    this.minCost.set('');
    this.maxCost.set('');
    this.filterError.set('');
    this.currentPage.set(0);
    this.loadAssets();
  }

  onPageChange(event: PageEvent): void {
    const isPageSizeChange = event.pageSize !== this.pageSize();
    this.pageSize.set(event.pageSize);
    if (isPageSizeChange) {
      this.currentPage.set(0);
    } else {
      this.currentPage.set(event.pageIndex);
    }

    this.loadAssets();
  }

  onSortChange(event: Sort): void {
    if (event.direction === '') {
      this.sortBy.set(null);
      this.sortDirection.set(null);
    } else {
      this.sortBy.set(event.active);
      this.sortDirection.set(event.direction);
    }
    this.currentPage.set(0);
    this.loadAssets();
  }

  private parseCost(value: string): number | null {
    const trimmed = value.trim();
    if (trimmed === '') {
      return null;
    }
    const parsed = Number(trimmed);
    return Number.isNaN(parsed) ? null : parsed;
  }

  private loadCategories(): void {
    this.categoryApiService.getCategories().subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => undefined,
    });
  }

  private loadAssets(): void {
    this.isLoading.set(true);
    this.error.set('');

    const search = this.searchTerm().trim() || undefined;
    const categoryId = this.selectedCategoryId() ?? undefined;
    const status = this.selectedStatus() ?? undefined;
    const minCost = this.parseCost(this.minCost()) ?? undefined;
    const maxCost = this.parseCost(this.maxCost()) ?? undefined;
    const sortBy = this.sortBy() ?? undefined;
    const sortDirection = this.sortDirection() ?? undefined;

    this.assetApiService
      .getAssets(this.currentPage(), this.pageSize(), {
        search,
        categoryId,
        status,
        minCost,
        maxCost,
        sortBy,
        sortDirection,
      })
      .subscribe({
        next: (response) => {
          this.assets.set(response.content);
          this.totalElements.set(response.totalElements);
          this.totalPages.set(response.totalPages);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.error.set('No se pudieron cargar los activos.');
        },
      });
  }
}