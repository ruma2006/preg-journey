package com.ammarakshitha.repository;

import com.ammarakshitha.model.Patient;
import com.ammarakshitha.model.enums.DeliveryOutcome;
import com.ammarakshitha.model.enums.PatientStatus;
import com.ammarakshitha.model.enums.RiskLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long>, JpaSpecificationExecutor<Patient> {

    Optional<Patient> findByMotherId(String motherId);

    Optional<Patient> findByAadhaarNumber(String aadhaarNumber);

    boolean existsByMotherId(String motherId);

    boolean existsByAadhaarNumber(String aadhaarNumber);

    // Check if an ACTIVE patient exists with the given Aadhaar number
    // This allows re-registration when previous patient is DISCHARGED or INACTIVE
    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM Patient p WHERE p.aadhaarNumber = :aadhaarNumber AND p.status = 'ACTIVE'")
    boolean existsActivePatientByAadhaarNumber(@Param("aadhaarNumber") String aadhaarNumber);

    // Find active patient by Aadhaar
    @Query("SELECT p FROM Patient p WHERE p.aadhaarNumber = :aadhaarNumber AND p.status = 'ACTIVE'")
    Optional<Patient> findActiveByAadhaarNumber(@Param("aadhaarNumber") String aadhaarNumber);

    // Check for active registration with same mobile number and similar LMP date range (for duplicate check)
    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM Patient p WHERE p.mobileNumber = :mobileNumber AND p.status = 'ACTIVE' AND p.lmpDate = :lmpDate")
    boolean existsActivePatientByMobileAndLmpDate(
            @Param("mobileNumber") String mobileNumber,
            @Param("lmpDate") LocalDate lmpDate);

    List<Patient> findByMobileNumber(String mobileNumber);

    // Risk level queries
    List<Patient> findByCurrentRiskLevel(RiskLevel riskLevel);

    Page<Patient> findByCurrentRiskLevel(RiskLevel riskLevel, Pageable pageable);

    @Query("SELECT p FROM Patient p WHERE p.currentRiskLevel IN :levels AND p.status = :status")
    List<Patient> findByRiskLevelsAndStatus(
            @Param("levels") List<RiskLevel> levels,
            @Param("status") PatientStatus status);

    // High risk patients
    @Query("SELECT p FROM Patient p WHERE p.currentRiskLevel = 'RED' AND p.status = 'ACTIVE' ORDER BY p.currentRiskScore DESC")
    List<Patient> findHighRiskPatients();

    @Query("SELECT p FROM Patient p WHERE p.currentRiskLevel IN ('RED', 'YELLOW') AND p.status = 'ACTIVE'")
    Page<Patient> findAtRiskPatients(Pageable pageable);

    // Status queries
    List<Patient> findByStatus(PatientStatus status);

    Page<Patient> findByStatus(PatientStatus status, Pageable pageable);

    // Location based queries
    List<Patient> findByDistrict(String district);

    List<Patient> findByDistrictAndMandal(String district, String mandal);

    @Query("SELECT p FROM Patient p WHERE p.district = :district AND p.currentRiskLevel = :riskLevel")
    List<Patient> findByDistrictAndRiskLevel(
            @Param("district") String district,
            @Param("riskLevel") RiskLevel riskLevel);

    // EDD based queries
    @Query("SELECT p FROM Patient p WHERE p.eddDate BETWEEN :startDate AND :endDate AND p.status = 'ACTIVE'")
    List<Patient> findByEddDateBetween(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT p FROM Patient p WHERE p.eddDate <= :date AND p.status = 'ACTIVE'")
    List<Patient> findOverdueDeliveries(@Param("date") LocalDate date);

    // Search queries
    @Query("SELECT p FROM Patient p WHERE " +
            "LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "p.motherId LIKE CONCAT('%', :search, '%') OR " +
            "p.mobileNumber LIKE CONCAT('%', :search, '%') OR " +
            "p.aadhaarNumber LIKE CONCAT('%', :search, '%')")
    Page<Patient> searchPatients(@Param("search") String search, Pageable pageable);

    // Statistics queries
    @Query("SELECT p.currentRiskLevel, COUNT(p) FROM Patient p WHERE p.status = 'ACTIVE' GROUP BY p.currentRiskLevel")
    List<Object[]> countByRiskLevel();

    @Query("SELECT p.status, COUNT(p) FROM Patient p GROUP BY p.status")
    List<Object[]> countByStatus();

    @Query("SELECT COUNT(p) FROM Patient p WHERE p.status = :status")
    long countByStatus(@Param("status") PatientStatus status);

    @Query("SELECT p.district, COUNT(p) FROM Patient p WHERE p.status = 'ACTIVE' GROUP BY p.district")
    List<Object[]> countByDistrict();

    @Query("SELECT COUNT(p) FROM Patient p WHERE p.registrationDate = :date")
    long countRegisteredOnDate(@Param("date") LocalDate date);

    @Query("SELECT COUNT(p) FROM Patient p WHERE p.registrationDate BETWEEN :startDate AND :endDate")
    long countRegisteredBetween(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    // Delivery queries
    long countByDeliveryOutcome(DeliveryOutcome outcome);

    Page<Patient> findByDeliveryOutcome(DeliveryOutcome outcome, Pageable pageable);

    @Query("SELECT COUNT(p) FROM Patient p WHERE p.deliveryOutcome IN ('MOTHER_MORTALITY', 'BOTH_MORTALITY')")
    long countMotherMortality();

    @Query("SELECT COUNT(p) FROM Patient p WHERE p.deliveryOutcome IN ('BABY_MORTALITY', 'BOTH_MORTALITY')")
    long countBabyMortality();

    @Query("SELECT p FROM Patient p WHERE p.deliveryOutcome IN ('MOTHER_MORTALITY', 'BOTH_MORTALITY') ORDER BY p.mortalityDate DESC")
    Page<Patient> findMotherMortalityCases(Pageable pageable);

    @Query("SELECT p FROM Patient p WHERE p.deliveryOutcome IN ('BABY_MORTALITY', 'BOTH_MORTALITY') ORDER BY p.mortalityDate DESC")
    Page<Patient> findBabyMortalityCases(Pageable pageable);

    @Query("SELECT p FROM Patient p WHERE p.deliveryDate BETWEEN :startDate AND :endDate ORDER BY p.deliveryDate DESC")
    Page<Patient> findByDeliveryDateBetween(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable);

    @Query("SELECT p FROM Patient p WHERE p.mortalityDate BETWEEN :startDate AND :endDate ORDER BY p.mortalityDate DESC")
    Page<Patient> findMortalitiesByDateRange(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable);

    @Query("SELECT COUNT(p) FROM Patient p WHERE p.deliveryOutcome = 'SUCCESSFUL' AND p.deliveryDate BETWEEN :startDate AND :endDate")
    long countSuccessfulDeliveriesBetween(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(p) FROM Patient p WHERE p.deliveryOutcome IN ('MOTHER_MORTALITY', 'BOTH_MORTALITY') AND p.mortalityDate BETWEEN :startDate AND :endDate")
    long countMotherMortalityBetween(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(p) FROM Patient p WHERE p.deliveryOutcome IN ('BABY_MORTALITY', 'BOTH_MORTALITY') AND p.mortalityDate BETWEEN :startDate AND :endDate")
    long countBabyMortalityBetween(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
