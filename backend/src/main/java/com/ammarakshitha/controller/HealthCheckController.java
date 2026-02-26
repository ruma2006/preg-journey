package com.ammarakshitha.controller;

import com.ammarakshitha.dto.ApiResponse;
import com.ammarakshitha.dto.HealthCheckRequest;
import com.ammarakshitha.model.HealthCheck;
import com.ammarakshitha.service.HealthCheckService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/v1/health-checks")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Health Check", description = "APIs for health check management")
public class HealthCheckController {

	private final HealthCheckService healthCheckService;

	@PostMapping
	@Operation(summary = "Perform a new health check")
	@PreAuthorize("hasAnyRole('ADMIN', 'HELP_DESK', 'DOCTOR')")
	public ResponseEntity<ApiResponse<HealthCheck>> performHealthCheck(@Valid @RequestBody HealthCheckRequest request) {
		log.info("Received health check request for patient ID: {}", request.getPatientId());
		// TODO: Get user ID from security context
		Long userId = 1L; // Placeholder
		HealthCheck healthCheck = healthCheckService.performHealthCheck(request, userId);
		return ResponseEntity.status(HttpStatus.CREATED).body(
				ApiResponse.success(healthCheck, "Health check completed. Risk Level: " + healthCheck.getRiskLevel()));
	}

	@GetMapping("/{id}")
	@Operation(summary = "Get health check by ID")
	public ResponseEntity<ApiResponse<HealthCheck>> getHealthCheckById(@PathVariable Long id) {
		HealthCheck healthCheck = healthCheckService.getHealthCheckById(id);
		return ResponseEntity.ok(ApiResponse.success(healthCheck));
	}

	@GetMapping("/patient/{patientId}")
	@Operation(summary = "Get all health checks for a patient")
	public ResponseEntity<ApiResponse<List<HealthCheck>>> getHealthChecksByPatient(@PathVariable Long patientId) {
		List<HealthCheck> healthChecks = healthCheckService.getHealthChecksByPatientId(patientId);
		return ResponseEntity.ok(ApiResponse.success(healthChecks));
	}

	@GetMapping("/patient/{patientId}/paginated")
	@Operation(summary = "Get paginated health checks for a patient")
	public ResponseEntity<ApiResponse<Page<HealthCheck>>> getHealthChecksByPatientPaginated(
			@PathVariable Long patientId, @PageableDefault(size = 10) Pageable pageable) {
		Page<HealthCheck> healthChecks = healthCheckService.getHealthChecksByPatientId(patientId, pageable);
		return ResponseEntity.ok(ApiResponse.success(healthChecks));
	}

	@GetMapping("/patient/{patientId}/latest")
	@Operation(summary = "Get latest health check for a patient")
	public ResponseEntity<ApiResponse<HealthCheck>> getLatestHealthCheck(@PathVariable Long patientId) {
		Optional<HealthCheck> healthCheck = healthCheckService.getLatestHealthCheck(patientId);
		return healthCheck.map(hc -> ResponseEntity.ok(ApiResponse.success(hc)))
				.orElse(ResponseEntity.ok(ApiResponse.success(null, "No health checks found")));
	}

	@GetMapping("/high-risk")
	@Operation(summary = "Get high risk health checks")
	public ResponseEntity<ApiResponse<Page<HealthCheck>>> getHighRiskHealthChecks(
			@PageableDefault(size = 20) Pageable pageable) {
		Page<HealthCheck> healthChecks = healthCheckService.getHighRiskHealthChecks(pageable);
		return ResponseEntity.ok(ApiResponse.success(healthChecks));
	}

	@GetMapping("/overdue")
	@Operation(summary = "Get overdue health checks")
	public ResponseEntity<ApiResponse<List<HealthCheck>>> getOverdueHealthChecks() {
		List<HealthCheck> healthChecks = healthCheckService.getOverdueHealthChecks();
		return ResponseEntity.ok(ApiResponse.success(healthChecks));
	}

	@GetMapping("/due-today")
	@Operation(summary = "Get health checks due today")
	public ResponseEntity<ApiResponse<List<HealthCheck>>> getHealthChecksDueToday() {
		List<HealthCheck> healthChecks = healthCheckService.getHealthChecksDueToday();
		return ResponseEntity.ok(ApiResponse.success(healthChecks));
	}

	@GetMapping("/stats/today")
	@Operation(summary = "Get count of health checks today")
	public ResponseEntity<ApiResponse<Long>> countHealthChecksToday() {
		long count = healthCheckService.countHealthChecksToday();
		return ResponseEntity.ok(ApiResponse.success(count));
	}

	@GetMapping("/stats/this-month")
	@Operation(summary = "Get count of health checks this month")
	public ResponseEntity<ApiResponse<Long>> countHealthChecksThisMonth() {
		long count = healthCheckService.countHealthChecksThisMonth();
		return ResponseEntity.ok(ApiResponse.success(count));
	}
}
