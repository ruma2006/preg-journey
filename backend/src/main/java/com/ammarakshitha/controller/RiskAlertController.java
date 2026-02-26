package com.ammarakshitha.controller;

import com.ammarakshitha.dto.AlertAcknowledgeRequest;
import com.ammarakshitha.dto.ApiResponse;
import com.ammarakshitha.model.RiskAlert;
import com.ammarakshitha.model.enums.AlertType;
import com.ammarakshitha.model.enums.RiskLevel;
import com.ammarakshitha.service.RiskAlertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/alerts")
@RequiredArgsConstructor
@Tag(name = "Risk Alerts", description = "APIs for risk alert management")
public class RiskAlertController {

    private final RiskAlertService riskAlertService;

    @GetMapping("/{id}")
    @Operation(summary = "Get alert by ID")
    public ResponseEntity<ApiResponse<RiskAlert>> getAlertById(@PathVariable Long id) {
        RiskAlert alert = riskAlertService.getAlertById(id);
        return ResponseEntity.ok(ApiResponse.success(alert));
    }

    @GetMapping("/patient/{patientId}")
    @Operation(summary = "Get alerts for a patient")
    public ResponseEntity<ApiResponse<List<RiskAlert>>> getAlertsByPatient(@PathVariable Long patientId) {
        List<RiskAlert> alerts = riskAlertService.getAlertsByPatientId(patientId);
        return ResponseEntity.ok(ApiResponse.success(alerts));
    }

    @GetMapping("/unacknowledged")
    @Operation(summary = "Get all unacknowledged alerts")
    public ResponseEntity<ApiResponse<Page<RiskAlert>>> getUnacknowledgedAlerts(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<RiskAlert> alerts = riskAlertService.getUnacknowledgedAlerts(pageable);
        return ResponseEntity.ok(ApiResponse.success(alerts));
    }

    @GetMapping("/unacknowledged/ordered")
    @Operation(summary = "Get unacknowledged alerts ordered by severity")
    public ResponseEntity<ApiResponse<List<RiskAlert>>> getUnacknowledgedAlertsBySeverity() {
        List<RiskAlert> alerts = riskAlertService.getUnacknowledgedAlertsBySeverity();
        return ResponseEntity.ok(ApiResponse.success(alerts));
    }

    @GetMapping("/critical")
    @Operation(summary = "Get critical unacknowledged alerts")
    public ResponseEntity<ApiResponse<List<RiskAlert>>> getCriticalAlerts() {
        List<RiskAlert> alerts = riskAlertService.getCriticalUnacknowledgedAlerts();
        return ResponseEntity.ok(ApiResponse.success(alerts));
    }

    @GetMapping("/high-priority")
    @Operation(summary = "Get high priority (RED and YELLOW) unacknowledged alerts")
    public ResponseEntity<ApiResponse<Page<RiskAlert>>> getHighPriorityAlerts(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<RiskAlert> alerts = riskAlertService.getHighPriorityUnacknowledgedAlerts(pageable);
        return ResponseEntity.ok(ApiResponse.success(alerts));
    }

    @GetMapping("/unresolved")
    @Operation(summary = "Get all unresolved alerts")
    public ResponseEntity<ApiResponse<List<RiskAlert>>> getUnresolvedAlerts() {
        List<RiskAlert> alerts = riskAlertService.getUnresolvedAlerts();
        return ResponseEntity.ok(ApiResponse.success(alerts));
    }

    @GetMapping("/patient/{patientId}/unresolved")
    @Operation(summary = "Get unresolved alerts for a patient")
    public ResponseEntity<ApiResponse<List<RiskAlert>>> getUnresolvedAlertsForPatient(
            @PathVariable Long patientId) {
        List<RiskAlert> alerts = riskAlertService.getUnresolvedAlertsForPatient(patientId);
        return ResponseEntity.ok(ApiResponse.success(alerts));
    }

    @GetMapping("/severity/{severity}")
    @Operation(summary = "Get alerts by severity")
    public ResponseEntity<ApiResponse<Page<RiskAlert>>> getAlertsBySeverity(
            @PathVariable RiskLevel severity,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<RiskAlert> alerts = riskAlertService.getAlertsBySeverity(severity, pageable);
        return ResponseEntity.ok(ApiResponse.success(alerts));
    }

    @GetMapping("/type/{alertType}")
    @Operation(summary = "Get alerts by type")
    public ResponseEntity<ApiResponse<List<RiskAlert>>> getAlertsByType(@PathVariable AlertType alertType) {
        List<RiskAlert> alerts = riskAlertService.getAlertsByType(alertType);
        return ResponseEntity.ok(ApiResponse.success(alerts));
    }

    @PostMapping("/{id}/acknowledge")
    @Operation(summary = "Acknowledge an alert")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_OFFICER', 'DOCTOR', 'HELP_DESK')")
    public ResponseEntity<ApiResponse<RiskAlert>> acknowledgeAlert(
            @PathVariable Long id,
            @RequestBody AlertAcknowledgeRequest request) {
        // TODO: Get user ID from security context
        Long userId = 1L; // Placeholder
        RiskAlert alert = riskAlertService.acknowledgeAlert(id, request, userId);
        return ResponseEntity.ok(ApiResponse.success(alert, "Alert acknowledged"));
    }

    @PutMapping("/{id}/acknowledgement")
    @Operation(summary = "Update acknowledgement details of an alert")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_OFFICER', 'DOCTOR')")
    public ResponseEntity<ApiResponse<RiskAlert>> updateAcknowledgement(
            @PathVariable Long id,
            @RequestBody AlertAcknowledgeRequest request) {
        RiskAlert alert = riskAlertService.updateAcknowledgement(id, request);
        return ResponseEntity.ok(ApiResponse.success(alert, "Acknowledgement updated"));
    }

    @PostMapping("/{id}/resolve")
    @Operation(summary = "Resolve an alert")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_OFFICER', 'DOCTOR')")
    public ResponseEntity<ApiResponse<RiskAlert>> resolveAlert(
            @PathVariable Long id,
            @RequestParam String resolutionNotes) {
        RiskAlert alert = riskAlertService.resolveAlert(id, resolutionNotes);
        return ResponseEntity.ok(ApiResponse.success(alert, "Alert resolved"));
    }

    @PostMapping("/bulk-acknowledge")
    @Operation(summary = "Bulk acknowledge alerts")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_OFFICER')")
    public ResponseEntity<ApiResponse<Void>> bulkAcknowledge(@RequestBody List<Long> alertIds) {
        // TODO: Get user ID from security context
        Long userId = 1L; // Placeholder
        riskAlertService.bulkAcknowledge(alertIds, userId);
        return ResponseEntity.ok(ApiResponse.success(null, "Alerts acknowledged"));
    }

    @GetMapping("/stats/unacknowledged")
    @Operation(summary = "Get count of unacknowledged alerts")
    public ResponseEntity<ApiResponse<Long>> countUnacknowledged() {
        long count = riskAlertService.countUnacknowledged();
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    @GetMapping("/stats/critical")
    @Operation(summary = "Get count of critical unacknowledged alerts")
    public ResponseEntity<ApiResponse<Long>> countCriticalUnacknowledged() {
        long count = riskAlertService.countCriticalUnacknowledged();
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    @GetMapping("/stats/today")
    @Operation(summary = "Get count of today's alerts")
    public ResponseEntity<ApiResponse<Long>> countTodaysAlerts() {
        long count = riskAlertService.countTodaysAlerts();
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    @GetMapping
    @Operation(summary = "Get all alerts with pagination")
    public ResponseEntity<ApiResponse<Page<RiskAlert>>> getAllAlerts(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<RiskAlert> alerts = riskAlertService.getAllAlerts(pageable);
        return ResponseEntity.ok(ApiResponse.success(alerts));
    }

    @GetMapping("/acknowledged")
    @Operation(summary = "Get all acknowledged alerts")
    public ResponseEntity<ApiResponse<Page<RiskAlert>>> getAcknowledgedAlerts(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<RiskAlert> alerts = riskAlertService.getAcknowledgedAlerts(pageable);
        return ResponseEntity.ok(ApiResponse.success(alerts));
    }

    @GetMapping("/patient/{patientId}/all")
    @Operation(summary = "Get all alerts for a patient including acknowledgement details")
    public ResponseEntity<ApiResponse<Page<RiskAlert>>> getAllAlertsForPatient(
            @PathVariable Long patientId,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<RiskAlert> alerts = riskAlertService.getAllAlertsForPatient(patientId, pageable);
        return ResponseEntity.ok(ApiResponse.success(alerts));
    }
}
