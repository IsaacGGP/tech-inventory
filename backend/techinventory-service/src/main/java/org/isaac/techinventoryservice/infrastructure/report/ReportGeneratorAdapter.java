package org.isaac.techinventoryservice.infrastructure.report;

import org.isaac.techinventoryservice.application.port.output.ReportGeneratorPort;
import org.isaac.techinventoryservice.domain.model.Asset;
import org.isaac.techinventoryservice.infrastructure.report.audit.AuditReportGenerator;
import org.isaac.techinventoryservice.infrastructure.report.excel.ExcelReportGenerator;
import org.isaac.techinventoryservice.infrastructure.report.zip.ZipReportGenerator;
import org.springframework.stereotype.Component;

import java.util.Base64;
import java.util.List;

@Component
public class ReportGeneratorAdapter implements ReportGeneratorPort {

    private final ExcelReportGenerator excelReportGenerator;
    private final AuditReportGenerator auditReportGenerator;
    private final ZipReportGenerator zipReportGenerator;

    public ReportGeneratorAdapter(ExcelReportGenerator excelReportGenerator,
                                  AuditReportGenerator auditReportGenerator,
                                  ZipReportGenerator zipReportGenerator) {
        this.excelReportGenerator = excelReportGenerator;
        this.auditReportGenerator = auditReportGenerator;
        this.zipReportGenerator = zipReportGenerator;
    }

    @Override
    public String generateAssetReport(List<Asset> assets, String username) {
        byte[] excelBytes = excelReportGenerator.generate(assets);
        byte[] auditBytes = auditReportGenerator.generate(username, assets.size());
        byte[] zipBytes = zipReportGenerator.generate(excelBytes, auditBytes);
        return Base64.getEncoder().encodeToString(zipBytes);
    }
}
