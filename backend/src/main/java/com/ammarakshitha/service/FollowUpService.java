package com.ammarakshitha.service;

import com.ammarakshitha.dto.FollowUpRequest;
import com.ammarakshitha.dto.FollowUpUpdateRequest;
import com.ammarakshitha.exception.BusinessException;
import com.ammarakshitha.exception.ResourceNotFoundException;
import com.ammarakshitha.model.FollowUp;
import com.ammarakshitha.model.Patient;
import com.ammarakshitha.model.RiskAlert;
import com.ammarakshitha.model.User;
import com.ammarakshitha.model.enums.AlertType;
import com.ammarakshitha.model.enums.FollowUpStatus;
import com.ammarakshitha.model.enums.RiskLevel;
import com.ammarakshitha.repository.FollowUpRepository;
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
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class FollowUpService {

    private final FollowUpRepository followUpRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final RiskAlertRepository riskAlertRepository;

    public FollowUp createFollowUp(FollowUpRequest request) {
        log.info("Creating follow-up for patient: {}", request.getPatientId());

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        User assignedTo = userRepository.findById(request.getAssignedToId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        FollowUp followUp = FollowUp.builder()
                .patient(patient)
                .assignedTo(assignedTo)
                .scheduledDate(request.getScheduledDate())
                .status(FollowUpStatus.PENDING)
                .notes(request.getNotes())
                .build();

        return followUpRepository.save(followUp);
    }

    public FollowUp updateFollowUp(Long followUpId, FollowUpUpdateRequest request) {
        FollowUp followUp = getFollowUpById(followUpId);

        followUp.setStatus(request.getStatus());
        followUp.setCallAttemptedAt(LocalDateTime.now());
        followUp.setAttemptCount(followUp.getAttemptCount() + 1);

        if (request.getStatus() == FollowUpStatus.COMPLETED) {
            followUp.setCallCompletedAt(LocalDateTime.now());
            followUp.setCallDurationSeconds(request.getCallDurationSeconds());
            followUp.setPatientCondition(request.getPatientCondition());
            followUp.setSymptomsReported(request.getSymptomsReported());
            followUp.setMedicationCompliance(request.getMedicationCompliance());
            followUp.setConcernsRaised(request.getConcernsRaised());
            followUp.setAdviceGiven(request.getAdviceGiven());
            followUp.setRequiresDoctorConsultation(request.getRequiresDoctorConsultation());
            followUp.setRequiresImmediateAttention(request.getRequiresImmediateAttention());
            followUp.setNextFollowUpDate(request.getNextFollowUpDate());

            // Create alert if immediate attention required
            if (Boolean.TRUE.equals(request.getRequiresImmediateAttention())) {
                createImmediateAttentionAlert(followUp);
            }

            // Schedule next follow-up if needed
            if (request.getNextFollowUpDate() != null) {
                scheduleNextFollowUp(followUp, request.getNextFollowUpDate());
            }
        }

        followUp.setNotes(request.getNotes());

        log.info("Follow-up updated: {} with status: {}", followUpId, request.getStatus());
        return followUpRepository.save(followUp);
    }

    private void createImmediateAttentionAlert(FollowUp followUp) {
        RiskAlert alert = RiskAlert.builder()
                .patient(followUp.getPatient())
                .alertType(AlertType.COMPLICATION_REPORTED)
                .severity(RiskLevel.RED)
                .title("URGENT: Patient Requires Immediate Attention")
                .description(String.format(
                        "During follow-up call with patient %s (Mother ID: %s), " +
                        "help desk staff reported that patient requires immediate attention. " +
                        "Symptoms: %s. Concerns: %s",
                        followUp.getPatient().getName(),
                        followUp.getPatient().getMotherId(),
                        followUp.getSymptomsReported(),
                        followUp.getConcernsRaised()))
                .recommendedAction("Contact patient immediately. Arrange emergency consultation if needed.")
                .build();

        riskAlertRepository.save(alert);
        log.warn("Immediate attention alert created for patient: {}", followUp.getPatient().getMotherId());
    }

    private void scheduleNextFollowUp(FollowUp currentFollowUp, LocalDate nextDate) {
        FollowUp nextFollowUp = FollowUp.builder()
                .patient(currentFollowUp.getPatient())
                .assignedTo(currentFollowUp.getAssignedTo())
                .scheduledDate(nextDate)
                .status(FollowUpStatus.PENDING)
                .notes("Follow-up from previous call on " + currentFollowUp.getScheduledDate())
                .build();

        followUpRepository.save(nextFollowUp);
        log.info("Next follow-up scheduled for: {}", nextDate);
    }

    public FollowUp rescheduleFollowUp(Long followUpId, LocalDate newDate) {
        FollowUp followUp = getFollowUpById(followUpId);

        if (followUp.getStatus() == FollowUpStatus.COMPLETED) {
            throw new BusinessException("Cannot reschedule completed follow-up");
        }

        followUp.setScheduledDate(newDate);
        followUp.setStatus(FollowUpStatus.RESCHEDULED);

        return followUpRepository.save(followUp);
    }

    public FollowUp reassignFollowUp(Long followUpId, Long newAssigneeId) {
        FollowUp followUp = getFollowUpById(followUpId);
        User newAssignee = userRepository.findById(newAssigneeId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        followUp.setAssignedTo(newAssignee);
        return followUpRepository.save(followUp);
    }

    @Transactional(readOnly = true)
    public FollowUp getFollowUpById(Long id) {
        return followUpRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Follow-up not found"));
    }

    @Transactional(readOnly = true)
    public List<FollowUp> getFollowUpsByPatientId(Long patientId) {
        return followUpRepository.findByPatientId(patientId);
    }

    @Transactional(readOnly = true)
    public Page<FollowUp> getFollowUpsByAssignedUser(Long userId, Pageable pageable) {
        return followUpRepository.findByAssignedToId(userId, pageable);
    }

    @Transactional(readOnly = true)
    public List<FollowUp> getTodaysPendingFollowUps(Long userId) {
        return followUpRepository.findTodaysPendingForUser(userId);
    }

    @Transactional(readOnly = true)
    public List<FollowUp> getTodaysFollowUps() {
        return followUpRepository.findTodaysFollowUps();
    }

    @Transactional(readOnly = true)
    public List<FollowUp> getOverdueFollowUps() {
        return followUpRepository.findOverdue(LocalDate.now());
    }

    @Transactional(readOnly = true)
    public List<FollowUp> getUpcomingFollowUps() {
        return followUpRepository.findUpcoming(LocalDate.now());
    }

    @Transactional(readOnly = true)
    public List<FollowUp> getOverdueFollowUpsForUser(Long userId) {
        return followUpRepository.findOverdueForUser(userId, LocalDate.now());
    }

    @Transactional(readOnly = true)
    public List<FollowUp> getFollowUpsRequiringDoctorConsultation() {
        return followUpRepository.findRequiringDoctorConsultation();
    }

    @Transactional(readOnly = true)
    public long countPendingTodayForUser(Long userId) {
        return followUpRepository.countPendingTodayForUser(userId);
    }

    @Transactional(readOnly = true)
    public long countForToday() {
        return followUpRepository.countForDate(LocalDate.now());
    }

    @Transactional(readOnly = true)
    public long countCompletedToday() {
        return followUpRepository.countCompletedForDate(LocalDate.now());
    }

    @Transactional(readOnly = true)
    public List<FollowUp> getFollowUpsByDateRange(LocalDate startDate, LocalDate endDate) {
        return followUpRepository.findByScheduledDateBetween(startDate, endDate);
    }

    @Transactional(readOnly = true)
    public List<FollowUp> getAllFollowUps() {
        return followUpRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<FollowUp> getPastFollowUps() {
        return followUpRepository.findPastFollowUps();
    }

    /**
     * Update the photo URL for a follow-up (after photo upload).
     */
    public FollowUp updatePhotoUrl(Long followUpId, String photoUrl) {
        FollowUp followUp = getFollowUpById(followUpId);
        followUp.setPhotoUrl(photoUrl);
        log.info("Photo uploaded for follow-up: {}", followUpId);
        return followUpRepository.save(followUp);
    }

    /**
     * Delete a follow-up by ID.
     */
    public void deleteFollowUp(Long followUpId) {
        FollowUp followUp = getFollowUpById(followUpId);
        followUpRepository.delete(followUp);
        log.info("Follow-up deleted: {}", followUpId);
    }
}
