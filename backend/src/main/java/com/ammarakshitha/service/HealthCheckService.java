package com.ammarakshitha.service;

import com.ammarakshitha.dto.HealthCheckRequest;
import com.ammarakshitha.exception.ResourceNotFoundException;
import com.ammarakshitha.model.FollowUp;
import com.ammarakshitha.model.HealthCheck;
import com.ammarakshitha.model.Patient;
import com.ammarakshitha.model.RiskAlert;
import com.ammarakshitha.model.User;
import com.ammarakshitha.model.enums.AlertType;
import com.ammarakshitha.model.enums.FollowUpStatus;
import com.ammarakshitha.model.enums.RiskLevel;
import com.ammarakshitha.repository.FollowUpRepository;
import com.ammarakshitha.repository.HealthCheckRepository;
import com.ammarakshitha.repository.PatientRepository;
import com.ammarakshitha.repository.RiskAlertRepository;
import com.ammarakshitha.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class HealthCheckService {

    private final HealthCheckRepository healthCheckRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final RiskAlertRepository riskAlertRepository;
    private final FollowUpRepository followUpRepository;
    private final RiskAssessmentService riskAssessmentService;
    private final PatientService patientService;

    @Transactional
    public HealthCheck performHealthCheck(HealthCheckRequest request, Long performedByUserId) {
        log.info("Performing health check for patient: {}", request.getPatientId());

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
        
        User performedBy = userRepository.findById(performedByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        HealthCheck healthCheck = null;
        Optional<HealthCheck> existingHealthCheckOpt =  Optional.empty();
        // If there is an existing health check ID provided, we check if it exists and belongs to the same patient. If it does, we update that record instead of creating a new one.
        if(request.getId() != null) {
			log.info("Health check ID provided in request: {}. Checking if it exists for patient: {} ", request.getId(), patient.getId());
			existingHealthCheckOpt = healthCheckRepository
					.findById(request.getId());  
        }
		if(existingHealthCheckOpt.isPresent()) {
			log.info("Existing health check found for patient: {} on date: {}. Updating existing record. id {} ", patient.getMotherId(), request.getCheckDate(), existingHealthCheckOpt.get().getId());
			HealthCheck existingHealthCheck = existingHealthCheckOpt.get();
			existingHealthCheck.setPerformedBy(performedBy);
			existingHealthCheck.setId(request.getId());
			existingHealthCheck.setCheckDate(request.getCheckDate() != null ? request.getCheckDate() : LocalDate.now());
			existingHealthCheck.setBpSystolic(request.getBpSystolic());
			existingHealthCheck.setBpDiastolic(request.getBpDiastolic());
			existingHealthCheck.setPulseRate(request.getPulseRate());
			existingHealthCheck.setTemperature(request.getTemperature());
			existingHealthCheck.setRespiratoryRate(request.getRespiratoryRate());
			existingHealthCheck.setSpo2(request.getSpo2());
			existingHealthCheck.setHemoglobin(request.getHemoglobin());
			existingHealthCheck.setBloodSugarFasting(request.getBloodSugarFasting());
			existingHealthCheck.setBloodSugarPP(request.getBloodSugarPP());
			existingHealthCheck.setBloodSugarRandom(request.getBloodSugarRandom());
			existingHealthCheck.setWeight(request.getWeight());
			existingHealthCheck.setHeight(request.getHeight());
			existingHealthCheck.setFundalHeight(request.getFundalHeight());
			existingHealthCheck.setFetalHeartRate(request.getFetalHeartRate());
			existingHealthCheck.setFetalMovement(request.getFetalMovement());
			existingHealthCheck.setUrineAlbumin(request.getUrineAlbumin());
			existingHealthCheck.setUrineSugar(request.getUrineSugar());
			existingHealthCheck.setSymptoms(request.getSymptoms());
			existingHealthCheck.setSwellingObserved(request.getSwellingObserved());
			existingHealthCheck.setBleedingReported(request.getBleedingReported());
			existingHealthCheck.setHeadacheReported(request.getHeadacheReported());
			existingHealthCheck.setBlurredVisionReported(request.getBlurredVisionReported());
			existingHealthCheck.setAbdominalPainReported(request.getAbdominalPainReported());
			existingHealthCheck.setNotes(request.getNotes());
			existingHealthCheck.setRecommendations(request.getRecommendations());
			existingHealthCheck.setNextCheckDate(request.getNextCheckDate());
			
			healthCheck = healthCheckRepository.save(existingHealthCheck);
	
        }
        else {
        	healthCheck = HealthCheck.builder()
                    .patient(patient)
                    .checkDate(request.getCheckDate() != null ? request.getCheckDate() : LocalDate.now())
                    .bpSystolic(request.getBpSystolic())
                    .bpDiastolic(request.getBpDiastolic())
                    .pulseRate(request.getPulseRate())
                    .temperature(request.getTemperature())
                    .respiratoryRate(request.getRespiratoryRate())
                    .spo2(request.getSpo2())
                    .hemoglobin(request.getHemoglobin())
                    .bloodSugarFasting(request.getBloodSugarFasting())
                    .bloodSugarPP(request.getBloodSugarPP())
                    .bloodSugarRandom(request.getBloodSugarRandom())
                    .weight(request.getWeight())
                    .height(request.getHeight())
                    .fundalHeight(request.getFundalHeight())
                    .fetalHeartRate(request.getFetalHeartRate())
                    .fetalMovement(request.getFetalMovement())
                    .urineAlbumin(request.getUrineAlbumin())
                    .urineSugar(request.getUrineSugar())
                    .symptoms(request.getSymptoms())
                    .swellingObserved(request.getSwellingObserved())
                    .bleedingReported(request.getBleedingReported())
                    .headacheReported(request.getHeadacheReported())
                    .blurredVisionReported(request.getBlurredVisionReported())
                    .abdominalPainReported(request.getAbdominalPainReported())
                    .notes(request.getNotes())
                    .recommendations(request.getRecommendations())
                    .nextCheckDate(request.getNextCheckDate())
                    .performedBy(performedBy)
                    .build();
        }
        
        // Perform risk assessment
        RiskAssessmentService.RiskAssessmentResult riskResult =
                riskAssessmentService.assessRisk(healthCheck, patient);

        healthCheck.setRiskScore(riskResult.score());
        healthCheck.setRiskLevel(riskResult.riskLevel());
        healthCheck.setRiskFactors(String.join("; ", riskResult.riskFactors()));

        HealthCheck savedHealthCheck = healthCheckRepository.save(healthCheck);

        // Update patient's current risk level
        patientService.updatePatientRisk(patient.getId(), riskResult.score(), riskResult.riskLevel());

        // Generate alert if high risk
        if (riskResult.riskLevel() == RiskLevel.RED || riskResult.riskLevel() == RiskLevel.YELLOW) {
            createRiskAlert(savedHealthCheck, patient, riskResult);
        }

        // Handle follow-up scheduling
        boolean manualFollowUpScheduled = false;

        // Manual follow-up: If explicitly requested
        if (Boolean.TRUE.equals(request.getScheduleFollowUp()) && request.getFollowUpDate() != null) {
            User assignee = null;
            if (request.getFollowUpAssigneeId() != null) {
                assignee = userRepository.findById(request.getFollowUpAssigneeId())
                        .orElse(performedBy);
            } else {
                assignee = performedBy;
            }
            createFollowUp(savedHealthCheck, patient, assignee, request.getFollowUpDate(), request.getFollowUpNotes());
            manualFollowUpScheduled = true;
            log.info("Manual follow-up scheduled for patient: {} on {}", patient.getMotherId(), request.getFollowUpDate());
        }

        // Auto follow-up: Based on risk level (if not manually scheduled and auto-enabled)
        if (!manualFollowUpScheduled && !Boolean.FALSE.equals(request.getAutoFollowUpEnabled())) {
            if (riskResult.riskLevel() == RiskLevel.RED) {
                // RED risk: Follow-up in 2 days
                LocalDate followUpDate = LocalDate.now().plusDays(2);
                createFollowUp(savedHealthCheck, patient, performedBy, followUpDate,
                        "Auto-scheduled follow-up for HIGH RISK patient. Risk factors: " + String.join(", ", riskResult.riskFactors()));
                log.info("Auto follow-up scheduled for RED risk patient: {} on {}", patient.getMotherId(), followUpDate);
            } else if (riskResult.riskLevel() == RiskLevel.YELLOW) {
                // YELLOW risk: Follow-up in 5 days
                LocalDate followUpDate = LocalDate.now().plusDays(5);
                createFollowUp(savedHealthCheck, patient, performedBy, followUpDate,
                        "Auto-scheduled follow-up for MODERATE RISK patient. Risk factors: " + String.join(", ", riskResult.riskFactors()));
                log.info("Auto follow-up scheduled for YELLOW risk patient: {} on {}", patient.getMotherId(), followUpDate);
            }
        }

        log.info("Health check completed. Risk Level: {}, Score: {}",
                riskResult.riskLevel(), riskResult.score());

        return savedHealthCheck;
    }

    private void createFollowUp(HealthCheck healthCheck, Patient patient, User assignedTo,
                                 LocalDate scheduledDate, String notes) {
        FollowUp followUp = FollowUp.builder()
                .patient(patient)
                .assignedTo(assignedTo)
                .scheduledDate(scheduledDate)
                .status(FollowUpStatus.PENDING)
                .triggeredByHealthCheck(healthCheck)
                .notes(notes)
                .build();

        followUpRepository.save(followUp);
    }

    private void createRiskAlert(HealthCheck healthCheck, Patient patient,
                                 RiskAssessmentService.RiskAssessmentResult riskResult) {
        String title = riskResult.riskLevel() == RiskLevel.RED
                ? "CRITICAL: High Risk Patient Detected"
                : "ATTENTION: Moderate Risk Patient Detected";

        String description = String.format(
                "Patient %s (Mother ID: %s) has been assessed as %s risk during health check. " +
                "Risk Score: %d. Immediate attention may be required.",
                patient.getName(), patient.getMotherId(), riskResult.riskLevel(), riskResult.score());

        String recommendedAction = riskResult.riskLevel() == RiskLevel.RED
                ? "Schedule immediate doctor consultation. Notify medical officer."
                : "Schedule follow-up call. Monitor patient closely.";

        RiskAlert alert = RiskAlert.builder()
                .patient(patient)
                .healthCheck(healthCheck)
                .alertType(AlertType.HIGH_RISK_DETECTED)
                .severity(riskResult.riskLevel())
                .title(title)
                .description(description)
                .riskFactors(String.join("; ", riskResult.riskFactors()))
                .recommendedAction(recommendedAction)
                .build();

        riskAlertRepository.save(alert);
        log.info("Risk alert created for patient: {}", patient.getMotherId());
    }

    @Transactional(readOnly = true)
    public HealthCheck getHealthCheckById(Long id) {
        return healthCheckRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Health check not found"));
    }

    @Transactional(readOnly = true)
    public List<HealthCheck> getHealthChecksByPatientId(Long patientId) {
        return healthCheckRepository.findByPatientIdOrderByCheckDateDesc(patientId);
    }

    @Transactional(readOnly = true)
    public Page<HealthCheck> getHealthChecksByPatientId(Long patientId, Pageable pageable) {
        return healthCheckRepository.findByPatientId(patientId, pageable);
    }

    @Transactional(readOnly = true)
    public Optional<HealthCheck> getLatestHealthCheck(Long patientId) {
        return healthCheckRepository.findTopByPatientIdOrderByCheckDateDesc(patientId);
    }

    @Transactional(readOnly = true)
    public Page<HealthCheck> getHighRiskHealthChecks(Pageable pageable) {
        return healthCheckRepository.findHighRiskHealthChecks(pageable);
    }

    @Transactional(readOnly = true)
    public List<HealthCheck> getOverdueHealthChecks() {
        return healthCheckRepository.findOverdueHealthChecks(LocalDate.now());
    }

    @Transactional(readOnly = true)
    public List<HealthCheck> getHealthChecksDueToday() {
        return healthCheckRepository.findByNextCheckDate(LocalDate.now());
    }

    @Transactional(readOnly = true)
    public long countHealthChecksToday() {
        return healthCheckRepository.countOnDate(LocalDate.now());
    }

    @Transactional(readOnly = true)
    public long countHealthChecksThisMonth() {
        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        return healthCheckRepository.countBetweenDates(startOfMonth, LocalDate.now());
    }
}
