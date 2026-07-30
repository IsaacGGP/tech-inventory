package org.isaac.techinventoryservice.infrastructure.report.zip;

import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Component
public class ZipReportGenerator {

    public byte[] generate(byte[] excelBytes, byte[] auditBytes) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(baos)) {

            ZipEntry excelEntry = new ZipEntry("assets.xlsx");
            zos.putNextEntry(excelEntry);
            zos.write(excelBytes);
            zos.closeEntry();

            ZipEntry auditEntry = new ZipEntry("audit.txt");
            zos.putNextEntry(auditEntry);
            zos.write(auditBytes);
            zos.closeEntry();

        } catch (IOException e) {
            throw new RuntimeException("Error generating ZIP report", e);
        }
        return baos.toByteArray();
    }
}
