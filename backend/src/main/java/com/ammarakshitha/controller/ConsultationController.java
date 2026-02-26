package com.ammarakshitha.controller;

import com.ammarakshitha.dto.ApiResponse;
import com.ammarakshitha.dto.ConsultationRequest;
import com.ammarakshitha.model.Consultation;
import com.ammarakshitha.service.ConsultationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/consultations")
@RequiredArgsConstructor
@Tag(name = "Consultation", description = "APIs for consultation management")
public class ConsultationController {

    private final ConsultationService consultationService;

    @PostMapping
    @Operation(summary = "Schedule a new consultation")
    @PreAuthorize("hasAnyRole('ADMIN', 'HELP_DESK', 'MEDICAL_OFFICER', 'MCH_OFFICER', 'DOCTOR')")
    public ResponseEntity<ApiResponse<Consultation>> scheduleConsultation(
            @Valid @RequestBody ConsultationRequest request) {
        Consultation consultation = consultationService.scheduleConsultation(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(consultation, "Consultation scheduled successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get consultation by ID")
    public ResponseEntity<ApiResponse<Consultation>> getConsultationById(@PathVariable Long id) {
        Consultation consultation = consultationService.getConsultationById(id);
        return ResponseEntity.ok(ApiResponse.success(consultation));
    }

    @PostMapping("/{id}/start")
    @Operation(summary = "Start a consultation")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<Consultation>> startConsultation(@PathVariable Long id) {
        Consultation consultation = consultationService.startConsultation(id);
        return ResponseEntity.ok(ApiResponse.success(consultation, "Consultation started"));
    }

    @PostMapping("/{id}/complete")
    @Operation(summary = "Complete a consultation")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<Consultation>> completeConsultation(
            @PathVariable Long id,
            @RequestBody ConsultationRequest request) {
        Consultation consultation = consultationService.completeConsultation(id, request);
        return ResponseEntity.ok(ApiResponse.success(consultation, "Consultation completed"));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel a consultation")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'HELP_DESK')")
    public ResponseEntity<ApiResponse<Consultation>> cancelConsultation(
            @PathVariable Long id,
            @RequestParam String reason,
            @RequestParam String cancelledBy) {
        Consultation consultation = consultationService.cancelConsultation(id, reason, cancelledBy);
        return ResponseEntity.ok(ApiResponse.success(consultation, "Consultation cancelled"));
    }

    @GetMapping("/patient/{patientId}")
    @Operation(summary = "Get consultations for a patient")
    public ResponseEntity<ApiResponse<List<Consultation>>> getConsultationsByPatient(
            @PathVariable Long patientId) {
        List<Consultation> consultations = consultationService.getConsultationsByPatientId(patientId);
        return ResponseEntity.ok(ApiResponse.success(consultations));
    }

    @GetMapping("/doctor/{doctorId}")
    @Operation(summary = "Get consultations for a doctor")
    public ResponseEntity<ApiResponse<Page<Consultation>>> getConsultationsByDoctor(
            @PathVariable Long doctorId,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<Consultation> consultations = consultationService.getConsultationsByDoctorId(doctorId, pageable);
        return ResponseEntity.ok(ApiResponse.success(consultations));
    }

    @GetMapping("/doctor/{doctorId}/today")
    @Operation(summary = "Get today's consultations for a doctor")
    public ResponseEntity<ApiResponse<List<Consultation>>> getTodaysConsultationsForDoctor(
            @PathVariable Long doctorId) {
        List<Consultation> consultations = consultationService.getTodaysConsultationsForDoctor(doctorId);
        return ResponseEntity.ok(ApiResponse.success(consultations));
    }

    @GetMapping("/doctor/{doctorId}/upcoming")
    @Operation(summary = "Get upcoming consultations for a doctor")
    public ResponseEntity<ApiResponse<List<Consultation>>> getUpcomingConsultationsForDoctor(
            @PathVariable Long doctorId) {
        List<Consultation> consultations = consultationService.getUpcomingConsultationsForDoctor(doctorId);
        return ResponseEntity.ok(ApiResponse.success(consultations));
    }

    @GetMapping("/patient/{patientId}/upcoming")
    @Operation(summary = "Get upcoming consultations for a patient")
    public ResponseEntity<ApiResponse<List<Consultation>>> getUpcomingConsultationsForPatient(
            @PathVariable Long patientId) {
        List<Consultation> consultations = consultationService.getUpcomingConsultationsForPatient(patientId);
        return ResponseEntity.ok(ApiResponse.success(consultations));
    }

    @GetMapping("/upcoming")
    @Operation(summary = "Get all upcoming consultations")
    public ResponseEntity<ApiResponse<Page<Consultation>>> getUpcomingConsultations(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<Consultation> consultations = consultationService.getUpcomingConsultations(pageable);
        return ResponseEntity.ok(ApiResponse.success(consultations));
    }

    @GetMapping("/stats/today")
    @Operation(summary = "Get count of today's consultations")
    public ResponseEntity<ApiResponse<Long>> countTodaysConsultations() {
        long count = consultationService.countTodaysConsultations();
        return ResponseEntity.ok(ApiResponse.success(count));
    }
}
