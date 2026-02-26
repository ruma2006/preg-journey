package com.ammarakshitha.repository;

import com.ammarakshitha.model.FollowUp;
import com.ammarakshitha.model.enums.FollowUpStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FollowUpRepository extends JpaRepository<FollowUp, Long> {

    List<FollowUp> findByPatientId(Long patientId);

    Page<FollowUp> findByPatientId(Long patientId, Pageable pageable);

    List<FollowUp> findByAssignedToId(Long userId);

    Page<FollowUp> findByAssignedToId(Long userId, Pageable pageable);

    // Status queries
    List<FollowUp> findByStatus(FollowUpStatus status);

    Page<FollowUp> findByStatus(FollowUpStatus status, Pageable pageable);

    List<FollowUp> findByAssignedToIdAndStatus(Long userId, FollowUpStatus status);

    // Scheduled date queries
    List<FollowUp> findByScheduledDate(LocalDate date);

    @Query("SELECT f FROM FollowUp f WHERE f.scheduledDate = :date AND f.status = 'PENDING'")
    List<FollowUp> findPendingForDate(@Param("date") LocalDate date);

    @Query("SELECT f FROM FollowUp f WHERE f.assignedTo.id = :userId AND f.scheduledDate = :date")
    List<FollowUp> findByAssignedUserAndDate(
            @Param("userId") Long userId,
            @Param("date") LocalDate date);

    // Today's follow-ups
    @Query("SELECT f FROM FollowUp f WHERE f.assignedTo.id = :userId AND f.scheduledDate = CURRENT_DATE AND f.status = 'PENDING'")
    List<FollowUp> findTodaysPendingForUser(@Param("userId") Long userId);

    @Query("SELECT f FROM FollowUp f WHERE f.scheduledDate = CURRENT_DATE ORDER BY f.patient.currentRiskLevel DESC")
    List<FollowUp> findTodaysFollowUps();

    // Overdue follow-ups
    @Query("SELECT f FROM FollowUp f WHERE f.scheduledDate < :date AND f.status = 'PENDING'")
    List<FollowUp> findOverdue(@Param("date") LocalDate date);

    // Upcoming follow-ups (scheduled after today, still pending)
    @Query("SELECT f FROM FollowUp f WHERE f.scheduledDate > :date AND f.status = 'PENDING' ORDER BY f.scheduledDate ASC, f.patient.currentRiskLevel DESC")
    List<FollowUp> findUpcoming(@Param("date") LocalDate date);

    @Query("SELECT f FROM FollowUp f WHERE f.assignedTo.id = :userId AND f.scheduledDate < :date AND f.status = 'PENDING'")
    List<FollowUp> findOverdueForUser(
            @Param("userId") Long userId,
            @Param("date") LocalDate date);

    // Requiring immediate attention
    @Query("SELECT f FROM FollowUp f WHERE f.requiresImmediateAttention = true AND f.status = 'COMPLETED'")
    List<FollowUp> findRequiringImmediateAttention();

    // Requiring doctor consultation
    @Query("SELECT f FROM FollowUp f WHERE f.requiresDoctorConsultation = true AND f.status = 'COMPLETED'")
    List<FollowUp> findRequiringDoctorConsultation();

    // Statistics
    @Query("SELECT f.status, COUNT(f) FROM FollowUp f GROUP BY f.status")
    List<Object[]> countByStatus();

    @Query("SELECT COUNT(f) FROM FollowUp f WHERE f.scheduledDate = :date")
    long countForDate(@Param("date") LocalDate date);

    @Query("SELECT COUNT(f) FROM FollowUp f WHERE f.scheduledDate = :date AND f.status = 'COMPLETED'")
    long countCompletedForDate(@Param("date") LocalDate date);

    @Query("SELECT COUNT(f) FROM FollowUp f WHERE f.assignedTo.id = :userId AND f.scheduledDate = CURRENT_DATE AND f.status = 'PENDING'")
    long countPendingTodayForUser(@Param("userId") Long userId);

    @Query("SELECT COUNT(f) FROM FollowUp f WHERE f.assignedTo.id = :userId AND f.status = 'COMPLETED' AND f.scheduledDate BETWEEN :start AND :end")
    long countCompletedByUserBetween(
            @Param("userId") Long userId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end);

    // Date range query for calendar heatmap
    List<FollowUp> findByScheduledDateBetween(LocalDate startDate, LocalDate endDate);
}
