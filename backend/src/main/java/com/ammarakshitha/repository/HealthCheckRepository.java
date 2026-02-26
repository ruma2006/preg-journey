package com.ammarakshitha.repository;

import com.ammarakshitha.model.HealthCheck;
import com.ammarakshitha.model.enums.RiskLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HealthCheckRepository extends JpaRepository<HealthCheck, Long> {

    List<HealthCheck> findByPatientId(Long patientId);

    Page<HealthCheck> findByPatientId(Long patientId, Pageable pageable);

    List<HealthCheck> findByPatientIdOrderByCheckDateDesc(Long patientId);

    Optional<HealthCheck> findTopByPatientIdOrderByCheckDateDesc(Long patientId);
    
    Optional<HealthCheck> findById(Long id);

    // Risk level queries
    List<HealthCheck> findByRiskLevel(RiskLevel riskLevel);

    Page<HealthCheck> findByRiskLevel(RiskLevel riskLevel, Pageable pageable);

    @Query("SELECT hc FROM HealthCheck hc WHERE hc.riskLevel IN ('RED', 'YELLOW') ORDER BY hc.checkDate DESC")
    Page<HealthCheck> findHighRiskHealthChecks(Pageable pageable);

    // Date range queries
    List<HealthCheck> findByCheckDateBetween(LocalDate startDate, LocalDate endDate);

    @Query("SELECT hc FROM HealthCheck hc WHERE hc.patient.id = :patientId AND hc.checkDate BETWEEN :startDate AND :endDate")
    List<HealthCheck> findByPatientAndDateRange(
            @Param("patientId") Long patientId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    // Performed by user
    List<HealthCheck> findByPerformedById(Long userId);

    Page<HealthCheck> findByPerformedByIdAndCheckDate(Long userId, LocalDate checkDate, Pageable pageable);

    // Next check date queries
    @Query("SELECT hc FROM HealthCheck hc WHERE hc.nextCheckDate = :date")
    List<HealthCheck> findByNextCheckDate(@Param("date") LocalDate date);

    @Query("SELECT hc FROM HealthCheck hc WHERE hc.nextCheckDate <= :date AND hc.patient.status = 'ACTIVE'")
    List<HealthCheck> findOverdueHealthChecks(@Param("date") LocalDate date);

    // Critical vitals queries
    @Query("SELECT hc FROM HealthCheck hc WHERE hc.bpSystolic >= 140 OR hc.bpDiastolic >= 90")
    List<HealthCheck> findWithHighBloodPressure();

    @Query("SELECT hc FROM HealthCheck hc WHERE hc.hemoglobin < 10")
    List<HealthCheck> findWithLowHemoglobin();

    @Query("SELECT hc FROM HealthCheck hc WHERE hc.bloodSugarFasting > 126 OR hc.bloodSugarRandom > 200")
    List<HealthCheck> findWithHighBloodSugar();

    // Statistics
    @Query("SELECT hc.riskLevel, COUNT(hc) FROM HealthCheck hc WHERE hc.checkDate = :date GROUP BY hc.riskLevel")
    List<Object[]> countByRiskLevelOnDate(@Param("date") LocalDate date);

    @Query("SELECT COUNT(hc) FROM HealthCheck hc WHERE hc.checkDate = :date")
    long countOnDate(@Param("date") LocalDate date);

    @Query("SELECT COUNT(hc) FROM HealthCheck hc WHERE hc.checkDate BETWEEN :startDate AND :endDate")
    long countBetweenDates(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT AVG(hc.hemoglobin) FROM HealthCheck hc WHERE hc.checkDate BETWEEN :startDate AND :endDate AND hc.hemoglobin IS NOT NULL")
    Double getAverageHemoglobinBetweenDates(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
