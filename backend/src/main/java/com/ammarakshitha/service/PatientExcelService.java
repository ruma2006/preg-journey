package com.ammarakshitha.service;

import com.ammarakshitha.dto.BulkUploadResult;
import com.ammarakshitha.dto.PatientRegistrationRequest;
import com.ammarakshitha.model.Patient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PatientExcelService {

    private final PatientService patientService;

    // Column indices based on "Amma Rakshitha Patient Registration Form" format
    private static final int COL_NAME = 0;
    private static final int COL_AGE = 1;
    private static final int COL_HUSBAND_NAME = 2;
    private static final int COL_AADHAAR = 3;
    private static final int COL_MOBILE = 4;
    private static final int COL_ALTERNATE_MOBILE = 5;
    private static final int COL_RESIDENCE = 6;
    private static final int COL_DISTRICT = 7;
    private static final int COL_MANDAL = 8;
    private static final int COL_VILLAGE = 9;
    private static final int COL_PINCODE = 10;
    private static final int COL_DOB = 11;
    private static final int COL_LMP_DATE = 12;
    private static final int COL_GRAVIDA = 13;
    private static final int COL_PARA = 14;
    private static final int COL_BLOOD_GROUP = 15;
    private static final int COL_PREVIOUS_COMPLICATIONS = 16;
    private static final int COL_COMPLICATIONS_DETAILS = 17;
    private static final int COL_MEDICAL_HISTORY = 18;
    private static final int COL_ALLERGIES = 19;

    public BulkUploadResult processExcelUpload(MultipartFile file, Long userId) {
        log.info("Processing Excel upload: {}", file.getOriginalFilename());

        List<BulkUploadResult.UploadedPatient> successfulRecords = new ArrayList<>();
        List<BulkUploadResult.FailedRecord> failedRecords = new ArrayList<>();

        try (InputStream inputStream = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(inputStream)) {

            Sheet sheet = workbook.getSheetAt(0);
            int totalRows = sheet.getLastRowNum();
            log.info("Total rows in Excel (excluding header): {}", totalRows);

            // Start from row 1 (skip header row 0)
            for (int rowIndex = 1; rowIndex <= totalRows; rowIndex++) {
                Row row = sheet.getRow(rowIndex);
                if (row == null || isRowEmpty(row)) {
                    continue;
                }

                try {
                    PatientRegistrationRequest request = parseRow(row, rowIndex);
                    Patient patient = patientService.registerPatient(request, userId);

                    successfulRecords.add(BulkUploadResult.UploadedPatient.builder()
                            .id(patient.getId())
                            .name(patient.getName())
                            .motherId(patient.getMotherId())
                            .aadhaarNumber(patient.getAadhaarNumber())
                            .build());

                    log.info("Row {}: Successfully registered patient: {}", rowIndex + 1, patient.getName());

                } catch (Exception e) {
                    String name = getStringValue(row.getCell(COL_NAME));
                    String aadhaar = getStringValue(row.getCell(COL_AADHAAR));

                    failedRecords.add(BulkUploadResult.FailedRecord.builder()
                            .rowNumber(rowIndex + 1)
                            .name(name)
                            .aadhaarNumber(aadhaar)
                            .errorMessage(e.getMessage())
                            .build());

                    log.warn("Row {}: Failed to register patient: {} - {}", rowIndex + 1, name, e.getMessage());
                }
            }

        } catch (IOException e) {
            log.error("Error reading Excel file: {}", e.getMessage());
            throw new RuntimeException("Failed to read Excel file: " + e.getMessage());
        }

        return BulkUploadResult.builder()
                .totalRecords(successfulRecords.size() + failedRecords.size())
                .successCount(successfulRecords.size())
                .failureCount(failedRecords.size())
                .successfulRecords(successfulRecords)
                .failedRecords(failedRecords)
                .build();
    }

    private PatientRegistrationRequest parseRow(Row row, int rowIndex) {
        String name = getStringValue(row.getCell(COL_NAME));
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Name is required");
        }

        Integer age = getIntegerValue(row.getCell(COL_AGE));
        if (age == null) {
            throw new IllegalArgumentException("Age is required");
        }

        String aadhaar = getStringValue(row.getCell(COL_AADHAAR));
        if (aadhaar == null || aadhaar.length() != 12) {
            throw new IllegalArgumentException("Valid 12-digit Aadhaar number is required");
        }

        String mobile = getStringValue(row.getCell(COL_MOBILE));
        if (mobile == null || mobile.length() < 10) {
            throw new IllegalArgumentException("Valid mobile number is required");
        }

        String residence = getStringValue(row.getCell(COL_RESIDENCE));
        if (residence == null || residence.trim().isEmpty()) {
            throw new IllegalArgumentException("Residence is required");
        }

        return PatientRegistrationRequest.builder()
                .name(name.trim())
                .age(age)
                .husbandName(getStringValue(row.getCell(COL_HUSBAND_NAME)))
                .aadhaarNumber(aadhaar)
                .mobileNumber(mobile)
                .alternateMobile(getStringValue(row.getCell(COL_ALTERNATE_MOBILE)))
                .residence(residence.trim())
                .district(getStringValue(row.getCell(COL_DISTRICT)))
                .mandal(getStringValue(row.getCell(COL_MANDAL)))
                .village(getStringValue(row.getCell(COL_VILLAGE)))
                .pincode(getStringValue(row.getCell(COL_PINCODE)))
                .dateOfBirth(getDateValue(row.getCell(COL_DOB)))
                .lmpDate(getDateValue(row.getCell(COL_LMP_DATE)))
                .gravida(getIntegerValue(row.getCell(COL_GRAVIDA)))
                .para(getIntegerValue(row.getCell(COL_PARA)))
                .bloodGroup(getStringValue(row.getCell(COL_BLOOD_GROUP)))
                .hasPreviousComplications(getBooleanValue(row.getCell(COL_PREVIOUS_COMPLICATIONS)))
                .previousComplicationsDetails(getStringValue(row.getCell(COL_COMPLICATIONS_DETAILS)))
                .medicalHistory(getStringValue(row.getCell(COL_MEDICAL_HISTORY)))
                .allergies(getStringValue(row.getCell(COL_ALLERGIES)))
                .build();
    }

    private boolean isRowEmpty(Row row) {
        for (int i = 0; i < 5; i++) { // Check first 5 cells
            Cell cell = row.getCell(i);
            if (cell != null && cell.getCellType() != CellType.BLANK) {
                String value = getStringValue(cell);
                if (value != null && !value.trim().isEmpty()) {
                    return false;
                }
            }
        }
        return true;
    }

    private String getStringValue(Cell cell) {
        if (cell == null) return null;

        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return null;
                }
                // Handle numbers stored as numeric (e.g., Aadhaar, phone)
                double numericValue = cell.getNumericCellValue();
                if (numericValue == Math.floor(numericValue)) {
                    return String.valueOf((long) numericValue);
                }
                return String.valueOf(numericValue);
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                try {
                    return cell.getStringCellValue();
                } catch (Exception e) {
                    return String.valueOf(cell.getNumericCellValue());
                }
            default:
                return null;
        }
    }

    private Integer getIntegerValue(Cell cell) {
        if (cell == null) return null;

        switch (cell.getCellType()) {
            case NUMERIC:
                return (int) cell.getNumericCellValue();
            case STRING:
                try {
                    return Integer.parseInt(cell.getStringCellValue().trim());
                } catch (NumberFormatException e) {
                    return null;
                }
            default:
                return null;
        }
    }

    private LocalDate getDateValue(Cell cell) {
        if (cell == null) return null;

        switch (cell.getCellType()) {
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    Date date = cell.getDateCellValue();
                    return date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
                }
                return null;
            case STRING:
                try {
                    String dateStr = cell.getStringCellValue().trim();
                    if (dateStr.isEmpty()) return null;
                    // Try parsing common date formats
                    if (dateStr.contains("/")) {
                        String[] parts = dateStr.split("/");
                        if (parts.length == 3) {
                            int day = Integer.parseInt(parts[0]);
                            int month = Integer.parseInt(parts[1]);
                            int year = Integer.parseInt(parts[2]);
                            if (year < 100) year += 2000;
                            return LocalDate.of(year, month, day);
                        }
                    } else if (dateStr.contains("-")) {
                        return LocalDate.parse(dateStr);
                    }
                } catch (Exception e) {
                    return null;
                }
                return null;
            default:
                return null;
        }
    }

    private Boolean getBooleanValue(Cell cell) {
        if (cell == null) return false;

        switch (cell.getCellType()) {
            case BOOLEAN:
                return cell.getBooleanCellValue();
            case STRING:
                String value = cell.getStringCellValue().trim().toLowerCase();
                return value.equals("yes") || value.equals("true") || value.equals("1") || value.equals("y");
            case NUMERIC:
                return cell.getNumericCellValue() == 1;
            default:
                return false;
        }
    }

    public byte[] generateTemplate() {
        log.info("Generating Excel template for patient registration");

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Patient Registration");

            // Create header style
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);

            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                "Name*", "Age*", "Husband Name", "Aadhaar Number*", "Mobile Number*",
                "Alternate Mobile", "Residence*", "District", "Mandal", "Village",
                "Pincode", "Date of Birth (DD/MM/YYYY)", "LMP Date (DD/MM/YYYY)",
                "Gravida", "Para", "Blood Group", "Previous Complications (Yes/No)",
                "Complications Details", "Medical History", "Allergies"
            };

            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
                sheet.setColumnWidth(i, 5000);
            }

            // Add sample data row
            Row sampleRow = sheet.createRow(1);
            String[] sampleData = {
                "Lakshmi Devi", "25", "Ramesh Kumar", "123456789012", "9876543210",
                "9876543211", "Nirmal, Telangana", "Nirmal", "Nirmal Urban", "Ward 5",
                "504001", "15/05/2000", "01/01/2026", "2", "1", "B+", "No",
                "", "None", "None"
            };

            for (int i = 0; i < sampleData.length; i++) {
                Cell cell = sampleRow.createCell(i);
                cell.setCellValue(sampleData[i]);
            }

            // Add instructions row
            Row instructionsRow = sheet.createRow(3);
            Cell instructionCell = instructionsRow.createCell(0);
            instructionCell.setCellValue("Note: Fields marked with * are mandatory. Remove this sample row before uploading.");

            workbook.write(outputStream);
            return outputStream.toByteArray();

        } catch (IOException e) {
            log.error("Error generating template: {}", e.getMessage());
            throw new RuntimeException("Failed to generate template: " + e.getMessage());
        }
    }
}
