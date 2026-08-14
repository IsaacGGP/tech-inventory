import { AssetResponse } from './asset-response.model';

export interface PagedAssetResponse {
  content: AssetResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
