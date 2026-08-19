import { ReportPreviewAsset } from './report-preview-asset.model';

export interface ReportPreviewResponse {
  assets: ReportPreviewAsset[];
  totalElements: number;
}