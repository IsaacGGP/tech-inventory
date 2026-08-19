import { TestBed } from '@angular/core/testing';

import { ReportDownloadService } from './report-download.service';
import { ReportResponse } from '../../models/report/report-response.model';

describe('ReportDownloadService', () => {
  let service: ReportDownloadService;

  const mockReport: ReportResponse = {
    fileName: 'assets.zip',
    contentType: 'application/zip',
    content: 'SGVsbG8gd29ybGQ=',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ReportDownloadService] });
    service = TestBed.inject(ReportDownloadService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should convert the base64 content into a Blob with the correct MIME type', async () => {
    const blob = service.createBlob(mockReport);

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('application/zip');
    expect(await blob.text()).toBe('Hello world');
  });

  it('should start a download using the file name and the generated object URL', () => {
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);

    const anchor = document.createElement('a');
    const clickSpy = vi.spyOn(anchor, 'click').mockImplementation(() => undefined);
    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(anchor);
    const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => anchor);
    const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => anchor);

    service.downloadReport(mockReport);

    expect(createObjectURLSpy).toHaveBeenCalledWith(expect.any(Blob));
    expect(anchor.download).toBe('assets.zip');
    expect(anchor.href).toBe('blob:test');
    expect(appendChildSpy).toHaveBeenCalledWith(anchor);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(removeChildSpy).toHaveBeenCalledWith(anchor);
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:test');

    createElementSpy.mockRestore();
    clickSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
  });
});