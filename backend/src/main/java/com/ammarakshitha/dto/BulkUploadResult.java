package com.ammarakshitha.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkUploadResult {

    private int totalRecords;
    private int successCount;
    private int failureCount;

    @Builder.Default
    private List<UploadedPatient> successfulRecords = new ArrayList<>();

    @Builder.Default
    private List<FailedRecord> failedRecords = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UploadedPatient {
        private Long id;
        private String name;
        private String motherId;
        private String aadhaarNumber;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FailedRecord {
        private int rowNumber;
        private String name;
        private String aadhaarNumber;
        private String errorMessage;
    }
}
