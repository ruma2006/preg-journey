package com.ammarakshitha.service;

import com.ammarakshitha.model.HealthCheck;
import com.ammarakshitha.model.Patient;
import com.ammarakshitha.model.enums.RiskLevel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class RiskAssessmentService {

    @Value("${app.risk-assessment.severe-threshold:7}")
    private int severeThreshold;

    @Value("${app.risk-assessment.moderate-threshold:4}")
    private int moderateThreshold;

    public RiskAssessmentResult assessRisk(HealthCheck healthCheck, Patient patient) {
        int totalScore = 0;
        List<String> riskFactors = new ArrayList<>();

        // 1. Blood Pressure Assessment
        if (healthCheck.getBpSystolic() != null && healthCheck.getBpDiastolic() != null) {
            int bpScore = assessBloodPressure(healthCheck.getBpSystolic(), healthCheck.getBpDiastolic());
            totalScore += bpScore;
            if (bpScore >= 3) {
                riskFactors.add("Severe Hypertension (BP: " + healthCheck.getBpSystolic() + "/" + healthCheck.getBpDiastolic() + ")");
            } else if (bpScore >= 2) {
                riskFactors.add("High Blood Pressure (BP: " + healthCheck.getBpSystolic() + "/" + healthCheck.getBpDiastolic() + ")");
            } else if (bpScore >= 1) {
                riskFactors.add("Elevated Blood Pressure");
            }
        }

        // 2. Hemoglobin Assessment (Anemia)
        if (healthCheck.getHemoglobin() != null) {
            int hbScore = assessHemoglobin(healthCheck.getHemoglobin());
            totalScore += hbScore;
            if (hbScore >= 4) {
                riskFactors.add("Severe Anemia (Hb: " + healthCheck.getHemoglobin() + " g/dL)");
            } else if (hbScore >= 2) {
                riskFactors.add("Moderate Anemia (Hb: " + healthCheck.getHemoglobin() + " g/dL)");
            } else if (hbScore >= 1) {
                riskFactors.add("Mild Anemia");
            }
        }

        // 3. Blood Sugar Assessment
        int sugarScore = assessBloodSugar(healthCheck);
        totalScore += sugarScore;
        if (sugarScore >= 3) {
            riskFactors.add("High Blood Sugar - Possible Gestational Diabetes");
        } else if (sugarScore >= 1) {
            riskFactors.add("Elevated Blood Sugar");
        }

        // 4. Age Factor
        if (patient.getAge() != null) {
            int ageScore = assessAge(patient.getAge());
            totalScore += ageScore;
            if (ageScore > 0) {
                riskFactors.add("High Risk Age Group (" + patient.getAge() + " years)");
            }
        }

        // 5. Previous Complications
        if (Boolean.TRUE.equals(patient.getHasPreviousComplications())) {
            totalScore += 3;
            riskFactors.add("History of Previous Complications");
        }

        // 6. Danger Signs Assessment
        totalScore += assessDangerSigns(healthCheck, riskFactors);

        // 7. SpO2 Assessment
        if (healthCheck.getSpo2() != null && healthCheck.getSpo2() < 95) {
            totalScore += 2;
            riskFactors.add("Low Oxygen Saturation (SpO2: " + healthCheck.getSpo2() + "%)");
        }

        // 8. Fetal Assessment
        if (healthCheck.getFetalHeartRate() != null) {
            if (healthCheck.getFetalHeartRate() < 110 || healthCheck.getFetalHeartRate() > 160) {
                totalScore += 3;
                riskFactors.add("Abnormal Fetal Heart Rate (" + healthCheck.getFetalHeartRate() + " bpm)");
            }
        }

        if (healthCheck.getFetalMovement() != null && !healthCheck.getFetalMovement()) {
            totalScore += 3;
            riskFactors.add("Reduced Fetal Movement Reported");
        }

        // Determine risk level
        RiskLevel riskLevel = calculateRiskLevel(totalScore);

        log.info("Risk assessment for patient {}: Score={}, Level={}, Factors={}",
                patient.getMotherId(), totalScore, riskLevel, riskFactors);

        return new RiskAssessmentResult(totalScore, riskLevel, riskFactors);
    }

    private int assessBloodPressure(int systolic, int diastolic) {
        // Severe hypertension
        if (systolic >= 160 || diastolic >= 110) {
            return 4;
        }
        // Moderate hypertension
        if (systolic >= 140 || diastolic >= 90) {
            return 3;
        }
        // Pre-hypertension
        if (systolic >= 130 || diastolic >= 85) {
            return 1;
        }
        // Hypotension (also concerning)
        if (systolic < 90 || diastolic < 60) {
            return 2;
        }
        return 0;
    }

    private int assessHemoglobin(BigDecimal hemoglobin) {
        double hb = hemoglobin.doubleValue();
        // Severe anemia
        if (hb < 7) {
            return 4;
        }
        // Moderate anemia
        if (hb < 9) {
            return 2;
        }
        // Mild anemia
        if (hb < 11) {
            return 1;
        }
        return 0;
    }

    private int assessBloodSugar(HealthCheck healthCheck) {
        int score = 0;

        if (healthCheck.getBloodSugarFasting() != null) {
            double fasting = healthCheck.getBloodSugarFasting().doubleValue();
            if (fasting >= 126) {
                score = Math.max(score, 3);
            } else if (fasting >= 100) {
                score = Math.max(score, 1);
            }
        }

        if (healthCheck.getBloodSugarRandom() != null) {
            double random = healthCheck.getBloodSugarRandom().doubleValue();
            if (random >= 200) {
                score = Math.max(score, 3);
            } else if (random >= 140) {
                score = Math.max(score, 1);
            }
        }

        if (healthCheck.getBloodSugarPP() != null) {
            double pp = healthCheck.getBloodSugarPP().doubleValue();
            if (pp >= 180) {
                score = Math.max(score, 3);
            } else if (pp >= 140) {
                score = Math.max(score, 1);
            }
        }

        return score;
    }

    private int assessAge(int age) {
        // High risk if too young or advanced maternal age
        if (age < 18) {
            return 2;
        }
        if (age > 35) {
            return 2;
        }
        if (age > 40) {
            return 3;
        }
        return 0;
    }

    private int assessDangerSigns(HealthCheck healthCheck, List<String> riskFactors) {
        int score = 0;

        if (Boolean.TRUE.equals(healthCheck.getBleedingReported())) {
            score += 4;
            riskFactors.add("Vaginal Bleeding Reported");
        }

        if (Boolean.TRUE.equals(healthCheck.getSwellingObserved())) {
            score += 2;
            riskFactors.add("Swelling/Edema Observed");
        }

        if (Boolean.TRUE.equals(healthCheck.getHeadacheReported())) {
            score += 2;
            riskFactors.add("Severe Headache Reported");
        }

        if (Boolean.TRUE.equals(healthCheck.getBlurredVisionReported())) {
            score += 3;
            riskFactors.add("Blurred Vision Reported");
        }

        if (Boolean.TRUE.equals(healthCheck.getAbdominalPainReported())) {
            score += 3;
            riskFactors.add("Abdominal Pain Reported");
        }

        // Check urine tests
        if (healthCheck.getUrineAlbumin() != null &&
            (healthCheck.getUrineAlbumin().equals("++") || healthCheck.getUrineAlbumin().equals("+++"))) {
            score += 3;
            riskFactors.add("Protein in Urine (Albuminuria: " + healthCheck.getUrineAlbumin() + ")");
        }

        return score;
    }

    private RiskLevel calculateRiskLevel(int score) {
        if (score >= severeThreshold) {
            return RiskLevel.RED;
        }
        if (score >= moderateThreshold) {
            return RiskLevel.YELLOW;
        }
        return RiskLevel.GREEN;
    }

    public record RiskAssessmentResult(int score, RiskLevel riskLevel, List<String> riskFactors) {}
}
