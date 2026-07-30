package org.isaac.techinventoryservice.infrastructure.report.audit;

import org.springframework.stereotype.Component;

import java.io.BufferedWriter;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
public class AuditReportGenerator {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public byte[] generate(String username, int totalRecords) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (BufferedWriter writer = new BufferedWriter(
                new OutputStreamWriter(baos, StandardCharsets.UTF_8))) {

            writer.write("Audit Report");
            writer.newLine();
            writer.write("==============================");
            writer.newLine();
            writer.newLine();
            writer.write("Generation Date : " + LocalDateTime.now().format(FORMATTER));
            writer.newLine();
            writer.write("Requested By    : " + username);
            writer.newLine();
            writer.write("Exported Records: " + totalRecords);
            writer.newLine();

            writer.flush();
        } catch (IOException e) {
            throw new RuntimeException("Error generating audit report", e);
        }
        return baos.toByteArray();
    }
}
