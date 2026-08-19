import { Component, inject, signal } from '@angular/core';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatButton } from '@angular/material/button';
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

@Component({
  selector: 'app-report-list',
  imports: [
    MatCard,
    MatCardContent,
    MatButton,
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

  readonly previewAssets = signal<ReportPreviewAsset[]>([]);
  readonly previewTotal = signal(0);
  readonly isPreviewLoading = signal(false);
  readonly previewError = signal('');

  readonly isGenerating = signal(false);
  readonly error = signal('');
  readonly generatedFileName = signal('');

  constructor() {
    this.loadPreview();
  }

  loadPreview(): void {
    this.isPreviewLoading.set(true);
    this.previewError.set('');

    this.reportApiService.getReportPreview().subscribe({
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

    this.reportApiService.generateReport().subscribe({
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
}