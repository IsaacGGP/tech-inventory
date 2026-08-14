import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { environment } from '../../../../../environments/environment';
import { AssetList } from './asset-list';
import { AssetResponse } from '../../../../core/models/asset/asset-response.model';
import { AssetStatus } from '../../../../core/models/asset/asset-status.enum';
import { PagedAssetResponse } from '../../../../core/models/asset/paged-asset-response.model';
import { CategoryResponse } from '../../../../core/models/category/category-response.model';

describe('AssetList', () => {
  let component: AssetList;
  let fixture: ComponentFixture<AssetList>;
  let httpTesting: HttpTestingController;

  const assetsUrl = `${environment.apiUrl}/assets`;
  const categoriesUrl = `${environment.apiUrl}/categories`;

  const mockCategories: CategoryResponse[] = [
    { id: 1, name: 'Laptop', prefixCode: 'LAP' },
    { id: 2, name: 'Monitor', prefixCode: 'MON' },
  ];

  const mockAssets: AssetResponse[] = [
    {
      technicalId: 'a1b2c3d4-0000-0000-0000-000000000001',
      inventoryFolio: 'FOL-001',
      serialNumber: 'SN-1001',
      brand: 'Lenovo',
      model: 'ThinkPad T14',
      status: AssetStatus.AVAILABLE,
      acquisitionCost: 1500,
      entryDate: '2026-01-10T10:00:00',
      category: { id: 1, name: 'Laptop', prefixCode: 'LAP' },
    },
    {
      technicalId: 'a1b2c3d4-0000-0000-0000-000000000002',
      inventoryFolio: 'FOL-002',
      serialNumber: 'SN-1002',
      brand: 'Dell',
      model: 'Latitude 5420',
      status: AssetStatus.ASSIGNED,
      acquisitionCost: 1200,
      entryDate: '2026-02-05T09:30:00',
      category: { id: 2, name: 'Monitor', prefixCode: 'MON' },
    },
  ];

  function makeAsset(i: number): AssetResponse {
    return {
      technicalId: `a1b2c3d4-0000-0000-0000-${String(i).padStart(12, '0')}`,
      inventoryFolio: `FOL-${String(i).padStart(3, '0')}`,
      serialNumber: `SN-${1000 + i}`,
      brand: i % 2 === 0 ? 'Dell' : 'HP',
      model: `Model ${i}`,
      status: AssetStatus.AVAILABLE,
      acquisitionCost: 1000 + i,
      entryDate: '2026-01-10T10:00:00',
      category: { id: 1, name: 'Laptop', prefixCode: 'LAP' },
    };
  }

  function paged(content: AssetResponse[], page: number, size: number, totalElements: number): PagedAssetResponse {
    return {
      content,
      page,
      size,
      totalElements,
      totalPages: totalElements === 0 ? 0 : Math.ceil(totalElements / size),
    };
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetList],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);

    fixture = TestBed.createComponent(AssetList);
    component = fixture.componentInstance;

    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === categoriesUrl)
      .flush(mockCategories);

    await fixture.whenStable();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged([], 0, 10, 0));
  });

  it('should load assets on initialisation with page 0 and size 10', () => {
    const req = httpTesting.expectOne((req) => req.method === 'GET' && req.url === assetsUrl);
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('10');
    expect(req.request.params.has('search')).toBe(false);
    req.flush(paged(mockAssets, 0, 10, mockAssets.length));

    expect(component.assets()).toEqual(mockAssets);
    expect(component.currentPage()).toBe(0);
    expect(component.pageSize()).toBe(10);
    expect(component.isLoading()).toBe(false);
    expect(component.error()).toBe('');
  });

  it('should render the content of the page in the table', () => {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged(mockAssets, 0, 10, mockAssets.length));

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('FOL-001');
    expect(fixture.nativeElement.textContent).toContain('FOL-002');
    expect(fixture.nativeElement.textContent).toContain('ThinkPad T14');
  });

  it('should update the pagination metadata from the response', () => {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged(mockAssets, 0, 10, 25));

    expect(component.totalElements()).toBe(25);
    expect(component.totalPages()).toBe(3);
  });

  it('should change page and request the new page', () => {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged([makeAsset(1), makeAsset(2)], 0, 10, 25));

    component.onPageChange({ pageIndex: 1, pageSize: 10, length: 25, previousPageIndex: 0 });

    const req = httpTesting.expectOne((req) => req.method === 'GET' && req.url === assetsUrl);
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('size')).toBe('10');
    req.flush(paged([makeAsset(11), makeAsset(12)], 1, 10, 25));

    expect(component.currentPage()).toBe(1);
    expect(component.assets()).toEqual([makeAsset(11), makeAsset(12)]);
  });

  it('should change page size, reset to page 0 and reload', () => {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged([makeAsset(1)], 0, 10, 15));

    component.onPageChange({ pageIndex: 0, pageSize: 20, length: 15, previousPageIndex: undefined });

    const req = httpTesting.expectOne((req) => req.method === 'GET' && req.url === assetsUrl);
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('20');
    req.flush(paged([makeAsset(1)], 0, 20, 15));

    expect(component.pageSize()).toBe(20);
    expect(component.currentPage()).toBe(0);
  });

  it('should preserve the active search when changing page size', () => {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged([], 0, 10, 0));

    component.searchTerm.set('Dell');
    component.search();
    httpTesting
      .expectOne(
        (req) =>
          req.method === 'GET' &&
          req.url === assetsUrl &&
          req.params.get('search') === 'Dell'
      )
      .flush(paged([makeAsset(2)], 0, 10, 15));

    component.onPageChange({ pageIndex: 0, pageSize: 20, length: 15, previousPageIndex: undefined });

    const req = httpTesting.expectOne((req) => req.method === 'GET' && req.url === assetsUrl);
    expect(req.request.params.get('search')).toBe('Dell');
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('20');
    req.flush(paged([makeAsset(2)], 0, 20, 15));

    expect(component.pageSize()).toBe(20);
    expect(component.currentPage()).toBe(0);
  });

  it('should search with a term on page 0', () => {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged([], 0, 10, 0));

    component.searchTerm.set('Dell');
    component.search();

    const req = httpTesting.expectOne(
      (req) =>
        req.method === 'GET' &&
        req.url === assetsUrl &&
        req.params.get('search') === 'Dell' &&
        req.params.get('page') === '0' &&
        req.params.get('size') === '10'
    );
    req.flush(paged([makeAsset(2)], 0, 10, 15));

    expect(component.assets()).toEqual([makeAsset(2)]);
    expect(component.isLoading()).toBe(false);
  });

  it('should trim the search term before searching', () => {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged([], 0, 10, 0));

    component.searchTerm.set('  Dell  ');
    component.search();

    const req = httpTesting.expectOne(
      (req) =>
        req.method === 'GET' &&
        req.url === assetsUrl &&
        req.params.get('search') === 'Dell'
    );
    req.flush(paged([makeAsset(2)], 0, 10, 15));
  });

  it('should use the normal listing when the search term is empty or whitespace', () => {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged([], 0, 10, 0));

    component.searchTerm.set('   ');
    component.search();

    const req = httpTesting.expectOne((req) => req.method === 'GET' && req.url === assetsUrl);
    expect(req.request.params.has('search')).toBe(false);
    req.flush(paged(mockAssets, 0, 10, mockAssets.length));

    expect(component.assets()).toEqual(mockAssets);
  });

  it('should keep the search when changing page', () => {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged([], 0, 10, 0));

    component.searchTerm.set('Dell');
    component.search();
    httpTesting
      .expectOne(
        (req) =>
          req.method === 'GET' &&
          req.url === assetsUrl &&
          req.params.get('search') === 'Dell' &&
          req.params.get('page') === '0'
      )
      .flush(paged([makeAsset(2)], 0, 10, 15));

    component.onPageChange({ pageIndex: 1, pageSize: 10, length: 15, previousPageIndex: 0 });

    const req = httpTesting.expectOne((req) => req.method === 'GET' && req.url === assetsUrl);
    expect(req.request.params.get('search')).toBe('Dell');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('size')).toBe('10');
    req.flush(paged([makeAsset(4)], 1, 10, 15));

    expect(component.currentPage()).toBe(1);
  });

  it('should reset the page to 0 when searching', () => {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged([makeAsset(1)], 0, 10, 25));

    component.onPageChange({ pageIndex: 2, pageSize: 10, length: 25, previousPageIndex: 1 });
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged([makeAsset(21)], 2, 10, 25));

    component.searchTerm.set('Dell');
    component.search();

    const req = httpTesting.expectOne((req) => req.method === 'GET' && req.url === assetsUrl);
    expect(req.request.params.get('search')).toBe('Dell');
    expect(req.request.params.get('page')).toBe('0');
    expect(component.currentPage()).toBe(0);
    req.flush(paged([makeAsset(2)], 0, 10, 15));
  });

  it('should clear the search, reset the page to 0 and reload the first page', () => {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged([], 0, 10, 0));

    component.searchTerm.set('Dell');
    component.search();
    httpTesting
      .expectOne(
        (req) =>
          req.method === 'GET' &&
          req.url === assetsUrl &&
          req.params.get('search') === 'Dell' &&
          req.params.get('page') === '0'
      )
      .flush(paged([makeAsset(2)], 0, 10, 15));

    component.onPageChange({ pageIndex: 2, pageSize: 10, length: 15, previousPageIndex: 1 });
    httpTesting
      .expectOne(
        (req) =>
          req.method === 'GET' &&
          req.url === assetsUrl &&
          req.params.get('search') === 'Dell' &&
          req.params.get('page') === '2'
      )
      .flush(paged([makeAsset(6)], 2, 10, 15));

    component.clear();

    expect(component.searchTerm()).toBe('');
    expect(component.currentPage()).toBe(0);
    const req = httpTesting.expectOne((req) => req.method === 'GET' && req.url === assetsUrl);
    expect(req.request.params.has('search')).toBe(false);
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('10');
    req.flush(paged(mockAssets, 0, 10, mockAssets.length));

    expect(component.assets()).toEqual(mockAssets);
  });

  it('should load categories on initialisation', () => {
    expect(component.categories()).toEqual(mockCategories);
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged([], 0, 10, 0));
  });

  it('should apply the category filter and reset the page to 0', () => {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged([], 0, 10, 30));

    component.onPageChange({ pageIndex: 2, pageSize: 10, length: 30, previousPageIndex: 1 });
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged([], 2, 10, 30));

    component.selectedCategoryId.set(1);
    component.applyFilters();

    const req = httpTesting.expectOne((req) => req.method === 'GET' && req.url === assetsUrl);
    expect(req.request.params.get('categoryId')).toBe('1');
    expect(req.request.params.get('page')).toBe('0');
    expect(component.currentPage()).toBe(0);
    req.flush(paged([makeAsset(1)], 0, 10, 30));
  });

  it('should apply the status filter', () => {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged([], 0, 10, 0));

    component.selectedStatus.set(AssetStatus.AVAILABLE);
    component.applyFilters();

    const req = httpTesting.expectOne((req) => req.method === 'GET' && req.url === assetsUrl);
    expect(req.request.params.get('status')).toBe('AVAILABLE');
    req.flush(paged([makeAsset(1)], 0, 10, 1));
  });

  it('should apply min and max cost filters', () => {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged([], 0, 10, 0));

    component.minCost.set('500');
    component.maxCost.set('1500');
    component.applyFilters();

    const req = httpTesting.expectOne((req) => req.method === 'GET' && req.url === assetsUrl);
    expect(req.request.params.get('minCost')).toBe('500');
    expect(req.request.params.get('maxCost')).toBe('1500');
    req.flush(paged([makeAsset(1)], 0, 10, 1));
  });

  it('should combine multiple filters in a single request', () => {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged([], 0, 10, 0));

    component.selectedCategoryId.set(1);
    component.selectedStatus.set(AssetStatus.ASSIGNED);
    component.minCost.set('100');
    component.maxCost.set('2000');
    component.applyFilters();

    const req = httpTesting.expectOne((req) => req.method === 'GET' && req.url === assetsUrl);
    expect(req.request.params.get('categoryId')).toBe('1');
    expect(req.request.params.get('status')).toBe('ASSIGNED');
    expect(req.request.params.get('minCost')).toBe('100');
    expect(req.request.params.get('maxCost')).toBe('2000');
    expect(req.request.params.has('search')).toBe(false);
    req.flush(paged([makeAsset(1)], 0, 10, 1));
  });

  it('should keep the active search when applying filters', () => {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged([], 0, 10, 0));

    component.searchTerm.set('Dell');
    component.search();
    httpTesting
      .expectOne(
        (req) =>
          req.method === 'GET' &&
          req.url === assetsUrl &&
          req.params.get('search') === 'Dell'
      )
      .flush(paged([makeAsset(2)], 0, 10, 15));

    component.selectedStatus.set(AssetStatus.MAINTENANCE);
    component.applyFilters();

    const req = httpTesting.expectOne((req) => req.method === 'GET' && req.url === assetsUrl);
    expect(req.request.params.get('search')).toBe('Dell');
    expect(req.request.params.get('status')).toBe('MAINTENANCE');
    expect(req.request.params.get('page')).toBe('0');
    req.flush(paged([], 0, 10, 0));
  });

  it('should keep the active filters when changing page', () => {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged([], 0, 10, 0));

    component.selectedCategoryId.set(2);
    component.applyFilters();
    httpTesting
      .expectOne(
        (req) =>
          req.method === 'GET' &&
          req.url === assetsUrl &&
          req.params.get('categoryId') === '2'
      )
      .flush(paged([makeAsset(2)], 0, 10, 25));

    component.onPageChange({ pageIndex: 2, pageSize: 10, length: 25, previousPageIndex: 1 });

    const req = httpTesting.expectOne((req) => req.method === 'GET' && req.url === assetsUrl);
    expect(req.request.params.get('categoryId')).toBe('2');
    expect(req.request.params.get('page')).toBe('2');
    req.flush(paged([], 2, 10, 25));
  });

  it('should keep the active filters when changing page size', () => {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged([], 0, 10, 0));

    component.selectedStatus.set(AssetStatus.RETIRED);
    component.applyFilters();
    httpTesting
      .expectOne(
        (req) =>
          req.method === 'GET' &&
          req.url === assetsUrl &&
          req.params.get('status') === 'RETIRED'
      )
      .flush(paged([makeAsset(1)], 0, 10, 20));

    component.onPageChange({ pageIndex: 0, pageSize: 20, length: 20, previousPageIndex: undefined });

    const req = httpTesting.expectOne((req) => req.method === 'GET' && req.url === assetsUrl);
    expect(req.request.params.get('status')).toBe('RETIRED');
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('20');
    req.flush(paged([], 0, 20, 20));
  });

  it('should clear only the filters and keep the current search', () => {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged([], 0, 10, 0));

    component.searchTerm.set('Dell');
    component.search();
    httpTesting
      .expectOne(
        (req) =>
          req.method === 'GET' &&
          req.url === assetsUrl &&
          req.params.get('search') === 'Dell'
      )
      .flush(paged([makeAsset(2)], 0, 10, 15));

    component.selectedCategoryId.set(1);
    component.selectedStatus.set(AssetStatus.ASSIGNED);
    component.minCost.set('100');
    component.maxCost.set('2000');
    component.applyFilters();
    httpTesting
      .expectOne(
        (req) =>
          req.method === 'GET' &&
          req.url === assetsUrl &&
          req.params.get('search') === 'Dell' &&
          req.params.get('categoryId') === '1'
      )
      .flush(paged([makeAsset(2)], 0, 10, 15));

    component.clearFilters();

    expect(component.selectedCategoryId()).toBeNull();
    expect(component.selectedStatus()).toBeNull();
    expect(component.minCost()).toBe('');
    expect(component.maxCost()).toBe('');
    expect(component.searchTerm()).toBe('Dell');
    expect(component.currentPage()).toBe(0);

    const req = httpTesting.expectOne((req) => req.method === 'GET' && req.url === assetsUrl);
    expect(req.request.params.get('search')).toBe('Dell');
    expect(req.request.params.has('categoryId')).toBe(false);
    expect(req.request.params.has('status')).toBe(false);
    expect(req.request.params.has('minCost')).toBe(false);
    expect(req.request.params.has('maxCost')).toBe(false);
    expect(req.request.params.get('page')).toBe('0');
    req.flush(paged([makeAsset(2)], 0, 10, 15));
  });

  it('should show an error and not request when min cost is negative', () => {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged([], 0, 10, 0));

    component.minCost.set('-5');
    component.applyFilters();

    expect(component.filterError()).toContain('negativo');
    expect(component.currentPage()).toBe(0);
    httpTesting.expectNone((req) => req.method === 'GET' && req.url === assetsUrl);
  });

  it('should show an error and not request when max cost is negative', () => {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged([], 0, 10, 0));

    component.maxCost.set('-1');
    component.applyFilters();

    expect(component.filterError()).toContain('negativo');
    httpTesting.expectNone((req) => req.method === 'GET' && req.url === assetsUrl);
  });

  it('should show an error and not request when min cost is greater than max cost', () => {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged([], 0, 10, 0));

    component.minCost.set('2000');
    component.maxCost.set('1000');
    component.applyFilters();

    expect(component.filterError()).toContain('mayor');
    expect(component.currentPage()).toBe(0);
    httpTesting.expectNone((req) => req.method === 'GET' && req.url === assetsUrl);
  });

  it('should set an error when a filtered request fails', () => {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged([], 0, 10, 0));

    component.selectedCategoryId.set(1);
    component.applyFilters();

    const req = httpTesting.expectOne(
      (req) =>
        req.method === 'GET' &&
        req.url === assetsUrl &&
        req.params.get('categoryId') === '1'
    );
    req.flush({}, { status: 500, statusText: 'Internal Server Error' });

    expect(component.error()).toBe('No se pudieron cargar los activos.');
    expect(component.isLoading()).toBe(false);
  });

  it('should set an error when the request fails', () => {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush({}, { status: 500, statusText: 'Internal Server Error' });

    expect(component.error()).toBe('No se pudieron cargar los activos.');
    expect(component.isLoading()).toBe(false);
    expect(component.assets()).toEqual([]);
  });

  it('should navigate to the asset creation screen', () => {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged([], 0, 10, 0));

    const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate');
    component.goToNewAsset();

    expect(navigateSpy).toHaveBeenCalledWith(['/assets/new']);
  });

  it('should navigate to the asset edit screen with the technicalId', () => {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged([], 0, 10, 0));

    const navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate');
    component.goToEditAsset('a1b2c3d4-0000-0000-0000-000000000001');

    expect(navigateSpy).toHaveBeenCalledWith(['/assets/edit', 'a1b2c3d4-0000-0000-0000-000000000001']);
  });

  it('should render the status of each asset', () => {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged(mockAssets, 0, 10, mockAssets.length));

    fixture.detectChanges();

    const statusSelects = fixture.nativeElement.querySelectorAll('td.cdk-column-status mat-select');
    expect(statusSelects.length).toBe(mockAssets.length);
    expect(component.displayedStatus(mockAssets[0].technicalId, mockAssets[0].status)).toBe(
      AssetStatus.AVAILABLE
    );
    expect(component.displayedStatus(mockAssets[1].technicalId, mockAssets[1].status)).toBe(
      AssetStatus.ASSIGNED
    );
  });

  it('should render a green indicator for AVAILABLE assets', () => {
    const available: AssetResponse = { ...mockAssets[0], status: AssetStatus.AVAILABLE };

    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged([available], 0, 10, 1));

    fixture.detectChanges();

    const indicators = fixture.nativeElement.querySelectorAll('.asset-status-indicator--available');
    expect(indicators.length).toBe(1);
    expect(indicators[0].classList.contains('asset-status-indicator')).toBe(true);
    expect(indicators[0].getAttribute('aria-label')).toContain(AssetStatus.AVAILABLE);
  });

  it('should render a blue indicator for ASSIGNED assets', () => {
    const assigned: AssetResponse = { ...mockAssets[1], status: AssetStatus.ASSIGNED };

    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged([assigned], 0, 10, 1));

    fixture.detectChanges();

    const indicators = fixture.nativeElement.querySelectorAll('.asset-status-indicator--assigned');
    expect(indicators.length).toBe(1);
    expect(indicators[0].classList.contains('asset-status-indicator')).toBe(true);
    expect(indicators[0].getAttribute('aria-label')).toContain(AssetStatus.ASSIGNED);
  });

  it('should render a yellow indicator for MAINTENANCE assets', () => {
    const maintenance: AssetResponse = { ...mockAssets[0], status: AssetStatus.MAINTENANCE };

    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged([maintenance], 0, 10, 1));

    fixture.detectChanges();

    const indicators = fixture.nativeElement.querySelectorAll('.asset-status-indicator--maintenance');
    expect(indicators.length).toBe(1);
    expect(indicators[0].classList.contains('asset-status-indicator')).toBe(true);
    expect(indicators[0].getAttribute('aria-label')).toContain(AssetStatus.MAINTENANCE);
  });

  it('should render a red indicator for RETIRED assets', () => {
    const retired: AssetResponse = { ...mockAssets[1], status: AssetStatus.RETIRED };

    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged([retired], 0, 10, 1));

    fixture.detectChanges();

    const indicators = fixture.nativeElement.querySelectorAll('.asset-status-indicator--retired');
    expect(indicators.length).toBe(1);
    expect(indicators[0].classList.contains('asset-status-indicator')).toBe(true);
    expect(indicators[0].getAttribute('aria-label')).toContain(AssetStatus.RETIRED);
  });

  it('should render the correct indicator class for each status in the list', () => {
    const available: AssetResponse = { ...mockAssets[0], status: AssetStatus.AVAILABLE };
    const assigned: AssetResponse = { ...mockAssets[1], status: AssetStatus.ASSIGNED };
    const maintenance: AssetResponse = { ...mockAssets[0], status: AssetStatus.MAINTENANCE };
    const retired: AssetResponse = { ...mockAssets[1], status: AssetStatus.RETIRED };

    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged([available, assigned, maintenance, retired], 0, 10, 4));

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.asset-status-indicator--available').length).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('.asset-status-indicator--assigned').length).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('.asset-status-indicator--maintenance').length).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('.asset-status-indicator--retired').length).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('.asset-status-indicator').length).toBe(4);
  });

  it('should send a PATCH with the new status when the status changes', () => {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged(mockAssets, 0, 10, mockAssets.length));

    component.onAssetStatusChange(mockAssets[0], AssetStatus.ASSIGNED);

    const req = httpTesting.expectOne(
      (req) =>
        req.method === 'PATCH' &&
        req.url === `${assetsUrl}/${mockAssets[0].technicalId}/status`
    );
    expect(req.request.body).toEqual({ status: AssetStatus.ASSIGNED });
    req.flush({ ...mockAssets[0], status: AssetStatus.ASSIGNED });

    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged([{ ...mockAssets[0], status: AssetStatus.ASSIGNED }, mockAssets[1]], 0, 10, 2));

    expect(component.assets()[0].status).toBe(AssetStatus.ASSIGNED);
  });

  it('should refresh the list after a successful status change', () => {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged(mockAssets, 0, 10, mockAssets.length));

    component.onAssetStatusChange(mockAssets[0], AssetStatus.MAINTENANCE);

    const req = httpTesting.expectOne(
      (req) =>
        req.method === 'PATCH' &&
        req.url === `${assetsUrl}/${mockAssets[0].technicalId}/status`
    );
    req.flush({ ...mockAssets[0], status: AssetStatus.MAINTENANCE });

    const reload = httpTesting.expectOne((req) => req.method === 'GET' && req.url === assetsUrl);
    expect(component.isLoading()).toBe(true);
    reload.flush(paged([{ ...mockAssets[0], status: AssetStatus.MAINTENANCE }, mockAssets[1]], 0, 10, 2));

    expect(component.isLoading()).toBe(false);
    expect(component.statusError()).toBe('');
    expect(component.isStatusUpdating(mockAssets[0].technicalId)).toBe(false);
  });

  it('should show an error when the status change fails', () => {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged(mockAssets, 0, 10, mockAssets.length));

    component.onAssetStatusChange(mockAssets[0], AssetStatus.ASSIGNED);

    const req = httpTesting.expectOne(
      (req) =>
        req.method === 'PATCH' &&
        req.url === `${assetsUrl}/${mockAssets[0].technicalId}/status`
    );
    req.flush({}, { status: 500, statusText: 'Internal Server Error' });

    expect(component.statusError()).toBe('No se pudo actualizar el estado del activo.');
    expect(component.isLoading()).toBe(false);
    expect(component.isStatusUpdating(mockAssets[0].technicalId)).toBe(false);
  });

  it('should not allow changing the status of a retired asset', () => {
    const retiredAsset: AssetResponse = { ...mockAssets[0], status: AssetStatus.RETIRED };

    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged([retiredAsset], 0, 10, 1));

    expect(component.isStatusDisabled(retiredAsset)).toBe(true);

    component.onAssetStatusChange(retiredAsset, AssetStatus.AVAILABLE);

    httpTesting.expectNone((req) => req.method === 'PATCH');
  });

  it('should not send a request when selecting the same status', () => {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged(mockAssets, 0, 10, mockAssets.length));

    component.onAssetStatusChange(mockAssets[0], AssetStatus.AVAILABLE);

    httpTesting.expectNone((req) => req.method === 'PATCH');
    expect(component.isStatusUpdating(mockAssets[0].technicalId)).toBe(false);
  });

  it('should prevent multiple simultaneous requests for the same asset', () => {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged(mockAssets, 0, 10, mockAssets.length));

    component.onAssetStatusChange(mockAssets[0], AssetStatus.ASSIGNED);
    component.onAssetStatusChange(mockAssets[0], AssetStatus.MAINTENANCE);

    const req = httpTesting.expectOne(
      (req) =>
        req.method === 'PATCH' &&
        req.url === `${assetsUrl}/${mockAssets[0].technicalId}/status`
    );
    expect(req.request.body).toEqual({ status: AssetStatus.ASSIGNED });
    req.flush({ ...mockAssets[0], status: AssetStatus.ASSIGNED });

    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged([{ ...mockAssets[0], status: AssetStatus.ASSIGNED }, mockAssets[1]], 0, 10, 2));
  });

  it('should not send sort parameters on initial load', () => {
    const req = httpTesting.expectOne((req) => req.method === 'GET' && req.url === assetsUrl);
    expect(req.request.params.has('sortBy')).toBe(false);
    expect(req.request.params.has('sortDirection')).toBe(false);
    req.flush(paged(mockAssets, 0, 10, mockAssets.length));

    expect(component.sortBy()).toBeNull();
    expect(component.sortDirection()).toBeNull();
  });

  it('should sort ascending by brand and request the backend', () => {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged(mockAssets, 0, 10, mockAssets.length));

    component.onSortChange({ active: 'brand', direction: 'asc' });

    const req = httpTesting.expectOne((req) => req.method === 'GET' && req.url === assetsUrl);
    expect(req.request.params.get('sortBy')).toBe('brand');
    expect(req.request.params.get('sortDirection')).toBe('asc');
    req.flush(paged(mockAssets, 0, 10, mockAssets.length));

    expect(component.sortBy()).toBe('brand');
    expect(component.sortDirection()).toBe('asc');
  });

  it('should sort descending by brand and request the backend', () => {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged(mockAssets, 0, 10, mockAssets.length));

    component.onSortChange({ active: 'brand', direction: 'desc' });

    const req = httpTesting.expectOne((req) => req.method === 'GET' && req.url === assetsUrl);
    expect(req.request.params.get('sortBy')).toBe('brand');
    expect(req.request.params.get('sortDirection')).toBe('desc');
    req.flush(paged(mockAssets, 0, 10, mockAssets.length));

    expect(component.sortBy()).toBe('brand');
    expect(component.sortDirection()).toBe('desc');
  });

  it('should reset the page to 0 when sorting', () => {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged(mockAssets, 0, 10, 25));

    component.onPageChange({ pageIndex: 2, pageSize: 10, length: 25, previousPageIndex: 1 });
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged([makeAsset(21)], 2, 10, 25));

    component.onSortChange({ active: 'brand', direction: 'asc' });

    const req = httpTesting.expectOne((req) => req.method === 'GET' && req.url === assetsUrl);
    expect(req.request.params.get('sortBy')).toBe('brand');
    expect(req.request.params.get('sortDirection')).toBe('asc');
    expect(req.request.params.get('page')).toBe('0');
    expect(component.currentPage()).toBe(0);
    req.flush(paged(mockAssets, 0, 10, 25));
  });

  it('should keep the active search when sorting', () => {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged([], 0, 10, 0));

    component.searchTerm.set('Dell');
    component.search();
    httpTesting
      .expectOne(
        (req) =>
          req.method === 'GET' &&
          req.url === assetsUrl &&
          req.params.get('search') === 'Dell'
      )
      .flush(paged([makeAsset(2)], 0, 10, 15));

    component.onSortChange({ active: 'brand', direction: 'asc' });

    const req = httpTesting.expectOne((req) => req.method === 'GET' && req.url === assetsUrl);
    expect(req.request.params.get('search')).toBe('Dell');
    expect(req.request.params.get('sortBy')).toBe('brand');
    expect(req.request.params.get('sortDirection')).toBe('asc');
    req.flush(paged([makeAsset(2)], 0, 10, 15));
  });

  it('should keep the active filters when sorting', () => {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged([], 0, 10, 0));

    component.selectedCategoryId.set(1);
    component.selectedStatus.set(AssetStatus.ASSIGNED);
    component.minCost.set('100');
    component.maxCost.set('2000');
    component.applyFilters();
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged([makeAsset(1)], 0, 10, 1));

    component.onSortChange({ active: 'brand', direction: 'desc' });

    const req = httpTesting.expectOne((req) => req.method === 'GET' && req.url === assetsUrl);
    expect(req.request.params.get('categoryId')).toBe('1');
    expect(req.request.params.get('status')).toBe('ASSIGNED');
    expect(req.request.params.get('minCost')).toBe('100');
    expect(req.request.params.get('maxCost')).toBe('2000');
    expect(req.request.params.get('sortBy')).toBe('brand');
    expect(req.request.params.get('sortDirection')).toBe('desc');
    req.flush(paged([makeAsset(1)], 0, 10, 1));
  });

  it('should keep the page size when sorting', () => {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged([], 0, 10, 0));

    component.onPageChange({ pageIndex: 0, pageSize: 20, length: 15, previousPageIndex: undefined });
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged([], 0, 20, 15));

    component.onSortChange({ active: 'brand', direction: 'asc' });

    const req = httpTesting.expectOne((req) => req.method === 'GET' && req.url === assetsUrl);
    expect(req.request.params.get('size')).toBe('20');
    expect(req.request.params.get('sortBy')).toBe('brand');
    expect(req.request.params.get('sortDirection')).toBe('asc');
    req.flush(paged([], 0, 20, 15));
  });

  it('should clear the sort when direction is empty and not send sort parameters', () => {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged(mockAssets, 0, 10, mockAssets.length));

    component.onSortChange({ active: 'brand', direction: 'asc' });
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged(mockAssets, 0, 10, mockAssets.length));

    component.onSortChange({ active: 'brand', direction: '' });

    const req = httpTesting.expectOne((req) => req.method === 'GET' && req.url === assetsUrl);
    expect(req.request.params.has('sortBy')).toBe(false);
    expect(req.request.params.has('sortDirection')).toBe(false);
    expect(component.sortBy()).toBeNull();
    expect(component.sortDirection()).toBeNull();
    req.flush(paged(mockAssets, 0, 10, mockAssets.length));
  });

  it('should render sortable headers for the columns enabled for sorting', () => {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === assetsUrl)
      .flush(paged(mockAssets, 0, 10, mockAssets.length));

    fixture.detectChanges();

    const sortHeaders = fixture.nativeElement.querySelectorAll('th[mat-sort-header]');
    expect(sortHeaders.length).toBe(5);
  });
});