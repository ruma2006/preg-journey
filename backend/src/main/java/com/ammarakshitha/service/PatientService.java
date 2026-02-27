package com.ammarakshitha.service;

import com.ammarakshitha.dto.DeliveryCompletionRequest;
import com.ammarakshitha.dto.PatientDTO;
import com.ammarakshitha.dto.PatientRegistrationRequest;
import com.ammarakshitha.dto.PatientSearchRequest;
import com.ammarakshitha.exception.DuplicateResourceException;
import com.ammarakshitha.exception.ResourceNotFoundException;
import com.ammarakshitha.model.Patient;
import com.ammarakshitha.model.User;
import com.ammarakshitha.model.enums.DeliveryOutcome;
import com.ammarakshitha.model.enums.PatientStatus;
import com.ammarakshitha.model.enums.RiskLevel;
import com.ammarakshitha.repository.PatientRepository;
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
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PatientService {

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public Patient registerPatient(PatientRegistrationRequest request, Long registeredByUserId) {
        log.info("Registering new patient: {}", request.getName());

        String aadhaarNumber = request.getAadhaarNumber();
        if (aadhaarNumber != null && aadhaarNumber.isBlank()) {
            aadhaarNumber = null;
        }

        // Check for duplicates
        if (aadhaarNumber != null && patientRepository.existsByAadhaarNumber(aadhaarNumber)) {
            throw new DuplicateResourceException("Patient with Aadhaar " + aadhaarNumber + " already exists");
        }

        // Generate unique Mother ID
        String motherId = generateMotherId(request.getDistrict());

        // Check if generated mother ID exists (shouldn't happen, but safety check)
        while (patientRepository.existsByMotherId(motherId)) {
            motherId = generateMotherId(request.getDistrict());
        }

        User registeredBy = userRepository.findById(registeredByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Patient patient = Patient.builder()
                .name(request.getName())
                .age(request.getAge())
                .husbandName(request.getHusbandName())
                .residence(request.getResidence())
                .district(request.getDistrict())
                .mandal(request.getMandal())
                .village(request.getVillage())
                .pincode(request.getPincode())
                .motherId(motherId)
                .aadhaarNumber(aadhaarNumber)
                .mobileNumber(request.getMobileNumber())
                .alternateMobile(request.getAlternateMobile())
                .dateOfBirth(request.getDateOfBirth())
                .lmpDate(request.getLmpDate())
                .eddDate(calculateEDD(request.getLmpDate()))
                .gravida(request.getGravida())
                .para(request.getPara())
                .bloodGroup(request.getBloodGroup())
                .hasPreviousComplications(request.getHasPreviousComplications())
                .previousComplicationsDetails(request.getPreviousComplicationsDetails())
                .medicalHistory(request.getMedicalHistory())
                .allergies(request.getAllergies())
                .registrationDate(LocalDate.now())
                .registeredBy(registeredBy)
                .status(PatientStatus.ACTIVE)
                .currentRiskLevel(RiskLevel.GREEN)
                .build();

        Patient savedPatient = patientRepository.save(patient);
        log.info("Patient registered successfully with Mother ID: {}", savedPatient.getMotherId());

        return savedPatient;
    }

    private String generateMotherId(String district) {
        String districtCode = (district != null && district.length() >= 3)
                ? district.substring(0, 3).toUpperCase()
                : "NRL"; // Nirmal default
        String uniquePart = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return "AR-" + districtCode + "-" + uniquePart;
    }

    private LocalDate calculateEDD(LocalDate lmpDate) {
        if (lmpDate == null) {
            return null;
        }
        // Naegele's rule: EDD = LMP + 280 days (40 weeks)
        return lmpDate.plusDays(280);
    }

    @Transactional(readOnly = true)
    public Patient getPatientById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public Patient getPatientByMotherId(String motherId) {
        return patientRepository.findByMotherId(motherId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with Mother ID: " + motherId));
    }

    @Transactional(readOnly = true)
    public Patient getPatientByAadhaar(String aadhaarNumber) {
        return patientRepository.findByAadhaarNumber(aadhaarNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with Aadhaar: " + aadhaarNumber));
    }

    @Transactional(readOnly = true)
    public Page<Patient> getAllPatients(Pageable pageable) {
        return patientRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Page<Patient> getPatientsByStatus(PatientStatus status, Pageable pageable) {
        return patientRepository.findByStatus(status, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Patient> getPatientsByRiskLevel(RiskLevel riskLevel, Pageable pageable) {
        return patientRepository.findByCurrentRiskLevel(riskLevel, pageable);
    }

    @Transactional(readOnly = true)
    public List<Patient> getHighRiskPatients() {
        return patientRepository.findHighRiskPatients();
    }

    @Transactional(readOnly = true)
    public Page<Patient> getAtRiskPatients(Pageable pageable) {
        return patientRepository.findAtRiskPatients(pageable);
    }

    @Transactional(readOnly = true)
    public Page<Patient> searchPatients(String search, Pageable pageable) {
        return patientRepository.searchPatients(search, pageable);
    }

    public Patient updatePatient(Long id, PatientDTO updateRequest) {
        Patient patient = getPatientById(id);

        if (updateRequest.getName() != null) {
            patient.setName(updateRequest.getName());
        }
        if (updateRequest.getAge() != null) {
            patient.setAge(updateRequest.getAge());
        }
        if (updateRequest.getHusbandName() != null) {
            patient.setHusbandName(updateRequest.getHusbandName());
        }
        if (updateRequest.getResidence() != null) {
            patient.setResidence(updateRequest.getResidence());
        }
        if (updateRequest.getMobileNumber() != null) {
            patient.setMobileNumber(updateRequest.getMobileNumber());
        }
        if (updateRequest.getAlternateMobile() != null) {
            patient.setAlternateMobile(updateRequest.getAlternateMobile());
        }
        if (updateRequest.getMedicalHistory() != null) {
            patient.setMedicalHistory(updateRequest.getMedicalHistory());
        }
        if (updateRequest.getAllergies() != null) {
            patient.setAllergies(updateRequest.getAllergies());
        }
        // Handle LMP date update and recalculate EDD
        if (updateRequest.getLmpDate() != null) {
            patient.setLmpDate(updateRequest.getLmpDate());
            patient.setEddDate(calculateEDD(updateRequest.getLmpDate()));
            log.info("Updated LMP date for patient {} to {}, new EDD: {}",
                    id, updateRequest.getLmpDate(), patient.getEddDate());
        }

        return patientRepository.save(patient);
    }

    public Patient updatePatientStatus(Long id, PatientStatus status) {
        Patient patient = getPatientById(id);
        patient.setStatus(status);
        return patientRepository.save(patient);
    }

    public void updatePatientRisk(Long patientId, int riskScore, RiskLevel riskLevel) {
        Patient patient = getPatientById(patientId);
        patient.setCurrentRiskScore(riskScore);
        patient.setCurrentRiskLevel(riskLevel);
        patientRepository.save(patient);
    }

    public void deletePatient(Long id) {
        Patient patient = getPatientById(id);
        log.info("Deleting patient: {} (ID: {})", patient.getName(), id);
        patientRepository.delete(patient);
        log.info("Patient deleted successfully: {}", id);
    }

    @Transactional(readOnly = true)
    public List<Patient> getPatientsWithUpcomingEDD(int daysAhead) {
        LocalDate today = LocalDate.now();
        LocalDate endDate = today.plusDays(daysAhead);
        return patientRepository.findByEddDateBetween(today, endDate);
    }

    @Transactional(readOnly = true)
    public List<Patient> getOverdueDeliveries() {
        return patientRepository.findOverdueDeliveries(LocalDate.now());
    }

    // Statistics methods
    @Transactional(readOnly = true)
    public List<Object[]> getRiskLevelDistribution() {
        return patientRepository.countByRiskLevel();
    }

    @Transactional(readOnly = true)
    public List<Object[]> getStatusDistribution() {
        return patientRepository.countByStatus();
    }

    @Transactional(readOnly = true)
    public List<Object[]> getDistrictDistribution() {
        return patientRepository.countByDistrict();
    }

    @Transactional(readOnly = true)
    public long countRegisteredToday() {
        return patientRepository.countRegisteredOnDate(LocalDate.now());
    }

    @Transactional(readOnly = true)
    public long countRegisteredThisMonth() {
        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        return patientRepository.countRegisteredBetween(startOfMonth, LocalDate.now());
    }

    // Delivery Management
    public Patient completeDelivery(Long patientId, DeliveryCompletionRequest request, Long completedByUserId) {
        Patient patient = getPatientById(patientId);
        User completedBy = userRepository.findById(completedByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Set delivery information
        patient.setDeliveryOutcome(request.getDeliveryOutcome());
        patient.setDeliveryType(request.getDeliveryType());
        patient.setDeliveryDate(request.getDeliveryDate());
        patient.setDeliveryCompletedAt(LocalDateTime.now());
        patient.setDeliveryNotes(request.getDeliveryNotes());
        patient.setBabyWeight(request.getBabyWeight());
        patient.setBabyGender(request.getBabyGender());
        patient.setDeliveryHospital(request.getDeliveryHospital());
        patient.setDeliveryCompletedBy(completedBy);

        // Set mortality information if applicable
        if (request.getDeliveryOutcome() != DeliveryOutcome.SUCCESSFUL &&
            request.getDeliveryOutcome() != DeliveryOutcome.PENDING) {
            patient.setMortalityDate(request.getMortalityDate());
            patient.setMortalityCause(request.getMortalityCause());
            patient.setMortalityNotes(request.getMortalityNotes());
        }

        // Update patient status based on outcome
        if (request.getDeliveryOutcome() == DeliveryOutcome.SUCCESSFUL) {
            patient.setStatus(PatientStatus.DISCHARGED);
        } else if (request.getDeliveryOutcome() == DeliveryOutcome.BABY_MORTALITY) {
            // Mother is alive but baby passed - mother's care is complete
            patient.setStatus(PatientStatus.DISCHARGED);
        } else if (request.getDeliveryOutcome() == DeliveryOutcome.MOTHER_MORTALITY ||
                   request.getDeliveryOutcome() == DeliveryOutcome.BOTH_MORTALITY) {
            patient.setStatus(PatientStatus.INACTIVE);
        }

        log.info("Delivery completed for patient {} by user {}, outcome: {}",
                patientId, completedByUserId, request.getDeliveryOutcome());

        return patientRepository.save(patient);
    }

    // Delivery Statistics
    @Transactional(readOnly = true)
    public long countSuccessfulDeliveries() {
        return patientRepository.countByDeliveryOutcome(DeliveryOutcome.SUCCESSFUL);
    }

    @Transactional(readOnly = true)
    public long countMotherMortality() {
        return patientRepository.countMotherMortality();
    }

    @Transactional(readOnly = true)
    public long countBabyMortality() {
        return patientRepository.countBabyMortality();
    }

    @Transactional(readOnly = true)
    public Page<Patient> getSuccessfulDeliveries(Pageable pageable) {
        return patientRepository.findByDeliveryOutcome(DeliveryOutcome.SUCCESSFUL, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Patient> getMotherMortalityCases(Pageable pageable) {
        return patientRepository.findMotherMortalityCases(pageable);
    }

    @Transactional(readOnly = true)
    public Page<Patient> getBabyMortalityCases(Pageable pageable) {
        return patientRepository.findBabyMortalityCases(pageable);
    }

    @Transactional(readOnly = true)
    public Page<Patient> getDeliveriesByDateRange(LocalDate startDate, LocalDate endDate, Pageable pageable) {
        return patientRepository.findByDeliveryDateBetween(startDate, endDate, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Patient> getMortalitiesByDateRange(LocalDate startDate, LocalDate endDate, Pageable pageable) {
        return patientRepository.findMortalitiesByDateRange(startDate, endDate, pageable);
    }

    @Transactional(readOnly = true)
    public long countSuccessfulDeliveriesBetween(LocalDate startDate, LocalDate endDate) {
        return patientRepository.countSuccessfulDeliveriesBetween(startDate, endDate);
    }

    @Transactional(readOnly = true)
    public long countMotherMortalityBetween(LocalDate startDate, LocalDate endDate) {
        return patientRepository.countMotherMortalityBetween(startDate, endDate);
    }

    @Transactional(readOnly = true)
    public long countBabyMortalityBetween(LocalDate startDate, LocalDate endDate) {
        return patientRepository.countBabyMortalityBetween(startDate, endDate);
    }
}
