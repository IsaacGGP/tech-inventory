import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { CategoryResponse } from '../../models/category/category-response.model';
import { CreateCategoryRequest } from '../../models/category/create-category-request.model';

@Injectable({ providedIn: 'root' })
export class CategoryApiService {
  private readonly http = inject(HttpClient);
  private readonly categoriesUrl = `${environment.apiUrl}/categories`;

  getCategories(): Observable<CategoryResponse[]> {
    return this.http.get<CategoryResponse[]>(this.categoriesUrl);
  }

  createCategory(request: CreateCategoryRequest): Observable<CategoryResponse> {
    return this.http.post<CategoryResponse>(this.categoriesUrl, request);
  }
}