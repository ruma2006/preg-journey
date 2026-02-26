package com.ammarakshitha.service;

import com.ammarakshitha.dto.AlertAcknowledgeRequest;
import com.ammarakshitha.exception.ResourceNotFoundException;
import com.ammarakshitha.model.RiskAlert;
import com.ammarakshitha.model.User;
import com.ammarakshitha.model.enums.AlertType;
import com.ammarakshitha.model.enums.RiskLevel;
import com.ammarakshitha.repository.RiskAlertRepository;
import com.ammarakshitha.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class RiskAlertService {

    private final RiskAlertRepository riskAlertRepository;
    private final UserRepository userRepository;

    public RiskAlert acknowledgeAlert(Long alertId, AlertAcknowledgeRequest request, Long acknowledgedByUserId) {
        RiskAlert alert = getAlertById(alertId);
        User acknowledgedBy = userRepository.findById(acknowledgedByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        alert.setIsAcknowledged(true);
        alert.setAcknowledgedBy(acknowledgedBy);
        alert.setAcknowledgedAt(LocalDateTime.now());
        alert.setAcknowledgmentNotes(request.getNotes());
        alert.setActionTaken(request.getActionTaken());

        log.info("Alert {} acknowledged by user {}", alertId, acknowledgedByUserId);
        return riskAlertRepository.save(alert);
    }

    public RiskAlert updateAcknowledgement(Long alertId, AlertAcknowledgeRequest request) {
        RiskAlert alert = getAlertById(alertId);

        if (!alert.getIsAcknowledged()) {
            throw new IllegalStateException("Alert has not been acknowledged yet");
        }

        alert.setAcknowledgmentNotes(request.getNotes());
        alert.setActionTaken(request.getActionTaken());

        log.info("Alert {} acknowledgement updated", alertId);
        return riskAlertRepository.save(alert);
    }

    public RiskAlert resolveAlert(Long alertId, String resolutionNotes) {
        RiskAlert alert = getAlertById(alertId);

        alert.setIsResolved(true);
        alert.setResolvedAt(LocalDateTime.now());
        alert.setResolutionNotes(resolutionNotes);

        log.info("Alert {} resolved", alertId);
        return riskAlertRepository.save(alert);
    }

    public void bulkAcknowledge(List<Long> alertIds, Long userId) {
        riskAlertRepository.bulkAcknowledge(alertIds, userId, LocalDateTime.now());
        log.info("Bulk acknowledged {} alerts by user {}", alertIds.size(), userId);
    }

    @Transactional(readOnly = true)
    public RiskAlert getAlertById(Long id) {
        return riskAlertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found"));
    }

    @Transactional(readOnly = true)
    public List<RiskAlert> getAlertsByPatientId(Long patientId) {
        return riskAlertRepository.findByPatientId(patientId);
    }

    @Transactional(readOnly = true)
    public Page<RiskAlert> getUnacknowledgedAlerts(Pageable pageable) {
        return riskAlertRepository.findByIsAcknowledgedFalse(pageable);
    }

    @Transactional(readOnly = true)
    public List<RiskAlert> getUnacknowledgedAlertsBySeverity() {
        return riskAlertRepository.findUnacknowledgedOrderedBySeverity();
    }

    @Transactional(readOnly = true)
    public List<RiskAlert> getCriticalUnacknowledgedAlerts() {
        return riskAlertRepository.findCriticalUnacknowledged();
    }

    @Transactional(readOnly = true)
    public Page<RiskAlert> getHighPriorityUnacknowledgedAlerts(Pageable pageable) {
        return riskAlertRepository.findHighPriorityUnacknowledged(pageable);
    }

    @Transactional(readOnly = true)
    public List<RiskAlert> getUnresolvedAlerts() {
        return riskAlertRepository.findUnresolved();
    }

    @Transactional(readOnly = true)
    public List<RiskAlert> getUnresolvedAlertsForPatient(Long patientId) {
        return riskAlertRepository.findUnresolvedForPatient(patientId);
    }

    @Transactional(readOnly = true)
    public Page<RiskAlert> getAlertsBySeverity(RiskLevel severity, Pageable pageable) {
        return riskAlertRepository.findBySeverity(severity, pageable);
    }

    @Transactional(readOnly = true)
    public List<RiskAlert> getAlertsByType(AlertType alertType) {
        return riskAlertRepository.findByAlertType(alertType);
    }

    // Statistics
    @Transactional(readOnly = true)
    public long countUnacknowledged() {
        return riskAlertRepository.countUnacknowledged();
    }

    @Transactional(readOnly = true)
    public long countCriticalUnacknowledged() {
        return riskAlertRepository.countCriticalUnacknowledged();
    }

    @Transactional(readOnly = true)
    public long countTodaysAlerts() {
        return riskAlertRepository.countTodaysAlerts();
    }

    @Transactional(readOnly = true)
    public List<Object[]> countUnacknowledgedBySeverity() {
        return riskAlertRepository.countUnacknowledgedBySeverity();
    }

    @Transactional(readOnly = true)
    public List<Object[]> countByAlertType() {
        return riskAlertRepository.countByAlertType();
    }

    @Transactional(readOnly = true)
    public Page<RiskAlert> getAllAlerts(Pageable pageable) {
        return riskAlertRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Page<RiskAlert> getAcknowledgedAlerts(Pageable pageable) {
        return riskAlertRepository.findByIsAcknowledgedTrue(pageable);
    }

    @Transactional(readOnly = true)
    public Page<RiskAlert> getAllAlertsForPatient(Long patientId, Pageable pageable) {
        return riskAlertRepository.findByPatientIdOrderByCreatedAtDesc(patientId, pageable);
    }
}
