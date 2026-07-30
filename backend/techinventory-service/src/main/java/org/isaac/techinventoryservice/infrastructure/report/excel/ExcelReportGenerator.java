package org.isaac.techinventoryservice.infrastructure.report.excel;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.isaac.techinventoryservice.domain.model.Asset;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;

@Component
public class ExcelReportGenerator {

    private static final String[] HEADERS = {
            "technicalId", "inventoryFolio", "serialNumber", "brand", "model",
            "status", "acquisitionCost", "entryDate",
            "categoryId", "categoryName", "categoryPrefixCode"
    };

    public byte[] generate(List<Asset> assets) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Assets");

            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle currencyStyle = createCurrencyStyle(workbook);
            CellStyle dateStyle = createDateStyle(workbook);

            createHeaderRow(sheet, headerStyle);

            int rowIndex = 1;
            for (Asset asset : assets) {
                Row row = sheet.createRow(rowIndex++);
                writeAssetRow(row, asset, currencyStyle, dateStyle);
            }

            sheet.createFreezePane(0, 1);

            for (int i = 0; i < HEADERS.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(baos);
            return baos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Error generating Excel report", e);
        }
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private CellStyle createCurrencyStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setDataFormat(workbook.getCreationHelper().createDataFormat().getFormat("$#,##0.00"));
        return style;
    }

    private CellStyle createDateStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setDataFormat(workbook.getCreationHelper().createDataFormat().getFormat("yyyy-mm-dd hh:mm:ss"));
        return style;
    }

    private void createHeaderRow(Sheet sheet, CellStyle headerStyle) {
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < HEADERS.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(HEADERS[i]);
            cell.setCellStyle(headerStyle);
        }
    }

    private void writeAssetRow(Row row, Asset asset, CellStyle currencyStyle, CellStyle dateStyle) {
        row.createCell(0).setCellValue(asset.getTechnicalId().toString());
        row.createCell(1).setCellValue(asset.getInventoryFolio());
        row.createCell(2).setCellValue(asset.getSerialNumber());
        row.createCell(3).setCellValue(asset.getBrand());
        row.createCell(4).setCellValue(asset.getModel());
        row.createCell(5).setCellValue(asset.getStatus().name());

        Cell costCell = row.createCell(6);
        costCell.setCellValue(asset.getAcquisitionCost().doubleValue());
        costCell.setCellStyle(currencyStyle);

        Cell dateCell = row.createCell(7);
        dateCell.setCellValue(Date.from(asset.getEntryDate().atZone(ZoneId.systemDefault()).toInstant()));
        dateCell.setCellStyle(dateStyle);

        row.createCell(8).setCellValue(asset.getCategory().getId());
        row.createCell(9).setCellValue(asset.getCategory().getName());
        row.createCell(10).setCellValue(asset.getCategory().getPrefixCode());
    }
}
