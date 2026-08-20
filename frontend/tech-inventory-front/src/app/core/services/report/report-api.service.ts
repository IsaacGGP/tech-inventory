import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ReportResponse } from '../../models/report/report-response.model';
import { ReportPreviewResponse } from '../../models/report/report-preview-response.model';
import { AssetStatus } from '../../models/asset/asset-status.enum';

export interface ReportQueryOptions {
  search?: string;
  categoryId?: number;
  status?: AssetStatus;
  minCost?: number;
  maxCost?: number;
}

@Injectable({ providedIn: 'root' })
export class ReportApiService {
  private readonly http = inject(HttpClient);
  private readonly reportUrl = `${environment.apiUrl}/assets/report`;
  private readonly reportPreviewUrl = `${environment.apiUrl}/assets/report/preview`;

  generateReport(options: ReportQueryOptions = {}): Observable<ReportResponse> {
    return this.http.get<ReportResponse>(this.reportUrl, { params: this.buildParams(options) });
  }

  getReportPreview(options: ReportQueryOptions = {}): Observable<ReportPreviewResponse> {
    return this.http.get<ReportPreviewResponse>(this.reportPreviewUrl, {
      params: this.buildParams(options),
    });
  }

  private buildParams(options: ReportQueryOptions): HttpParams {
    let params = new HttpParams();

    if (options.search) {
      params = params.set('search', options.search);
    }
    if (options.categoryId !== undefined && options.categoryId !== null) {
      params = params.set('categoryId', options.categoryId);
    }
    if (options.status) {
      params = params.set('status', options.status);
    }
    if (options.minCost !== undefined && options.minCost !== null) {
      params = params.set('minCost', options.minCost);
    }
    if (options.maxCost !== undefined && options.maxCost !== null) {
      params = params.set('maxCost', options.maxCost);
    }

    return params;
  }
}