package com.ammarakshitha.repository;

import com.ammarakshitha.model.Consultation;
import com.ammarakshitha.model.enums.ConsultationStatus;
import com.ammarakshitha.model.enums.ConsultationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ConsultationRepository extends JpaRepository<Consultation, Long> {

    List<Consultation> findByPatientId(Long patientId);

    Page<Consultation> findByPatientId(Long patientId, Pageable pageable);

    List<Consultation> findByDoctorId(Long doctorId);

    Page<Consultation> findByDoctorId(Long doctorId, Pageable pageable);

    // Status queries
    List<Consultation> findByStatus(ConsultationStatus status);

    Page<Consultation> findByStatus(ConsultationStatus status, Pageable pageable);

    List<Consultation> findByDoctorIdAndStatus(Long doctorId, ConsultationStatus status);

    // Type queries
    List<Consultation> findByType(ConsultationType type);

    // Scheduled time queries
    @Query("SELECT c FROM Consultation c WHERE c.scheduledAt BETWEEN :start AND :end ORDER BY c.scheduledAt")
    List<Consultation> findByScheduledTimeBetween(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("SELECT c FROM Consultation c WHERE c.doctor.id = :doctorId AND c.scheduledAt BETWEEN :start AND :end ORDER BY c.scheduledAt")
    List<Consultation> findByDoctorAndScheduledTimeBetween(
            @Param("doctorId") Long doctorId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    // Today's consultations
    //@Query("SELECT c FROM Consultation c WHERE c.doctor.id = :doctorId AND DATE(c.scheduledAt) = CURRENT_DATE ORDER BY c.scheduledAt")
    @Query("SELECT c FROM Consultation c WHERE c.doctor.id = :doctorId AND CAST(c.scheduledAt AS date) = CURRENT_DATE ORDER BY c.scheduledAt")
    List<Consultation> findTodaysConsultationsForDoctor(@Param("doctorId") Long doctorId);

    // Upcoming consultations
    @Query("SELECT c FROM Consultation c WHERE c.status = 'SCHEDULED' AND c.scheduledAt >= :now ORDER BY c.scheduledAt")
    Page<Consultation> findUpcomingConsultations(@Param("now") LocalDateTime now, Pageable pageable);

    @Query("SELECT c FROM Consultation c WHERE c.doctor.id = :doctorId AND c.status = 'SCHEDULED' AND c.scheduledAt >= :now ORDER BY c.scheduledAt")
    List<Consultation> findUpcomingConsultationsForDoctor(
            @Param("doctorId") Long doctorId,
            @Param("now") LocalDateTime now);

    @Query("SELECT c FROM Consultation c WHERE c.patient.id = :patientId AND c.status = 'SCHEDULED' AND c.scheduledAt >= :now ORDER BY c.scheduledAt")
    List<Consultation> findUpcomingConsultationsForPatient(
            @Param("patientId") Long patientId,
            @Param("now") LocalDateTime now);

    // Statistics
    @Query("SELECT c.status, COUNT(c) FROM Consultation c GROUP BY c.status")
    List<Object[]> countByStatus();

    @Query("SELECT c.type, COUNT(c) FROM Consultation c WHERE c.status = 'COMPLETED' GROUP BY c.type")
    List<Object[]> countCompletedByType();

    @Query("SELECT COUNT(c) FROM Consultation c WHERE c.doctor.id = :doctorId AND c.status = 'COMPLETED' AND c.scheduledAt BETWEEN :start AND :end")
    long countCompletedByDoctorBetween(
            @Param("doctorId") Long doctorId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    //@Query("SELECT COUNT(c) FROM Consultation c WHERE DATE(c.scheduledAt) = CURRENT_DATE")
    @Query("SELECT COUNT(c) FROM Consultation c WHERE CAST(c.scheduledAt AS date) = CURRENT_DATE")
    long countTodaysConsultations();
}
