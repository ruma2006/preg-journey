package com.ammarakshitha.service;

import com.ammarakshitha.dto.BabyDTO;
import com.ammarakshitha.dto.DeliveryCompletionRequest;
import com.ammarakshitha.dto.PatientDTO;
import com.ammarakshitha.dto.PatientRegistrationRequest;
import com.ammarakshitha.dto.PatientSearchRequest;
import com.ammarakshitha.dto.PreviousPregnancyDTO;
import com.ammarakshitha.exception.DuplicateResourceException;
import com.ammarakshitha.exception.ResourceNotFoundException;
import com.ammarakshitha.model.Baby;
import com.ammarakshitha.model.Patient;
import com.ammarakshitha.model.User;
import com.ammarakshitha.model.enums.DeliveryOutcome;
import com.ammarakshitha.model.enums.PatientStatus;
import com.ammarakshitha.model.enums.RiskLevel;
import com.ammarakshitha.repository.PatientRepository;
import com.ammarakshitha.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
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
    private final ObjectMapper objectMapper;

    public Patient registerPatient(PatientRegistrationRequest request, Long registeredByUserId) {
        log.info("Registering new patient: {}", request.getName());

        String aadhaarNumber = request.getAadhaarNumber();
        if (aadhaarNumber != null && aadhaarNumber.isBlank()) {
            aadhaarNumber = null;
        }

        // Check for duplicates - only check against ACTIVE patients
        // This allows re-registration after abortion/delivery (when previous record is DISCHARGED/INACTIVE)
        if (aadhaarNumber != null && patientRepository.existsActivePatientByAadhaarNumber(aadhaarNumber)) {
            throw new DuplicateResourceException("An active patient with Aadhaar " + aadhaarNumber + " already exists. Please update the existing record or mark it as inactive first.");
        }

        // Additional check: If same mobile number and same LMP date, it's likely a duplicate
        if (request.getLmpDate() != null && request.getMobileNumber() != null) {
            if (patientRepository.existsActivePatientByMobileAndLmpDate(request.getMobileNumber(), request.getLmpDate())) {
                throw new DuplicateResourceException("An active patient with the same mobile number and LMP date already exists. This may be a duplicate registration.");
            }
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
                .hadCSectionDelivery(request.getHadCSectionDelivery())
                .hadNormalDelivery(request.getHadNormalDelivery())
                .hadAbortion(request.getHadAbortion())
                .hadOtherPregnancy(request.getHadOtherPregnancy())
                .otherPregnancyDetails(request.getOtherPregnancyDetails())
                .totalKidsBorn(request.getTotalKidsBorn())
                .previousPregnanciesJson(convertPreviousPregnancyToJson(request.getPreviousPregnancies()))
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

    private String convertPreviousPregnancyToJson(List<PreviousPregnancyDTO> previousPregnancies) {
        if (previousPregnancies == null || previousPregnancies.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(previousPregnancies);
        } catch (JsonProcessingException e) {
            log.error("Error converting previous pregnancies to JSON", e);
            return null;
        }
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
        if (updateRequest.getDistrict() != null) {
            patient.setDistrict(updateRequest.getDistrict());
        }
        if (updateRequest.getMandal() != null) {
            patient.setMandal(updateRequest.getMandal());
        }
        if (updateRequest.getVillage() != null) {
            patient.setVillage(updateRequest.getVillage());
        }
        if (updateRequest.getPincode() != null) {
            patient.setPincode(updateRequest.getPincode());
        }
        if (updateRequest.getMobileNumber() != null) {
            patient.setMobileNumber(updateRequest.getMobileNumber());
        }
        if (updateRequest.getAlternateMobile() != null) {
            patient.setAlternateMobile(updateRequest.getAlternateMobile());
        }
        if (updateRequest.getEmail() != null) {
            patient.setEmail(updateRequest.getEmail());
        }
        if (updateRequest.getGravida() != null) {
            patient.setGravida(updateRequest.getGravida());
        }
        if (updateRequest.getPara() != null) {
            patient.setPara(updateRequest.getPara());
        }
        if (updateRequest.getBloodGroup() != null) {
            patient.setBloodGroup(updateRequest.getBloodGroup());
        }
        if (updateRequest.getHasPreviousComplications() != null) {
            patient.setHasPreviousComplications(updateRequest.getHasPreviousComplications());
        }
        if (updateRequest.getPreviousComplicationsDetails() != null) {
            patient.setPreviousComplicationsDetails(updateRequest.getPreviousComplicationsDetails());
        }
        if (updateRequest.getMedicalHistory() != null) {
            patient.setMedicalHistory(updateRequest.getMedicalHistory());
        }
        if (updateRequest.getAllergies() != null) {
            patient.setAllergies(updateRequest.getAllergies());
        }
        // Handle previous pregnancy details
        if (updateRequest.getHadCSectionDelivery() != null) {
            patient.setHadCSectionDelivery(updateRequest.getHadCSectionDelivery());
        }
        if (updateRequest.getHadNormalDelivery() != null) {
            patient.setHadNormalDelivery(updateRequest.getHadNormalDelivery());
        }
        if (updateRequest.getHadAbortion() != null) {
            patient.setHadAbortion(updateRequest.getHadAbortion());
        }
        if (updateRequest.getHadOtherPregnancy() != null) {
            patient.setHadOtherPregnancy(updateRequest.getHadOtherPregnancy());
        }
        if (updateRequest.getOtherPregnancyDetails() != null) {
            patient.setOtherPregnancyDetails(updateRequest.getOtherPregnancyDetails());
        }
        if (updateRequest.getTotalKidsBorn() != null) {
            patient.setTotalKidsBorn(updateRequest.getTotalKidsBorn());
        }
        // Handle previous pregnancies JSON
        if (updateRequest.getPreviousPregnancies() != null) {
            patient.setPreviousPregnanciesJson(convertPreviousPregnancyToJson(updateRequest.getPreviousPregnancies()));
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

        applyDeliveryInfo(patient, request, completedBy);
        applyBabies(patient, request);
        applyMortalityInfo(patient, request);
        updatePatientStatus(patient, request.getDeliveryOutcome());

        log.info("Delivery completed for patient {} by user {}, outcome: {}, number of babies: {}",
                patientId, completedByUserId, request.getDeliveryOutcome(), patient.getNumberOfBabies());

        return patientRepository.save(patient);
    }

    private void applyDeliveryInfo(Patient patient, DeliveryCompletionRequest request, User completedBy) {
        patient.setDeliveryOutcome(request.getDeliveryOutcome());
        patient.setDeliveryType(request.getDeliveryType());
        patient.setDeliveryDate(request.getDeliveryDate());
        patient.setDeliveryCompletedAt(LocalDateTime.now());
        patient.setDeliveryNotes(request.getDeliveryNotes());
        patient.setDeliveryHospital(request.getDeliveryHospital());
        patient.setDeliveryCompletedBy(completedBy);
    }

    private void applyBabies(Patient patient, DeliveryCompletionRequest request) {
        List<BabyDTO> babies = request.getBabies();
        Integer numberOfBabies = request.getNumberOfBabies();
        if (numberOfBabies == null) {
            numberOfBabies = (babies != null && !babies.isEmpty()) ? babies.size() : 1;
        }
        patient.setNumberOfBabies(numberOfBabies);

        patient.getBabies().clear();

        if (babies != null && !babies.isEmpty()) {
            for (int i = 0; i < babies.size(); i++) {
                BabyDTO babyDTO = babies.get(i);
                Integer birthOrder = babyDTO.getBirthOrder() != null ? babyDTO.getBirthOrder() : (i + 1);
                Baby baby = Baby.builder()
                        .patient(patient)
                        .gender(babyDTO.getGender())
                        .weight(babyDTO.getWeight())
                        .birthOrder(birthOrder)
                        .build();
                patient.getBabies().add(baby);
            }

            Baby firstBaby = patient.getBabies().get(0);
            patient.setBabyGender(firstBaby.getGender());
            patient.setBabyWeight(firstBaby.getWeight());
            return;
        }

        // Backward compatibility: if no babies list provided, use legacy fields
        if (request.getBabyGender() != null || request.getBabyWeight() != null) {
            patient.setBabyWeight(request.getBabyWeight());
            patient.setBabyGender(request.getBabyGender());
            patient.setNumberOfBabies(1);

            Baby baby = Baby.builder()
                    .patient(patient)
                    .gender(request.getBabyGender())
                    .weight(request.getBabyWeight())
                    .birthOrder(1)
                    .build();
            patient.getBabies().add(baby);
        }
    }

    private void applyMortalityInfo(Patient patient, DeliveryCompletionRequest request) {
        if (request.getDeliveryOutcome() != DeliveryOutcome.SUCCESSFUL &&
            request.getDeliveryOutcome() != DeliveryOutcome.PENDING) {
            patient.setMortalityDate(request.getMortalityDate());
            patient.setMortalityCause(request.getMortalityCause());
            patient.setMortalityNotes(request.getMortalityNotes());
            return;
        }

        patient.setMortalityDate(null);
        patient.setMortalityCause(null);
        patient.setMortalityNotes(null);
    }

    private void updatePatientStatus(Patient patient, DeliveryOutcome outcome) {
        if (outcome == DeliveryOutcome.SUCCESSFUL || outcome == DeliveryOutcome.BABY_MORTALITY) {
            patient.setStatus(PatientStatus.DISCHARGED);
            return;
        }

        if (outcome == DeliveryOutcome.MOTHER_MORTALITY || outcome == DeliveryOutcome.BOTH_MORTALITY) {
            patient.setStatus(PatientStatus.INACTIVE);
        }
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
