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

    // Active records only (treats NULL as active for backward compatibility)
    @Query("SELECT hc FROM HealthCheck hc WHERE hc.patient.id = :patientId AND (hc.isActive = true OR hc.isActive IS NULL)")
    List<HealthCheck> findByPatientIdAndIsActiveTrue(@Param("patientId") Long patientId);

    @Query("SELECT hc FROM HealthCheck hc WHERE hc.patient.id = :patientId AND (hc.isActive = true OR hc.isActive IS NULL)")
    Page<HealthCheck> findByPatientIdAndIsActiveTrue(@Param("patientId") Long patientId, Pageable pageable);

    @Query("SELECT hc FROM HealthCheck hc WHERE hc.patient.id = :patientId AND (hc.isActive = true OR hc.isActive IS NULL) ORDER BY hc.checkDate DESC")
    List<HealthCheck> findByPatientIdAndIsActiveTrueOrderByCheckDateDesc(@Param("patientId") Long patientId);

    @Query("SELECT hc FROM HealthCheck hc WHERE hc.patient.id = :patientId AND (hc.isActive = true OR hc.isActive IS NULL) ORDER BY hc.checkDate DESC")
    Page<HealthCheck> findActiveByPatientIdOrderByCheckDateDescPaged(@Param("patientId") Long patientId, Pageable pageable);

    Optional<HealthCheck> findById(Long id);

    // Legacy methods (for backward compatibility - consider removing)
    List<HealthCheck> findByPatientId(Long patientId);

    Page<HealthCheck> findByPatientId(Long patientId, Pageable pageable);

    List<HealthCheck> findByPatientIdOrderByCheckDateDesc(Long patientId);

    Optional<HealthCheck> findTopByPatientIdOrderByCheckDateDesc(Long patientId);

    // Risk level queries (active only, treats NULL as active)
    @Query("SELECT hc FROM HealthCheck hc WHERE hc.riskLevel = :riskLevel AND (hc.isActive = true OR hc.isActive IS NULL)")
    List<HealthCheck> findByRiskLevelAndIsActiveTrue(@Param("riskLevel") RiskLevel riskLevel);

    @Query("SELECT hc FROM HealthCheck hc WHERE hc.riskLevel = :riskLevel AND (hc.isActive = true OR hc.isActive IS NULL)")
    Page<HealthCheck> findByRiskLevelAndIsActiveTrue(@Param("riskLevel") RiskLevel riskLevel, Pageable pageable);

    @Query("SELECT hc FROM HealthCheck hc WHERE hc.riskLevel IN ('RED', 'YELLOW') AND (hc.isActive = true OR hc.isActive IS NULL) ORDER BY hc.checkDate DESC")
    Page<HealthCheck> findHighRiskHealthChecks(Pageable pageable);

    // Legacy (all records including inactive)
    List<HealthCheck> findByRiskLevel(RiskLevel riskLevel);

    Page<HealthCheck> findByRiskLevel(RiskLevel riskLevel, Pageable pageable);

    // Date range queries (active only, treats NULL as active)
    @Query("SELECT hc FROM HealthCheck hc WHERE hc.checkDate BETWEEN :startDate AND :endDate AND (hc.isActive = true OR hc.isActive IS NULL)")
    List<HealthCheck> findByCheckDateBetweenAndIsActiveTrue(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT hc FROM HealthCheck hc WHERE hc.patient.id = :patientId AND hc.checkDate BETWEEN :startDate AND :endDate AND (hc.isActive = true OR hc.isActive IS NULL)")
    List<HealthCheck> findByPatientAndDateRange(
            @Param("patientId") Long patientId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    // Legacy
    List<HealthCheck> findByCheckDateBetween(LocalDate startDate, LocalDate endDate);

    // Performed by user (active only, treats NULL as active)
    @Query("SELECT hc FROM HealthCheck hc WHERE hc.performedBy.id = :userId AND (hc.isActive = true OR hc.isActive IS NULL)")
    List<HealthCheck> findByPerformedByIdAndIsActiveTrue(@Param("userId") Long userId);

    @Query("SELECT hc FROM HealthCheck hc WHERE hc.performedBy.id = :userId AND hc.checkDate = :checkDate AND (hc.isActive = true OR hc.isActive IS NULL)")
    Page<HealthCheck> findByPerformedByIdAndCheckDateAndIsActiveTrue(
            @Param("userId") Long userId,
            @Param("checkDate") LocalDate checkDate,
            Pageable pageable);

    // Legacy
    List<HealthCheck> findByPerformedById(Long userId);

    Page<HealthCheck> findByPerformedByIdAndCheckDate(Long userId, LocalDate checkDate, Pageable pageable);

    // Next check date queries (active only, treats NULL as active)
    @Query("SELECT hc FROM HealthCheck hc WHERE hc.nextCheckDate = :date AND (hc.isActive = true OR hc.isActive IS NULL)")
    List<HealthCheck> findByNextCheckDate(@Param("date") LocalDate date);

    @Query("SELECT hc FROM HealthCheck hc WHERE hc.nextCheckDate <= :date AND hc.patient.status = 'ACTIVE' AND (hc.isActive = true OR hc.isActive IS NULL)")
    List<HealthCheck> findOverdueHealthChecks(@Param("date") LocalDate date);

    // Critical vitals queries (active only, treats NULL as active)
    @Query("SELECT hc FROM HealthCheck hc WHERE (hc.bpSystolic >= 140 OR hc.bpDiastolic >= 90) AND (hc.isActive = true OR hc.isActive IS NULL)")
    List<HealthCheck> findWithHighBloodPressure();

    @Query("SELECT hc FROM HealthCheck hc WHERE hc.hemoglobin < 10 AND (hc.isActive = true OR hc.isActive IS NULL)")
    List<HealthCheck> findWithLowHemoglobin();

    @Query("SELECT hc FROM HealthCheck hc WHERE (hc.bloodSugarFasting > 126 OR hc.bloodSugarRandom > 200) AND (hc.isActive = true OR hc.isActive IS NULL)")
    List<HealthCheck> findWithHighBloodSugar();

    // Statistics (active only, treats NULL as active)
    @Query("SELECT hc.riskLevel, COUNT(hc) FROM HealthCheck hc WHERE hc.checkDate = :date AND (hc.isActive = true OR hc.isActive IS NULL) GROUP BY hc.riskLevel")
    List<Object[]> countByRiskLevelOnDate(@Param("date") LocalDate date);

    @Query("SELECT COUNT(hc) FROM HealthCheck hc WHERE hc.checkDate = :date AND (hc.isActive = true OR hc.isActive IS NULL)")
    long countOnDate(@Param("date") LocalDate date);

    @Query("SELECT COUNT(hc) FROM HealthCheck hc WHERE hc.checkDate BETWEEN :startDate AND :endDate AND (hc.isActive = true OR hc.isActive IS NULL)")
    long countBetweenDates(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT AVG(hc.hemoglobin) FROM HealthCheck hc WHERE hc.checkDate BETWEEN :startDate AND :endDate AND hc.hemoglobin IS NOT NULL AND (hc.isActive = true OR hc.isActive IS NULL)")
    Double getAverageHemoglobinBetweenDates(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
