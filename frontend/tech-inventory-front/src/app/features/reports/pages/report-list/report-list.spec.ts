import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MockInstance } from 'vitest';

import { environment } from '../../../../../environments/environment';
import { ReportList } from './report-list';
import { ReportResponse } from '../../../../core/models/report/report-response.model';
import { ReportDownloadService } from '../../../../core/services/report/report-download.service';
import { ReportPreviewAsset } from '../../../../core/models/report/report-preview-asset.model';
import { ReportPreviewResponse } from '../../../../core/models/report/report-preview-response.model';

describe('ReportList', () => {
  let component: ReportList;
  let fixture: ComponentFixture<ReportList>;
  let httpTesting: HttpTestingController;
  let downloadSpy: MockInstance<ReportDownloadService['downloadReport']>;

  const reportUrl = `${environment.apiUrl}/assets/report`;
  const previewUrl = `${environment.apiUrl}/assets/report/preview`;

  const mockReport: ReportResponse = {
    fileName: 'assets.zip',
    contentType: 'application/zip',
    content: 'base64-content',
  };

  const mockPreviewAssets: ReportPreviewAsset[] = [
    {
      inventoryFolio: 'FOL-001',
      serialNumber: 'SN-1001',
      brand: 'Lenovo',
      model: 'ThinkPad T14',
      status: 'AVAILABLE',
      acquisitionCost: 1500,
      entryDate: '2026-01-10T10:00:00',
      category: 'Laptop',
    },
    {
      inventoryFolio: 'FOL-002',
      serialNumber: 'SN-1002',
      brand: 'Dell',
      model: 'Latitude 5420',
      status: 'ASSIGNED',
      acquisitionCost: 1200,
      entryDate: '2026-02-05T09:30:00',
      category: 'Monitor',
    },
  ];

  const mockPreview: ReportPreviewResponse = {
    assets: mockPreviewAssets,
    totalElements: 2,
  };

  const emptyPreview: ReportPreviewResponse = {
    assets: [],
    totalElements: 0,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportList],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    downloadSpy = vi
      .spyOn(TestBed.inject(ReportDownloadService), 'downloadReport')
      .mockImplementation(() => undefined);

    fixture = TestBed.createComponent(ReportList);
    component = fixture.componentInstance;
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === previewUrl)
      .flush(mockPreview);
    await fixture.whenStable();
  });

  afterEach(() => {
    httpTesting.verify();
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the page title', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Reports');
  });

  it('should render a Material card as the main section', () => {
    fixture.detectChanges();
    const card = fixture.nativeElement.querySelector('mat-card');
    expect(card).toBeTruthy();
    expect(card.querySelector('mat-card-content')).toBeTruthy();
  });

  it('should render the brief description of the module', () => {
    fixture.detectChanges();
    const description = fixture.nativeElement.querySelector('.report-description');
    expect(description).toBeTruthy();
    expect(description.textContent).toContain('reportes');
  });

  it('should render the informative initial state when the preview has no records', () => {
    component.loadPreview();
    httpTesting
      .expectOne((req) => req.method === 'GET' && req.url === previewUrl)
      .flush(emptyPreview);

    fixture.detectChanges();

    const emptyState = fixture.nativeElement.querySelector('.report-empty-state');
    expect(emptyState).toBeTruthy();
    expect(emptyState.textContent).toContain('No reports available.');
  });

  it('should load the report preview on initialisation', () => {
    expect(component.previewAssets()).toEqual(mockPreviewAssets);
    expect(component.previewTotal()).toBe(2);
    expect(component.isPreviewLoading()).toBe(false);
    expect(component.previewError()).toBe('');
  });

  it('should set the loading state while loading the preview', () => {
    component.loadPreview();

    expect(component.isPreviewLoading()).toBe(true);
    expect(component.previewError()).toBe('');

    const req = httpTesting.expectOne((req) => req.method === 'GET' && req.url === previewUrl);
    req.flush(mockPreview);

    expect(component.isPreviewLoading()).toBe(false);
  });

  it('should render the preview data in the table', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('FOL-001');
    expect(fixture.nativeElement.textContent).toContain('SN-1001');
    expect(fixture.nativeElement.textContent).toContain('Lenovo');
    expect(fixture.nativeElement.textContent).toContain('ThinkPad T14');
    expect(fixture.nativeElement.textContent).toContain('AVAILABLE');
    expect(fixture.nativeElement.textContent).toContain('1500');
    expect(fixture.nativeElement.textContent).toContain('Laptop');
    expect(fixture.nativeElement.textContent).toContain('FOL-002');
  });

  it('should show the total of records in the preview', () => {
    fixture.detectChanges();

    const total = fixture.nativeElement.querySelector('.report-preview-total');
    expect(total).toBeTruthy();
    expect(total.textContent).toContain('2');
  });

  it('should show an error message when the preview request fails', () => {
    component.loadPreview();

    const req = httpTesting.expectOne((req) => req.method === 'GET' && req.url === previewUrl);
    req.flush({}, { status: 500, statusText: 'Internal Server Error' });

    fixture.detectChanges();

    expect(component.isPreviewLoading()).toBe(false);
    expect(component.previewError()).toBe('No se pudo cargar la vista previa del reporte.');
    expect(fixture.nativeElement.textContent).toContain('No se pudo cargar la vista previa del reporte.');
    expect(fixture.nativeElement.querySelector('.report-status--error')).toBeTruthy();
  });

  it('should send a GET to /assets/report without extra parameters when generating the report', () => {
    component.generateReport();

    const req = httpTesting.expectOne((req) => req.method === 'GET' && req.url === reportUrl);
    expect(req.request.params.keys().length).toBe(0);
    req.flush(mockReport);

    expect(component.isGenerating()).toBe(false);
    expect(component.generatedFileName()).toBe('assets.zip');
  });

  it('should set the loading state while the report is being generated', () => {
    component.generateReport();

    expect(component.isGenerating()).toBe(true);
    expect(component.error()).toBe('');
    expect(component.generatedFileName()).toBe('');

    const req = httpTesting.expectOne((req) => req.method === 'GET' && req.url === reportUrl);
    req.flush(mockReport);

    expect(component.isGenerating()).toBe(false);
  });

  it('should disable the generate button while loading', () => {
    component.generateReport();
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('.report-generate-button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Generating report...');

    const req = httpTesting.expectOne((req) => req.method === 'GET' && req.url === reportUrl);
    req.flush(mockReport);
  });

  it('should show a confirmation when the report is generated successfully', () => {
    component.generateReport();

    const req = httpTesting.expectOne((req) => req.method === 'GET' && req.url === reportUrl);
    req.flush(mockReport);

    fixture.detectChanges();

    expect(component.isGenerating()).toBe(false);
    expect(component.error()).toBe('');
    expect(component.generatedFileName()).toBe('assets.zip');
    expect(fixture.nativeElement.textContent).toContain('Report generated successfully.');
    expect(fixture.nativeElement.querySelector('.report-status--success')).toBeTruthy();
  });

  it('should start the download when the report is generated successfully', () => {
    component.generateReport();

    const req = httpTesting.expectOne((req) => req.method === 'GET' && req.url === reportUrl);
    req.flush(mockReport);

    expect(downloadSpy).toHaveBeenCalledTimes(1);
    expect(downloadSpy).toHaveBeenCalledWith(mockReport);
  });

  it('should not start a download when the report generation fails', () => {
    component.generateReport();

    const req = httpTesting.expectOne((req) => req.method === 'GET' && req.url === reportUrl);
    req.flush({}, { status: 500, statusText: 'Internal Server Error' });

    expect(downloadSpy).not.toHaveBeenCalled();
  });

  it('should show an error message when the report generation fails', () => {
    component.generateReport();

    const req = httpTesting.expectOne((req) => req.method === 'GET' && req.url === reportUrl);
    req.flush({}, { status: 500, statusText: 'Internal Server Error' });

    fixture.detectChanges();

    expect(component.isGenerating()).toBe(false);
    expect(component.generatedFileName()).toBe('');
    expect(component.error()).toBe('No se pudo generar el reporte.');
    expect(fixture.nativeElement.textContent).toContain('No se pudo generar el reporte.');
    expect(fixture.nativeElement.querySelector('.report-status--error')).toBeTruthy();
  });
});