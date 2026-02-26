package com.ammarakshitha.controller;

import com.ammarakshitha.dto.ApiResponse;
import com.ammarakshitha.dto.DashboardStats;
import com.ammarakshitha.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/v1/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "APIs for dashboard statistics")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/overview")
    @Operation(summary = "Get overview statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_OFFICER', 'MCH_OFFICER','DOCTOR')")
    public ResponseEntity<ApiResponse<DashboardStats>> getOverviewStats() {
        DashboardStats stats = dashboardService.getOverviewStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/risk-distribution")
    @Operation(summary = "Get patient risk distribution")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRiskDistribution() {
        Map<String, Object> distribution = dashboardService.getRiskDistribution();
        return ResponseEntity.ok(ApiResponse.success(distribution));
    }

    @GetMapping("/district-stats")
    @Operation(summary = "Get district-wise statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_OFFICER', 'MCH_OFFICER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDistrictWiseStats() {
        Map<String, Object> stats = dashboardService.getDistrictWiseStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/alerts-summary")
    @Operation(summary = "Get alerts summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAlertsSummary() {
        Map<String, Object> summary = dashboardService.getAlertsSummary();
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/consultations-summary")
    @Operation(summary = "Get consultations summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getConsultationsSummary() {
        Map<String, Object> summary = dashboardService.getConsultationsSummary();
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/follow-ups-summary")
    @Operation(summary = "Get follow-ups summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFollowUpsSummary() {
        Map<String, Object> summary = dashboardService.getFollowUpsSummary();
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/doctor/{doctorId}")
    @Operation(summary = "Get doctor dashboard statistics")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DashboardStats>> getDoctorDashboard(@PathVariable Long doctorId) {
        DashboardStats stats = dashboardService.getDoctorDashboardStats(doctorId);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/help-desk/{userId}")
    @Operation(summary = "Get help desk dashboard statistics")
    @PreAuthorize("hasRole('HELP_DESK') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DashboardStats>> getHelpDeskDashboard(@PathVariable Long userId) {
        DashboardStats stats = dashboardService.getHelpDeskDashboardStats(userId);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
