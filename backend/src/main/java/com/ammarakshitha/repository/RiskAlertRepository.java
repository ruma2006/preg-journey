package com.ammarakshitha.repository;

import com.ammarakshitha.model.RiskAlert;
import com.ammarakshitha.model.enums.AlertType;
import com.ammarakshitha.model.enums.RiskLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RiskAlertRepository extends JpaRepository<RiskAlert, Long> {

    List<RiskAlert> findByPatientId(Long patientId);

    Page<RiskAlert> findByPatientId(Long patientId, Pageable pageable);

    // Unacknowledged alerts
    List<RiskAlert> findByIsAcknowledgedFalse();

    Page<RiskAlert> findByIsAcknowledgedFalse(Pageable pageable);

    Page<RiskAlert> findByIsAcknowledgedTrue(Pageable pageable);

    Page<RiskAlert> findByPatientIdOrderByCreatedAtDesc(Long patientId, Pageable pageable);

    @Query("SELECT r FROM RiskAlert r WHERE r.isAcknowledged = false ORDER BY r.severity DESC, r.createdAt DESC")
    List<RiskAlert> findUnacknowledgedOrderedBySeverity();

    @Query("SELECT r FROM RiskAlert r WHERE r.isAcknowledged = false AND r.severity = 'RED' ORDER BY r.createdAt DESC")
    List<RiskAlert> findCriticalUnacknowledged();

    // Severity queries
    List<RiskAlert> findBySeverity(RiskLevel severity);

    Page<RiskAlert> findBySeverity(RiskLevel severity, Pageable pageable);

    @Query("SELECT r FROM RiskAlert r WHERE r.severity IN ('RED', 'YELLOW') AND r.isAcknowledged = false")
    Page<RiskAlert> findHighPriorityUnacknowledged(Pageable pageable);

    // Alert type queries
    List<RiskAlert> findByAlertType(AlertType alertType);

    // Date range queries
    @Query("SELECT r FROM RiskAlert r WHERE r.createdAt BETWEEN :start AND :end")
    List<RiskAlert> findByCreatedAtBetween(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    // Unresolved alerts
    @Query("SELECT r FROM RiskAlert r WHERE r.isResolved = false ORDER BY r.severity DESC, r.createdAt DESC")
    List<RiskAlert> findUnresolved();

    @Query("SELECT r FROM RiskAlert r WHERE r.patient.id = :patientId AND r.isResolved = false")
    List<RiskAlert> findUnresolvedForPatient(@Param("patientId") Long patientId);

    // Acknowledged by user
    List<RiskAlert> findByAcknowledgedById(Long userId);

    // SMS not sent
    @Query("SELECT r FROM RiskAlert r WHERE r.smsSent = false AND r.severity = 'RED'")
    List<RiskAlert> findCriticalWithoutSms();

    // Bulk acknowledge
    @Modifying
    @Query("UPDATE RiskAlert r SET r.isAcknowledged = true, r.acknowledgedBy.id = :userId, r.acknowledgedAt = :acknowledgedAt WHERE r.id IN :ids")
    void bulkAcknowledge(
            @Param("ids") List<Long> ids,
            @Param("userId") Long userId,
            @Param("acknowledgedAt") LocalDateTime acknowledgedAt);

    // Statistics
    @Query("SELECT r.severity, COUNT(r) FROM RiskAlert r WHERE r.isAcknowledged = false GROUP BY r.severity")
    List<Object[]> countUnacknowledgedBySeverity();

    @Query("SELECT r.alertType, COUNT(r) FROM RiskAlert r GROUP BY r.alertType")
    List<Object[]> countByAlertType();

    @Query("SELECT COUNT(r) FROM RiskAlert r WHERE r.isAcknowledged = false")
    long countUnacknowledged();

    @Query("SELECT COUNT(r) FROM RiskAlert r WHERE r.severity = 'RED' AND r.isAcknowledged = false")
    long countCriticalUnacknowledged();

    @Query("SELECT COUNT(r) FROM RiskAlert r WHERE CAST(r.createdAt AS date) = CURRENT_DATE")
    long countTodaysAlerts();

    @Query("SELECT COUNT(r) FROM RiskAlert r WHERE r.createdAt BETWEEN :start AND :end")
    long countBetween(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);
}
