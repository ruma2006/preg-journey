package com.ammarakshitha.controller;

import com.ammarakshitha.dto.ApiResponse;
import com.ammarakshitha.dto.BulkUploadResult;
import com.ammarakshitha.dto.DeliveryCompletionRequest;
import com.ammarakshitha.dto.PatientDTO;
import com.ammarakshitha.dto.PatientRegistrationRequest;
import com.ammarakshitha.model.Patient;
import com.ammarakshitha.model.enums.PatientStatus;
import com.ammarakshitha.model.enums.RiskLevel;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;
import com.ammarakshitha.service.PatientExcelService;
import com.ammarakshitha.service.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/v1/patients")
@RequiredArgsConstructor
@Tag(name = "Patient Management", description = "APIs for patient registration and management")
public class PatientController {

    private final PatientService patientService;
    private final PatientExcelService patientExcelService;

    @PostMapping
    @Operation(summary = "Register a new patient")
    @PreAuthorize("hasAnyRole('ADMIN', 'HELP_DESK')")
    public ResponseEntity<ApiResponse<Patient>> registerPatient(
            @Valid @RequestBody PatientRegistrationRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        // TODO: Get user ID from security context
        Long userId = 1L; // Placeholder
        Patient patient = patientService.registerPatient(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(patient, "Patient registered successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get patient by ID")
    public ResponseEntity<ApiResponse<Patient>> getPatientById(@PathVariable Long id) {
        Patient patient = patientService.getPatientById(id);
        return ResponseEntity.ok(ApiResponse.success(patient));
    }

    @GetMapping("/mother-id/{motherId}")
    @Operation(summary = "Get patient by Mother ID")
    public ResponseEntity<ApiResponse<Patient>> getPatientByMotherId(@PathVariable String motherId) {
        Patient patient = patientService.getPatientByMotherId(motherId);
        return ResponseEntity.ok(ApiResponse.success(patient));
    }

    @GetMapping("/aadhaar/{aadhaarNumber}")
    @Operation(summary = "Get patient by Aadhaar number")
    @PreAuthorize("hasAnyRole('ADMIN', 'HELP_DESK', 'DOCTOR')")
    public ResponseEntity<ApiResponse<Patient>> getPatientByAadhaar(@PathVariable String aadhaarNumber) {
        Patient patient = patientService.getPatientByAadhaar(aadhaarNumber);
        return ResponseEntity.ok(ApiResponse.success(patient));
    }

    @GetMapping
    @Operation(summary = "Get all patients with pagination")
    public ResponseEntity<ApiResponse<Page<Patient>>> getAllPatients(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<Patient> patients = patientService.getAllPatients(pageable);
        return ResponseEntity.ok(ApiResponse.success(patients));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get patients by status")
    public ResponseEntity<ApiResponse<Page<Patient>>> getPatientsByStatus(
            @PathVariable PatientStatus status,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<Patient> patients = patientService.getPatientsByStatus(status, pageable);
        return ResponseEntity.ok(ApiResponse.success(patients));
    }

    @GetMapping("/risk-level/{riskLevel}")
    @Operation(summary = "Get patients by risk level")
    public ResponseEntity<ApiResponse<Page<Patient>>> getPatientsByRiskLevel(
            @PathVariable RiskLevel riskLevel,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<Patient> patients = patientService.getPatientsByRiskLevel(riskLevel, pageable);
        return ResponseEntity.ok(ApiResponse.success(patients));
    }

    @GetMapping("/high-risk")
    @Operation(summary = "Get all high risk patients")
    public ResponseEntity<ApiResponse<List<Patient>>> getHighRiskPatients() {
        List<Patient> patients = patientService.getHighRiskPatients();
        return ResponseEntity.ok(ApiResponse.success(patients));
    }

    @GetMapping("/at-risk")
    @Operation(summary = "Get patients at risk (RED and YELLOW)")
    public ResponseEntity<ApiResponse<Page<Patient>>> getAtRiskPatients(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<Patient> patients = patientService.getAtRiskPatients(pageable);
        return ResponseEntity.ok(ApiResponse.success(patients));
    }

    @GetMapping("/search")
    @Operation(summary = "Search patients")
    public ResponseEntity<ApiResponse<Page<Patient>>> searchPatients(
            @RequestParam String query,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<Patient> patients = patientService.searchPatients(query, pageable);
        return ResponseEntity.ok(ApiResponse.success(patients));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update patient details")
    @PreAuthorize("hasAnyRole('ADMIN', 'HELP_DESK')")
    public ResponseEntity<ApiResponse<Patient>> updatePatient(
            @PathVariable Long id,
            @RequestBody PatientDTO updateRequest) {
        Patient patient = patientService.updatePatient(id, updateRequest);
        return ResponseEntity.ok(ApiResponse.success(patient, "Patient updated successfully"));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update patient status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_OFFICER')")
    public ResponseEntity<ApiResponse<Patient>> updatePatientStatus(
            @PathVariable Long id,
            @RequestParam PatientStatus status) {
        Patient patient = patientService.updatePatientStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(patient, "Patient status updated"));
    }

    @GetMapping("/upcoming-edd")
    @Operation(summary = "Get patients with upcoming EDD")
    public ResponseEntity<ApiResponse<List<Patient>>> getPatientsWithUpcomingEDD(
            @RequestParam(defaultValue = "30") int daysAhead) {
        List<Patient> patients = patientService.getPatientsWithUpcomingEDD(daysAhead);
        return ResponseEntity.ok(ApiResponse.success(patients));
    }

    @GetMapping("/overdue-deliveries")
    @Operation(summary = "Get patients with overdue deliveries")
    public ResponseEntity<ApiResponse<List<Patient>>> getOverdueDeliveries() {
        List<Patient> patients = patientService.getOverdueDeliveries();
        return ResponseEntity.ok(ApiResponse.success(patients));
    }

    @GetMapping("/stats/risk-distribution")
    @Operation(summary = "Get risk level distribution")
    public ResponseEntity<ApiResponse<List<Object[]>>> getRiskDistribution() {
        List<Object[]> distribution = patientService.getRiskLevelDistribution();
        return ResponseEntity.ok(ApiResponse.success(distribution));
    }

    @GetMapping("/stats/registrations-today")
    @Operation(summary = "Get count of registrations today")
    public ResponseEntity<ApiResponse<Long>> getRegistrationsToday() {
        long count = patientService.countRegisteredToday();
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a patient")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deletePatient(@PathVariable Long id) {
        patientService.deletePatient(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Patient deleted successfully"));
    }

    @PostMapping(value = "/bulk-upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Bulk upload patients from Excel file")
    @PreAuthorize("hasAnyRole('ADMIN', 'HELP_DESK')")
    public ResponseEntity<ApiResponse<BulkUploadResult>> bulkUploadPatients(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {
        // TODO: Get user ID from security context properly
        Long userId = 1L; // Placeholder
        BulkUploadResult result = patientExcelService.processExcelUpload(file, userId);
        return ResponseEntity.ok(ApiResponse.success(result,
            String.format("Processed %d records: %d successful, %d failed",
                result.getTotalRecords(), result.getSuccessCount(), result.getFailureCount())));
    }

    @GetMapping("/bulk-upload/template")
    @Operation(summary = "Download Excel template for bulk upload")
    public ResponseEntity<byte[]> downloadTemplate() {
        byte[] template = patientExcelService.generateTemplate();
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=patient_registration_template.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(template);
    }

    // Delivery Management Endpoints
    @PostMapping("/{id}/complete-delivery")
    @Operation(summary = "Mark patient delivery as completed")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_OFFICER', 'DOCTOR')")
    public ResponseEntity<ApiResponse<Patient>> completeDelivery(
            @PathVariable Long id,
            @Valid @RequestBody DeliveryCompletionRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        // TODO: Get user ID from security context properly
        Long userId = 1L; // Placeholder
        Patient patient = patientService.completeDelivery(id, request, userId);
        return ResponseEntity.ok(ApiResponse.success(patient, "Delivery completion recorded successfully"));
    }

    @GetMapping("/deliveries/successful")
    @Operation(summary = "Get successful deliveries")
    public ResponseEntity<ApiResponse<Page<Patient>>> getSuccessfulDeliveries(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<Patient> patients = patientService.getSuccessfulDeliveries(pageable);
        return ResponseEntity.ok(ApiResponse.success(patients));
    }

    @GetMapping("/mortality/mother")
    @Operation(summary = "Get mother mortality cases")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_OFFICER', 'MCH_OFFICER')")
    public ResponseEntity<ApiResponse<Page<Patient>>> getMotherMortalityCases(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<Patient> patients = patientService.getMotherMortalityCases(pageable);
        return ResponseEntity.ok(ApiResponse.success(patients));
    }

    @GetMapping("/mortality/baby")
    @Operation(summary = "Get baby mortality cases")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_OFFICER', 'MCH_OFFICER')")
    public ResponseEntity<ApiResponse<Page<Patient>>> getBabyMortalityCases(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<Patient> patients = patientService.getBabyMortalityCases(pageable);
        return ResponseEntity.ok(ApiResponse.success(patients));
    }

    @GetMapping("/deliveries/by-date-range")
    @Operation(summary = "Get deliveries by date range")
    public ResponseEntity<ApiResponse<Page<Patient>>> getDeliveriesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<Patient> patients = patientService.getDeliveriesByDateRange(startDate, endDate, pageable);
        return ResponseEntity.ok(ApiResponse.success(patients));
    }

    @GetMapping("/mortality/by-date-range")
    @Operation(summary = "Get mortality cases by date range")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_OFFICER', 'MCH_OFFICER')")
    public ResponseEntity<ApiResponse<Page<Patient>>> getMortalitiesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<Patient> patients = patientService.getMortalitiesByDateRange(startDate, endDate, pageable);
        return ResponseEntity.ok(ApiResponse.success(patients));
    }

    // Statistics endpoints for deliveries
    @GetMapping("/stats/successful-deliveries")
    @Operation(summary = "Get count of successful deliveries")
    public ResponseEntity<ApiResponse<Long>> getSuccessfulDeliveriesCount() {
        long count = patientService.countSuccessfulDeliveries();
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    @GetMapping("/stats/mother-mortality")
    @Operation(summary = "Get count of mother mortality cases")
    public ResponseEntity<ApiResponse<Long>> getMotherMortalityCount() {
        long count = patientService.countMotherMortality();
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    @GetMapping("/stats/baby-mortality")
    @Operation(summary = "Get count of baby mortality cases")
    public ResponseEntity<ApiResponse<Long>> getBabyMortalityCount() {
        long count = patientService.countBabyMortality();
        return ResponseEntity.ok(ApiResponse.success(count));
    }
}
