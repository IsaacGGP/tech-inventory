import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { environment } from '../../../../../environments/environment';
import { AssetForm } from './asset-form';
import { CategoryResponse } from '../../../../core/models/category/category-response.model';
import { AssetResponse } from '../../../../core/models/asset/asset-response.model';
import { AssetStatus } from '../../../../core/models/asset/asset-status.enum';

const assetsUrl = `${environment.apiUrl}/assets`;
const categoriesUrl = `${environment.apiUrl}/categories`;

const mockCategories: CategoryResponse[] = [
  { id: 1, name: 'Laptop', prefixCode: 'LAP' },
  { id: 2, name: 'Monitor', prefixCode: 'MON' },
];

const technicalId = 'a1b2c3d4-0000-0000-0000-000000000001';

const mockAsset: AssetResponse = {
  technicalId,
  inventoryFolio: 'FOL-001',
  serialNumber: 'SN-1001',
  brand: 'Lenovo',
  model: 'ThinkPad T14',
  status: AssetStatus.AVAILABLE,
  acquisitionCost: 1500,
  entryDate: '2026-01-10T10:00:00',
  category: { id: 1, name: 'Laptop', prefixCode: 'LAP' },
};

function activatedRouteStub(id: string | null): unknown {
  return {
    snapshot: {
      paramMap: {
        get: (key: string) => (key === 'technicalId' ? id : null),
      },
    },
  };
}

describe('AssetForm (create mode)', () => {
  let component: AssetForm;
  let fixture: ComponentFixture<AssetForm>;
  let httpTesting: HttpTestingController;
  let router: Router;

  function fillValidForm(): void {
    component.assetForm.setValue({
      serialNumber: 'SN-2001',
      brand: 'Lenovo',
      model: 'ThinkPad X1',
      acquisitionCost: 1500,
      categoryId: 1,
    });
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetForm],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: activatedRouteStub(null) },
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);

    fixture = TestBed.createComponent(AssetForm);
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
  });

  it('should not be in edit mode', () => {
    expect(component.isEditMode()).toBe(false);
  });

  it('should load categories on initialisation', () => {
    expect(component.categories()).toEqual(mockCategories);
  });

  it('should start with an invalid form', () => {
    expect(component.assetForm.invalid).toBe(true);
  });

  it('should require all fields', () => {
    const form = component.assetForm;
    expect(form.controls.serialNumber.hasError('required')).toBe(true);
    expect(form.controls.brand.hasError('required')).toBe(true);
    expect(form.controls.model.hasError('required')).toBe(true);
    expect(form.controls.acquisitionCost.hasError('required')).toBe(true);
    expect(form.controls.categoryId.hasError('required')).toBe(true);
  });

  it('should reject an acquisition cost of zero or less', () => {
    const cost = component.assetForm.controls.acquisitionCost;

    cost.setValue(0);
    expect(cost.hasError('min')).toBe(true);

    cost.setValue(-10);
    expect(cost.hasError('min')).toBe(true);
  });

  it('should disable the submit button while the form is invalid', () => {
    fixture.detectChanges();
    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(submitButton.disabled).toBe(true);
  });

  it('should enable the submit button when the form is valid', () => {
    fillValidForm();
    fixture.detectChanges();
    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(submitButton.disabled).toBe(false);
  });

  it('should send a POST with the form values and navigate to the list', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    fillValidForm();

    component.saveAsset();

    const req = httpTesting.expectOne((req) => req.method === 'POST' && req.url === assetsUrl);
    expect(req.request.body).toEqual({
      serialNumber: 'SN-2001',
      brand: 'Lenovo',
      model: 'ThinkPad X1',
      acquisitionCost: 1500,
      categoryId: 1,
    });
    req.flush({}, { status: 201, statusText: 'Created' });

    expect(component.isLoading()).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/assets']);
  });

  it('should not send a request when the form is invalid', () => {
    component.saveAsset();

    httpTesting.expectNone((req) => req.method === 'POST' && req.url === assetsUrl);
  });

  it('should show an error message and keep the values when the request fails', () => {
    fillValidForm();

    component.saveAsset();

    const req = httpTesting.expectOne((req) => req.method === 'POST' && req.url === assetsUrl);
    req.flush({}, { status: 500, statusText: 'Internal Server Error' });

    expect(component.errorMessage()).toBe('No se pudo crear el activo.');
    expect(component.isLoading()).toBe(false);
    expect(component.assetForm.value.serialNumber).toBe('SN-2001');
    expect(component.assetForm.value.brand).toBe('Lenovo');
  });
});

describe('AssetForm (edit mode)', () => {
  let component: AssetForm;
  let fixture: ComponentFixture<AssetForm>;
  let httpTesting: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetForm],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: activatedRouteStub(technicalId) },
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);

    fixture = TestBed.createComponent(AssetForm);
    component = fixture.componentInstance;

    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === categoriesUrl)
      .flush(mockCategories);

    await fixture.whenStable();
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should detect edit mode when the technicalId is present', () => {
    expect(component.isEditMode()).toBe(true);

    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === `${assetsUrl}/${technicalId}`)
      .flush(mockAsset);
  });

  it('should load the asset by technicalId', () => {
    const req = httpTesting.expectOne(
      (req) => req.method === 'GET' && req.url === `${assetsUrl}/${technicalId}`
    );
    req.flush(mockAsset);

    expect(component.isLoading()).toBe(false);
    expect(component.errorMessage()).toBe('');
  });

  it('should preload the form with the asset values', () => {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === `${assetsUrl}/${technicalId}`)
      .flush(mockAsset);

    expect(component.assetForm.value.serialNumber).toBe('SN-1001');
    expect(component.assetForm.value.brand).toBe('Lenovo');
    expect(component.assetForm.value.model).toBe('ThinkPad T14');
    expect(component.assetForm.value.acquisitionCost).toBe(1500);
    expect(component.assetForm.value.categoryId).toBe(1);
  });

  it('should send a PUT with the form values and navigate to the list', () => {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === `${assetsUrl}/${technicalId}`)
      .flush(mockAsset);

    const navigateSpy = vi.spyOn(router, 'navigate');

    component.assetForm.patchValue({ serialNumber: 'SN-UPDATED' });
    component.saveAsset();

    const req = httpTesting.expectOne(
      (req) => req.method === 'PUT' && req.url === `${assetsUrl}/${technicalId}`
    );
    expect(req.request.body).toEqual({
      serialNumber: 'SN-UPDATED',
      brand: 'Lenovo',
      model: 'ThinkPad T14',
      acquisitionCost: 1500,
      categoryId: 1,
    });
    req.flush({}, { status: 200, statusText: 'OK' });

    expect(component.isLoading()).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/assets']);
  });

  it('should show an error message when the asset load fails', () => {
    const req = httpTesting.expectOne(
      (req) => req.method === 'GET' && req.url === `${assetsUrl}/${technicalId}`
    );
    req.flush({}, { status: 500, statusText: 'Internal Server Error' });

    expect(component.errorMessage()).toBe('No se pudo cargar el activo.');
    expect(component.isLoading()).toBe(false);
  });

  it('should show an error message and keep the values when the update fails', () => {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === `${assetsUrl}/${technicalId}`)
      .flush(mockAsset);

    component.assetForm.patchValue({ serialNumber: 'SN-UPDATED' });
    component.saveAsset();

    const req = httpTesting.expectOne(
      (req) => req.method === 'PUT' && req.url === `${assetsUrl}/${technicalId}`
    );
    req.flush({}, { status: 500, statusText: 'Internal Server Error' });

    expect(component.errorMessage()).toBe('No se pudo actualizar el activo.');
    expect(component.isLoading()).toBe(false);
    expect(component.assetForm.value.serialNumber).toBe('SN-UPDATED');
  });

  it('should keep the same validations in edit mode', () => {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === `${assetsUrl}/${technicalId}`)
      .flush(mockAsset);

    component.assetForm.controls.serialNumber.setValue('');
    expect(component.assetForm.controls.serialNumber.hasError('required')).toBe(true);

    component.assetForm.controls.acquisitionCost.setValue(0);
    expect(component.assetForm.controls.acquisitionCost.hasError('min')).toBe(true);
  });

  it('should render the edit title', () => {
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === `${assetsUrl}/${technicalId}`)
      .flush(mockAsset);

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Edit Asset');
  });
});