package com.ammarakshitha.controller;

import com.ammarakshitha.dto.ApiResponse;
import com.ammarakshitha.dto.FollowUpRequest;
import com.ammarakshitha.dto.FollowUpUpdateRequest;
import com.ammarakshitha.model.FollowUp;
import com.ammarakshitha.service.FollowUpService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/v1/follow-ups")
@RequiredArgsConstructor
@Tag(name = "Follow Up", description = "APIs for follow-up management")
public class FollowUpController {

    private final FollowUpService followUpService;

    @PostMapping
    @Operation(summary = "Create a new follow-up")
    @PreAuthorize("hasAnyRole('ADMIN', 'HELP_DESK', 'DOCTOR')")
    public ResponseEntity<ApiResponse<FollowUp>> createFollowUp(
            @Valid @RequestBody FollowUpRequest request) {
        FollowUp followUp = followUpService.createFollowUp(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(followUp, "Follow-up scheduled successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get follow-up by ID")
    public ResponseEntity<ApiResponse<FollowUp>> getFollowUpById(@PathVariable Long id) {
        FollowUp followUp = followUpService.getFollowUpById(id);
        return ResponseEntity.ok(ApiResponse.success(followUp));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update follow-up after call")
    @PreAuthorize("hasAnyRole('ADMIN', 'HELP_DESK')")
    public ResponseEntity<ApiResponse<FollowUp>> updateFollowUp(
            @PathVariable Long id,
            @Valid @RequestBody FollowUpUpdateRequest request) {
        FollowUp followUp = followUpService.updateFollowUp(id, request);
        return ResponseEntity.ok(ApiResponse.success(followUp, "Follow-up updated successfully"));
    }

    @PatchMapping("/{id}/reschedule")
    @Operation(summary = "Reschedule a follow-up")
    @PreAuthorize("hasAnyRole('ADMIN', 'HELP_DESK')")
    public ResponseEntity<ApiResponse<FollowUp>> rescheduleFollowUp(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate newDate) {
        FollowUp followUp = followUpService.rescheduleFollowUp(id, newDate);
        return ResponseEntity.ok(ApiResponse.success(followUp, "Follow-up rescheduled"));
    }

    @PatchMapping("/{id}/reassign")
    @Operation(summary = "Reassign a follow-up to another user")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_OFFICER')")
    public ResponseEntity<ApiResponse<FollowUp>> reassignFollowUp(
            @PathVariable Long id,
            @RequestParam Long newAssigneeId) {
        FollowUp followUp = followUpService.reassignFollowUp(id, newAssigneeId);
        return ResponseEntity.ok(ApiResponse.success(followUp, "Follow-up reassigned"));
    }

    @GetMapping("/patient/{patientId}")
    @Operation(summary = "Get follow-ups for a patient")
    public ResponseEntity<ApiResponse<List<FollowUp>>> getFollowUpsByPatient(@PathVariable Long patientId) {
        List<FollowUp> followUps = followUpService.getFollowUpsByPatientId(patientId);
        return ResponseEntity.ok(ApiResponse.success(followUps));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get follow-ups assigned to a user")
    public ResponseEntity<ApiResponse<Page<FollowUp>>> getFollowUpsByUser(
            @PathVariable Long userId,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<FollowUp> followUps = followUpService.getFollowUpsByAssignedUser(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success(followUps));
    }

    @GetMapping("/user/{userId}/today")
    @Operation(summary = "Get today's pending follow-ups for a user")
    public ResponseEntity<ApiResponse<List<FollowUp>>> getTodaysPendingForUser(@PathVariable Long userId) {
        List<FollowUp> followUps = followUpService.getTodaysPendingFollowUps(userId);
        return ResponseEntity.ok(ApiResponse.success(followUps));
    }

    @GetMapping("/today")
    @Operation(summary = "Get all today's follow-ups")
    public ResponseEntity<ApiResponse<List<FollowUp>>> getTodaysFollowUps() {
        List<FollowUp> followUps = followUpService.getTodaysFollowUps();
        return ResponseEntity.ok(ApiResponse.success(followUps));
    }

    @GetMapping("/overdue")
    @Operation(summary = "Get all overdue follow-ups")
    public ResponseEntity<ApiResponse<List<FollowUp>>> getOverdueFollowUps() {
        List<FollowUp> followUps = followUpService.getOverdueFollowUps();
        return ResponseEntity.ok(ApiResponse.success(followUps));
    }

    @GetMapping("/upcoming")
    @Operation(summary = "Get all upcoming follow-ups (scheduled for future dates)")
    public ResponseEntity<ApiResponse<List<FollowUp>>> getUpcomingFollowUps() {
        List<FollowUp> followUps = followUpService.getUpcomingFollowUps();
        return ResponseEntity.ok(ApiResponse.success(followUps));
    }

    @GetMapping("/user/{userId}/overdue")
    @Operation(summary = "Get overdue follow-ups for a user")
    public ResponseEntity<ApiResponse<List<FollowUp>>> getOverdueFollowUpsForUser(@PathVariable Long userId) {
        List<FollowUp> followUps = followUpService.getOverdueFollowUpsForUser(userId);
        return ResponseEntity.ok(ApiResponse.success(followUps));
    }

    @GetMapping("/requiring-doctor")
    @Operation(summary = "Get follow-ups requiring doctor consultation")
    public ResponseEntity<ApiResponse<List<FollowUp>>> getFollowUpsRequiringDoctor() {
        List<FollowUp> followUps = followUpService.getFollowUpsRequiringDoctorConsultation();
        return ResponseEntity.ok(ApiResponse.success(followUps));
    }

    @GetMapping("/stats/today")
    @Operation(summary = "Get today's follow-up statistics")
    public ResponseEntity<ApiResponse<Long>> countTodaysFollowUps() {
        long count = followUpService.countForToday();
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    @GetMapping("/stats/completed-today")
    @Operation(summary = "Get completed follow-ups count for today")
    public ResponseEntity<ApiResponse<Long>> countCompletedToday() {
        long count = followUpService.countCompletedToday();
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    @GetMapping("/range")
    @Operation(summary = "Get follow-ups by date range for calendar view")
    public ResponseEntity<ApiResponse<List<FollowUp>>> getFollowUpsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<FollowUp> followUps = followUpService.getFollowUpsByDateRange(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(followUps));
    }

    @GetMapping("/all")
    @Operation(summary = "Get all follow-ups")
    public ResponseEntity<ApiResponse<List<FollowUp>>> getAllFollowUps() {
        List<FollowUp> followUps = followUpService.getAllFollowUps();
        return ResponseEntity.ok(ApiResponse.success(followUps));
    }
}
