import { Component, inject, signal } from '@angular/core';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
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

import { ReportApiService } from '../../../../core/services/report/report-api.service';
import { ReportDownloadService } from '../../../../core/services/report/report-download.service';
import { ReportPreviewAsset } from '../../../../core/models/report/report-preview-asset.model';
import { CategoryApiService } from '../../../../core/services/category/category-api.service';
import { CategoryResponse } from '../../../../core/models/category/category-response.model';
import { AssetStatus } from '../../../../core/models/asset/asset-status.enum';

@Component({
  selector: 'app-report-list',
  imports: [
    MatCard,
    MatCardContent,
    MatButton,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
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
  ],
  templateUrl: './report-list.html',
  styleUrl: './report-list.scss',
})
export class ReportList {
  private readonly reportApiService = inject(ReportApiService);
  private readonly reportDownloadService = inject(ReportDownloadService);
  private readonly categoryApiService = inject(CategoryApiService);

  readonly displayedColumns = [
    'inventoryFolio',
    'serialNumber',
    'brand',
    'model',
    'status',
    'acquisitionCost',
    'entryDate',
    'category',
  ];

  readonly categories = signal<CategoryResponse[]>([]);
  readonly statuses = Object.values(AssetStatus);

  readonly searchTerm = signal('');
  readonly selectedCategoryId = signal<number | null>(null);
  readonly selectedStatus = signal<AssetStatus | null>(null);
  readonly minCost = signal('');
  readonly maxCost = signal('');
  readonly filterError = signal('');

  readonly previewAssets = signal<ReportPreviewAsset[]>([]);
  readonly previewTotal = signal(0);
  readonly isPreviewLoading = signal(false);
  readonly previewError = signal('');

  readonly isGenerating = signal(false);
  readonly error = signal('');
  readonly generatedFileName = signal('');

  constructor() {
    this.loadCategories();
    this.loadPreview();
  }

  onSearchTermChange(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  onCategoryChange(value: number | ''): void {
    this.selectedCategoryId.set(value === '' ? null : value);
  }

  onStatusChange(value: AssetStatus | ''): void {
    this.selectedStatus.set(value === '' ? null : value);
  }

  onMinCostChange(event: Event): void {
    this.minCost.set((event.target as HTMLInputElement).value);
  }

  onMaxCostChange(event: Event): void {
    this.maxCost.set((event.target as HTMLInputElement).value);
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
    this.loadPreview();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedCategoryId.set(null);
    this.selectedStatus.set(null);
    this.minCost.set('');
    this.maxCost.set('');
    this.filterError.set('');
    this.loadPreview();
  }

  loadPreview(): void {
    this.isPreviewLoading.set(true);
    this.previewError.set('');

    this.reportApiService.getReportPreview(this.buildQueryOptions()).subscribe({
      next: (response) => {
        this.previewAssets.set(response.assets);
        this.previewTotal.set(response.totalElements);
        this.isPreviewLoading.set(false);
      },
      error: () => {
        this.isPreviewLoading.set(false);
        this.previewError.set('No se pudo cargar la vista previa del reporte.');
      },
    });
  }

  generateReport(): void {
    this.isGenerating.set(true);
    this.error.set('');
    this.generatedFileName.set('');

    this.reportApiService.generateReport(this.buildQueryOptions()).subscribe({
      next: (report) => {
        this.isGenerating.set(false);
        this.generatedFileName.set(report.fileName);
        this.reportDownloadService.downloadReport(report);
      },
      error: () => {
        this.isGenerating.set(false);
        this.error.set('No se pudo generar el reporte.');
      },
    });
  }

  private buildQueryOptions() {
    return {
      search: this.searchTerm().trim() || undefined,
      categoryId: this.selectedCategoryId() ?? undefined,
      status: this.selectedStatus() ?? undefined,
      minCost: this.parseCost(this.minCost()) ?? undefined,
      maxCost: this.parseCost(this.maxCost()) ?? undefined,
    };
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
}