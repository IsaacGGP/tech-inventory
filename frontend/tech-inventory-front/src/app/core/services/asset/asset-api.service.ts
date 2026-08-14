import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { PagedAssetResponse } from '../../models/asset/paged-asset-response.model';
import { AssetResponse } from '../../models/asset/asset-response.model';
import { AssetStatus } from '../../models/asset/asset-status.enum';
import { CreateAssetRequest } from '../../models/asset/create-asset-request.model';
import { UpdateAssetRequest } from '../../models/asset/update-asset-request.model';
import { UpdateAssetStatusRequest } from '../../models/asset/update-asset-status-request.model';

export interface AssetQueryOptions {
  search?: string;
  categoryId?: number;
  status?: AssetStatus;
  minCost?: number;
  maxCost?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

@Injectable({ providedIn: 'root' })
export class AssetApiService {
  private readonly http = inject(HttpClient);
  private readonly assetsUrl = `${environment.apiUrl}/assets`;

  getAssets(page: number, size: number, options: AssetQueryOptions = {}): Observable<PagedAssetResponse> {
    let params = new HttpParams().set('page', page).set('size', size);

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
    if (options.sortBy) {
      params = params.set('sortBy', options.sortBy);
    }
    if (options.sortDirection) {
      params = params.set('sortDirection', options.sortDirection);
    }

    return this.http.get<PagedAssetResponse>(this.assetsUrl, { params });
  }

  createAsset(request: CreateAssetRequest): Observable<AssetResponse> {
    return this.http.post<AssetResponse>(this.assetsUrl, request);
  }

  getAssetById(technicalId: string): Observable<AssetResponse> {
    return this.http.get<AssetResponse>(`${this.assetsUrl}/${technicalId}`);
  }

  updateAsset(technicalId: string, request: UpdateAssetRequest): Observable<AssetResponse> {
    return this.http.put<AssetResponse>(`${this.assetsUrl}/${technicalId}`, request);
  }

  updateAssetStatus(technicalId: string, status: AssetStatus): Observable<AssetResponse> {
    const request: UpdateAssetStatusRequest = { status };
    return this.http.patch<AssetResponse>(`${this.assetsUrl}/${technicalId}/status`, request);
  }
}