import { Injectable } from '@angular/core';

import { ReportResponse } from '../../models/report/report-response.model';

@Injectable({ providedIn: 'root' })
export class ReportDownloadService {
  createBlob(report: ReportResponse): Blob {
    const byteCharacters = atob(report.content);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: report.contentType });
  }

  downloadReport(report: ReportResponse): void {
    const blob = this.createBlob(report);
    const url = window.URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = report.fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    window.URL.revokeObjectURL(url);
  }
}