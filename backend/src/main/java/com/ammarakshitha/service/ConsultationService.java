package com.ammarakshitha.service;

import com.ammarakshitha.dto.ConsultationRequest;
import com.ammarakshitha.exception.BusinessException;
import com.ammarakshitha.exception.ResourceNotFoundException;
import com.ammarakshitha.model.Consultation;
import com.ammarakshitha.model.FollowUp;
import com.ammarakshitha.model.Patient;
import com.ammarakshitha.model.User;
import com.ammarakshitha.model.enums.ConsultationStatus;
import com.ammarakshitha.model.enums.ConsultationType;
import com.ammarakshitha.model.enums.FollowUpStatus;
import com.ammarakshitha.model.enums.UserRole;
import com.ammarakshitha.repository.ConsultationRepository;
import com.ammarakshitha.repository.FollowUpRepository;
import com.ammarakshitha.repository.PatientRepository;
import com.ammarakshitha.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final FollowUpRepository followUpRepository;

    public Consultation scheduleConsultation(ConsultationRequest request) {
        log.info("Scheduling consultation for patient: {}", request.getPatientId());

        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        User doctor = userRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        if (doctor.getRole() != UserRole.DOCTOR) {
            throw new BusinessException("Assigned user is not a doctor");
        }
        Consultation consultation = null;
        if(request.getId() != null) {
        	log.info("Updating existing consultation with ID: {}", request.getId());
			// If ID is provided, this is an update operation. Validate existing consultation.
			Optional<Consultation> existingConsultation = consultationRepository.findById(request.getId());
			if(existingConsultation.isEmpty()) {
				throw new ResourceNotFoundException("Consultation not found for update");
			}
			consultation = existingConsultation.get();
			consultation.setPatient(patient);
			consultation.setDoctor(doctor);
			consultation.setType(request.getType());
			consultation.setScheduledAt(request.getScheduledAt());
			consultation.setChiefComplaint(request.getChiefComplaint());
			consultation.setNotes(request.getNotes());
        }
        else {
        	consultation = Consultation.builder()
                    .patient(patient)
                    .doctor(doctor)
                    .type(request.getType())
                    .status(ConsultationStatus.SCHEDULED)
                    .scheduledAt(request.getScheduledAt())
                    .chiefComplaint(request.getChiefComplaint())
                    .notes(request.getNotes())
                    .build();
        }

        // Check for scheduling conflicts
        List<Consultation> existingConsultations = consultationRepository
                .findByDoctorAndScheduledTimeBetween(
                        doctor.getId(),
                        request.getScheduledAt().minusMinutes(30),
                        request.getScheduledAt().plusMinutes(30));

        if (!existingConsultations.isEmpty()) {
            throw new BusinessException("Doctor has a scheduling conflict at the requested time");
        }

        // Generate video room for teleconsultation
        if (request.getType() == ConsultationType.TELECONSULTATION) {
            String roomId = generateVideoRoomId();
            consultation.setVideoRoomId(roomId);
            consultation.setVideoRoomUrl("/video/room/" + roomId);
        }

        Consultation savedConsultation = consultationRepository.save(consultation);
        log.info("Consultation scheduled with ID: {}", savedConsultation.getId());

        return savedConsultation;
    }

    private String generateVideoRoomId() {
        return "AR-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
    }

    public Consultation startConsultation(Long consultationId) {
        Consultation consultation = getConsultationById(consultationId);

        if (consultation.getStatus() != ConsultationStatus.SCHEDULED) {
            throw new BusinessException("Consultation cannot be started. Current status: " + consultation.getStatus());
        }

        consultation.setStatus(ConsultationStatus.IN_PROGRESS);
        consultation.setStartedAt(LocalDateTime.now());

        return consultationRepository.save(consultation);
    }

    public Consultation completeConsultation(Long consultationId, ConsultationRequest request) {
        Consultation consultation = getConsultationById(consultationId);

        if (consultation.getStatus() != ConsultationStatus.IN_PROGRESS) {
            throw new BusinessException("Consultation is not in progress");
        }

        consultation.setStatus(ConsultationStatus.COMPLETED);
        consultation.setEndedAt(LocalDateTime.now());
        consultation.setDiagnosis(request.getDiagnosis());
        consultation.setTreatmentPlan(request.getTreatmentPlan());
        consultation.setPrescriptions(request.getPrescriptions());
        consultation.setAdvice(request.getAdvice());
        consultation.setExaminationFindings(request.getExaminationFindings());
        consultation.setReferralRequired(request.getReferralRequired());
        consultation.setReferralDetails(request.getReferralDetails());
        consultation.setFollowUpRequired(request.getFollowUpRequired());
        consultation.setFollowUpDate(request.getFollowUpDate());
        consultation.setNotes(request.getNotes());

        Consultation savedConsultation = consultationRepository.save(consultation);

        // Create follow-up if required
        if (Boolean.TRUE.equals(request.getFollowUpRequired()) && request.getFollowUpDate() != null) {
            createFollowUpFromConsultation(savedConsultation);
        }

        log.info("Consultation completed: {}", consultationId);
        return savedConsultation;
    }

    private void createFollowUpFromConsultation(Consultation consultation) {
        // Find help desk user to assign follow-up
        List<User> helpDeskUsers = userRepository.findByRoleAndIsActiveTrue(UserRole.HELP_DESK);
        if (helpDeskUsers.isEmpty()) {
            log.warn("No help desk user found to assign follow-up");
            return;
        }

        FollowUp followUp = FollowUp.builder()
                .patient(consultation.getPatient())
                .assignedTo(helpDeskUsers.get(0)) // Assign to first available
                .scheduledDate(consultation.getFollowUpDate().toLocalDate())
                .status(FollowUpStatus.PENDING)
                .triggeredByConsultation(consultation)
                .build();

        followUpRepository.save(followUp);
        log.info("Follow-up created for consultation: {}", consultation.getId());
    }

    public Consultation cancelConsultation(Long consultationId, String reason, String cancelledBy) {
        Consultation consultation = getConsultationById(consultationId);

        if (consultation.getStatus() == ConsultationStatus.COMPLETED) {
            throw new BusinessException("Completed consultation cannot be cancelled");
        }

        consultation.setStatus(ConsultationStatus.CANCELLED);
        consultation.setCancellationReason(reason);
        consultation.setCancelledBy(cancelledBy);

        return consultationRepository.save(consultation);
    }

    @Transactional(readOnly = true)
    public Consultation getConsultationById(Long id) {
        return consultationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found"));
    }

    @Transactional(readOnly = true)
    public List<Consultation> getConsultationsByPatientId(Long patientId) {
        return consultationRepository.findByPatientId(patientId);
    }

    @Transactional(readOnly = true)
    public Page<Consultation> getConsultationsByDoctorId(Long doctorId, Pageable pageable) {
        return consultationRepository.findByDoctorId(doctorId, pageable);
    }

    @Transactional(readOnly = true)
    public List<Consultation> getTodaysConsultationsForDoctor(Long doctorId) {
        return consultationRepository.findTodaysConsultationsForDoctor(doctorId);
    }

    @Transactional(readOnly = true)
    public List<Consultation> getUpcomingConsultationsForDoctor(Long doctorId) {
        return consultationRepository.findUpcomingConsultationsForDoctor(doctorId, LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public List<Consultation> getUpcomingConsultationsForPatient(Long patientId) {
        return consultationRepository.findUpcomingConsultationsForPatient(patientId, LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public Page<Consultation> getUpcomingConsultations(Pageable pageable) {
        return consultationRepository.findUpcomingConsultations(LocalDateTime.now(), pageable);
    }

    @Transactional(readOnly = true)
    public long countTodaysConsultations() {
        return consultationRepository.countTodaysConsultations();
    }
}
