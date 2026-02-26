package com.ammarakshitha.service;

import com.ammarakshitha.dto.DashboardStats;
import com.ammarakshitha.model.enums.DeliveryOutcome;
import com.ammarakshitha.model.enums.RiskLevel;
import com.ammarakshitha.model.enums.UserRole;
import com.ammarakshitha.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class DashboardService {

    private final PatientRepository patientRepository;
    private final HealthCheckRepository healthCheckRepository;
    private final ConsultationRepository consultationRepository;
    private final FollowUpRepository followUpRepository;
    private final RiskAlertRepository riskAlertRepository;
    private final UserRepository userRepository;

    public DashboardStats getOverviewStats() {
        DashboardStats stats = new DashboardStats();

        // Patient statistics
        stats.setTotalPatients(patientRepository.count());
        stats.setActivePatients(patientRepository.countByStatus(com.ammarakshitha.model.enums.PatientStatus.ACTIVE));
        stats.setHighRiskPatients(patientRepository.findByCurrentRiskLevel(RiskLevel.RED).size());
        stats.setModerateRiskPatients(patientRepository.findByCurrentRiskLevel(RiskLevel.YELLOW).size());
        stats.setStablePatients(patientRepository.findByCurrentRiskLevel(RiskLevel.GREEN).size());
        stats.setNewRegistrationsToday(patientRepository.countRegisteredOnDate(LocalDate.now()));

        // Health check statistics
        stats.setHealthChecksToday(healthCheckRepository.countOnDate(LocalDate.now()));
        LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
        stats.setHealthChecksThisMonth(healthCheckRepository.countBetweenDates(startOfMonth, LocalDate.now()));

        // Consultation statistics
        stats.setConsultationsToday(consultationRepository.countTodaysConsultations());

        // Follow-up statistics
        stats.setFollowUpsToday(followUpRepository.countForDate(LocalDate.now()));
        stats.setFollowUpsCompleted(followUpRepository.countCompletedForDate(LocalDate.now()));
        stats.setOverdueFollowUps((long) followUpRepository.findOverdue(LocalDate.now()).size());

        // Alert statistics
        stats.setUnacknowledgedAlerts(riskAlertRepository.countUnacknowledged());
        stats.setCriticalAlerts(riskAlertRepository.countCriticalUnacknowledged());
        stats.setTodaysAlerts(riskAlertRepository.countTodaysAlerts());

        // Delivery statistics
        stats.setSuccessfulDeliveries(patientRepository.countByDeliveryOutcome(DeliveryOutcome.SUCCESSFUL));
        stats.setMotherMortality(patientRepository.countMotherMortality());
        stats.setBabyMortality(patientRepository.countBabyMortality());

        // Staff statistics
        stats.setActiveDoctors(userRepository.countByRoleAndActive(UserRole.DOCTOR));
        stats.setActiveHelpDeskStaff(userRepository.countByRoleAndActive(UserRole.HELP_DESK));

        return stats;
    }

    public Map<String, Object> getRiskDistribution() {
        Map<String, Object> distribution = new HashMap<>();

        List<Object[]> riskCounts = patientRepository.countByRiskLevel();
        for (Object[] row : riskCounts) {
            distribution.put(row[0].toString(), row[1]);
        }

        return distribution;
    }

    public Map<String, Object> getDistrictWiseStats() {
        Map<String, Object> districtStats = new HashMap<>();

        List<Object[]> districtCounts = patientRepository.countByDistrict();
        for (Object[] row : districtCounts) {
            String district = row[0] != null ? row[0].toString() : "Unknown";
            districtStats.put(district, row[1]);
        }

        return districtStats;
    }

    public Map<String, Object> getAlertsSummary() {
        Map<String, Object> alertSummary = new HashMap<>();

        alertSummary.put("total_unacknowledged", riskAlertRepository.countUnacknowledged());
        alertSummary.put("critical", riskAlertRepository.countCriticalUnacknowledged());
        alertSummary.put("today", riskAlertRepository.countTodaysAlerts());

        List<Object[]> severityCounts = riskAlertRepository.countUnacknowledgedBySeverity();
        Map<String, Long> bySeverity = new HashMap<>();
        for (Object[] row : severityCounts) {
            bySeverity.put(row[0].toString(), (Long) row[1]);
        }
        alertSummary.put("by_severity", bySeverity);

        return alertSummary;
    }

    public Map<String, Object> getConsultationsSummary() {
        Map<String, Object> summary = new HashMap<>();

        summary.put("today", consultationRepository.countTodaysConsultations());

        List<Object[]> statusCounts = consultationRepository.countByStatus();
        Map<String, Long> byStatus = new HashMap<>();
        for (Object[] row : statusCounts) {
            byStatus.put(row[0].toString(), (Long) row[1]);
        }
        summary.put("by_status", byStatus);

        List<Object[]> typeCounts = consultationRepository.countCompletedByType();
        Map<String, Long> byType = new HashMap<>();
        for (Object[] row : typeCounts) {
            byType.put(row[0].toString(), (Long) row[1]);
        }
        summary.put("completed_by_type", byType);

        return summary;
    }

    public Map<String, Object> getFollowUpsSummary() {
        Map<String, Object> summary = new HashMap<>();

        LocalDate today = LocalDate.now();
        summary.put("scheduled_today", followUpRepository.countForDate(today));
        summary.put("completed_today", followUpRepository.countCompletedForDate(today));
        summary.put("overdue", followUpRepository.findOverdue(today).size());
        summary.put("requiring_doctor_consultation", followUpRepository.findRequiringDoctorConsultation().size());

        List<Object[]> statusCounts = followUpRepository.countByStatus();
        Map<String, Long> byStatus = new HashMap<>();
        for (Object[] row : statusCounts) {
            byStatus.put(row[0].toString(), (Long) row[1]);
        }
        summary.put("by_status", byStatus);

        return summary;
    }

    public DashboardStats getDoctorDashboardStats(Long doctorId) {
        DashboardStats stats = new DashboardStats();

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfDay = now.toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        stats.setConsultationsToday((long) consultationRepository
                .findByDoctorAndScheduledTimeBetween(doctorId, startOfDay, endOfDay).size());
        stats.setUpcomingConsultations((long) consultationRepository
                .findUpcomingConsultationsForDoctor(doctorId, now).size());

        // High risk patients needing attention
        stats.setHighRiskPatients(patientRepository.findByCurrentRiskLevel(RiskLevel.RED).size());

        return stats;
    }

    public DashboardStats getHelpDeskDashboardStats(Long userId) {
        DashboardStats stats = new DashboardStats();

        LocalDate today = LocalDate.now();

        stats.setFollowUpsToday(followUpRepository.countPendingTodayForUser(userId));
        stats.setOverdueFollowUps((long) followUpRepository.findOverdueForUser(userId, today).size());
        stats.setNewRegistrationsToday(patientRepository.countRegisteredOnDate(today));

        return stats;
    }
}
