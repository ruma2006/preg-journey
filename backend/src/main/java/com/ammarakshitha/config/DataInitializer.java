package com.ammarakshitha.config;

import com.ammarakshitha.model.User;
import com.ammarakshitha.model.enums.UserRole;
import com.ammarakshitha.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {

    private final PasswordEncoder passwordEncoder;

    @Bean
    @Profile({"dev", "prod"})
    CommandLineRunner initDatabase(UserRepository userRepository) {
        return args -> {
            // Check if admin already exists
            if (userRepository.findByEmail("admin@ammarakshitha.gov.in").isEmpty()) {
                log.info("Initializing default users...");

                // Create Admin User
                User admin = User.builder()
                        .name("System Administrator")
                        .email("admin@ammarakshitha.gov.in")
                        .phone("9999999999")
                        .passwordHash(passwordEncoder.encode("Admin@123"))
                        .role(UserRole.ADMIN)
                        .department("Administration")
                        .designation("District Collector")
                        .isActive(true)
                        .build();
                userRepository.save(admin);
                log.info("Created admin user: admin@ammarakshitha.gov.in / Admin@123");

                // Create Medical Officer
                User medicalOfficer = User.builder()
                        .name("Dr. Rajesh Kumar")
                        .email("mo@ammarakshitha.gov.in")
                        .phone("9888888888")
                        .passwordHash(passwordEncoder.encode("Doctor@123"))
                        .role(UserRole.MEDICAL_OFFICER)
                        .department("Medical")
                        .designation("Chief Medical Officer")
                        .isActive(true)
                        .build();
                userRepository.save(medicalOfficer);
                log.info("Created medical officer: mo@ammarakshitha.gov.in / Doctor@123");

                // Create MCH Officer
                User mchOfficer = User.builder()
                        .name("Dr. Lakshmi Devi")
                        .email("mch@ammarakshitha.gov.in")
                        .phone("9777777777")
                        .passwordHash(passwordEncoder.encode("Mch@123"))
                        .role(UserRole.MCH_OFFICER)
                        .department("MCH")
                        .designation("MCH Programme Officer")
                        .isActive(true)
                        .build();
                userRepository.save(mchOfficer);
                log.info("Created MCH officer: mch@ammarakshitha.gov.in / Mch@123");

                // Create Doctor
                User doctor = User.builder()
                        .name("Dr. Suresh Reddy")
                        .email("doctor@ammarakshitha.gov.in")
                        .phone("9666666666")
                        .passwordHash(passwordEncoder.encode("Doctor@123"))
                        .role(UserRole.DOCTOR)
                        .department("Gynecology")
                        .designation("Senior Doctor")
                        .isActive(true)
                        .build();
                userRepository.save(doctor);
                log.info("Created doctor: doctor@ammarakshitha.gov.in / Doctor@123");

                // Create Help Desk User
                User helpDesk = User.builder()
                        .name("Ramesh Babu")
                        .email("helpdesk@ammarakshitha.gov.in")
                        .phone("9555555555")
                        .passwordHash(passwordEncoder.encode("Help@123"))
                        .role(UserRole.HELP_DESK)
                        .department("Help Desk")
                        .designation("Help Desk Executive")
                        .isActive(true)
                        .build();
                userRepository.save(helpDesk);
                log.info("Created help desk user: helpdesk@ammarakshitha.gov.in / Help@123");

                log.info("Default users initialized successfully!");
            } else {
                log.info("Users already exist, skipping initialization");
            }
        };
    }
}
