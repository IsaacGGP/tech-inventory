import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ReportResponse } from '../../models/report/report-response.model';
import { ReportPreviewResponse } from '../../models/report/report-preview-response.model';

@Injectable({ providedIn: 'root' })
export class ReportApiService {
  private readonly http = inject(HttpClient);
  private readonly reportUrl = `${environment.apiUrl}/assets/report`;
  private readonly reportPreviewUrl = `${environment.apiUrl}/assets/report/preview`;

  generateReport(): Observable<ReportResponse> {
    return this.http.get<ReportResponse>(this.reportUrl);
  }

  getReportPreview(): Observable<ReportPreviewResponse> {
    return this.http.get<ReportPreviewResponse>(this.reportPreviewUrl);
  }
}