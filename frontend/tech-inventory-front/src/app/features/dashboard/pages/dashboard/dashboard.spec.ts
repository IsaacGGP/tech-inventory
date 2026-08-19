import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { environment } from '../../../../../environments/environment';
import { Dashboard } from './dashboard';
import { PagedAssetResponse } from '../../../../core/models/asset/paged-asset-response.model';
import { CategoryResponse } from '../../../../core/models/category/category-response.model';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let httpTesting: HttpTestingController;

  const assetsUrl = `${environment.apiUrl}/assets`;
  const categoriesUrl = `${environment.apiUrl}/categories`;

  const mockCategories: CategoryResponse[] = [
    { id: 1, name: 'Laptop', prefixCode: 'LAP' },
    { id: 2, name: 'Monitor', prefixCode: 'MON' },
    { id: 3, name: 'Teclado', prefixCode: 'TEC' },
    { id: 4, name: 'Mouse', prefixCode: 'MOU' },
    { id: 5, name: 'Impresora', prefixCode: 'IMP' },
  ];

  function paged(totalElements: number): PagedAssetResponse {
    return {
      content: [],
      page: 0,
      size: 1,
      totalElements,
      totalPages: totalElements === 0 ? 0 : totalElements,
    };
  }

  function flushAllRequests(): void {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl && !req.params.has('status'))
      .flush(paged(20));
    httpTesting
      .expectOne(
        (req) =>
          req.method === 'GET' && req.url === assetsUrl && req.params.get('status') === 'AVAILABLE'
      )
      .flush(paged(6));
    httpTesting
      .expectOne(
        (req) =>
          req.method === 'GET' && req.url === assetsUrl && req.params.get('status') === 'ASSIGNED'
      )
      .flush(paged(4));
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === categoriesUrl)
      .flush(mockCategories);
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    flushAllRequests();
    await fixture.whenStable();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load the four metrics on initialisation', () => {
    expect(component.totalAssets()).toBe(20);
    expect(component.availableAssets()).toBe(6);
    expect(component.assignedAssets()).toBe(4);
    expect(component.totalCategories()).toBe(mockCategories.length);
    expect(component.isLoading()).toBe(false);
    expect(component.error()).toBe('');
  });

  it('should send the correct parameters to the assets endpoint', () => {
    component.loadMetrics();

    const totalReq = httpTesting.expectOne(
      (req) => req.method === 'GET' && req.url === assetsUrl && !req.params.has('status')
    );
    expect(totalReq.request.params.get('page')).toBe('0');
    expect(totalReq.request.params.get('size')).toBe('1');
    totalReq.flush(paged(20));

    const availableReq = httpTesting.expectOne(
      (req) =>
        req.method === 'GET' && req.url === assetsUrl && req.params.get('status') === 'AVAILABLE'
    );
    expect(availableReq.request.params.get('page')).toBe('0');
    expect(availableReq.request.params.get('size')).toBe('1');
    expect(availableReq.request.params.get('status')).toBe('AVAILABLE');
    availableReq.flush(paged(6));

    const assignedReq = httpTesting.expectOne(
      (req) =>
        req.method === 'GET' && req.url === assetsUrl && req.params.get('status') === 'ASSIGNED'
    );
    expect(assignedReq.request.params.get('page')).toBe('0');
    expect(assignedReq.request.params.get('size')).toBe('1');
    expect(assignedReq.request.params.get('status')).toBe('ASSIGNED');
    assignedReq.flush(paged(4));

    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === categoriesUrl)
      .flush(mockCategories);
  });

  it('should set the total categories from the response length', () => {
    expect(component.totalCategories()).toBe(mockCategories.length);
  });

  it('should show the loading state while loading the metrics', () => {
    component.loadMetrics();

    expect(component.isLoading()).toBe(true);
    expect(component.error()).toBe('');

    flushAllRequests();

    expect(component.isLoading()).toBe(false);
  });

  it('should show an error when a request fails', () => {
    component.loadMetrics();

    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl && !req.params.has('status'))
      .flush(paged(20));
    httpTesting
      .expectOne(
        (req) =>
          req.method === 'GET' && req.url === assetsUrl && req.params.get('status') === 'AVAILABLE'
      )
      .flush(paged(6));
    httpTesting
      .expectOne(
        (req) =>
          req.method === 'GET' && req.url === assetsUrl && req.params.get('status') === 'ASSIGNED'
      )
      .flush(paged(4));
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === categoriesUrl)
      .flush({}, { status: 500, statusText: 'Internal Server Error' });

    expect(component.isLoading()).toBe(false);
    expect(component.error()).toBe('No se pudieron cargar las métricas del dashboard.');
  });

  it('should render the metrics in the cards', () => {
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Total de activos');
    expect(text).toContain('Total de categorías');
    expect(text).toContain('Activos disponibles');
    expect(text).toContain('Activos asignados');
    expect(fixture.nativeElement.querySelectorAll('mat-card').length).toBe(4);
  });
});