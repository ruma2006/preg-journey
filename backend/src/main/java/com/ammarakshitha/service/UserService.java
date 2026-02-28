package com.ammarakshitha.service;

import com.ammarakshitha.dto.UserDTO;
import com.ammarakshitha.dto.UserRegistrationRequest;
import com.ammarakshitha.exception.BusinessException;
import com.ammarakshitha.exception.DuplicateResourceException;
import com.ammarakshitha.exception.ResourceNotFoundException;
import com.ammarakshitha.model.User;
import com.ammarakshitha.model.enums.UserRole;
import com.ammarakshitha.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.security.SecureRandom;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final StorageService storageService;

    public User createUser(UserRegistrationRequest request) {
        log.info("Creating new user: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }

        if (userRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateResourceException("Phone number already registered: " + request.getPhone());
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .department(request.getDepartment())
                .designation(request.getDesignation())
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);
        log.info("User created successfully: {}", savedUser.getId());

        return savedUser;
    }

    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    @Transactional(readOnly = true)
    public Page<User> getAllActiveUsers(Pageable pageable) {
        return userRepository.findByIsActiveTrue(pageable);
    }

    @Transactional(readOnly = true)
    public List<User> getUsersByRole(UserRole role) {
        return userRepository.findByRoleAndIsActiveTrue(role);
    }

    @Transactional(readOnly = true)
    public List<User> getActiveDoctors() {
        return userRepository.findActiveDoctors(UserRole.DOCTOR);
    }

    @Transactional(readOnly = true)
    public List<User> getHelpDeskUsers() {
        return userRepository.findByRoleAndIsActiveTrue(UserRole.HELP_DESK);
    }

    public User updateUser(Long id, UserDTO updateRequest) {
        User user = getUserById(id);

        if (updateRequest.getName() != null) {
            user.setName(updateRequest.getName());
        }
        if (updateRequest.getPhone() != null) {
            // Check if phone is taken by another user
            userRepository.findByPhone(updateRequest.getPhone())
                    .ifPresent(existingUser -> {
                        if (!existingUser.getId().equals(id)) {
                            throw new DuplicateResourceException("Phone number already in use");
                        }
                    });
            user.setPhone(updateRequest.getPhone());
        }
        if (updateRequest.getDepartment() != null) {
            user.setDepartment(updateRequest.getDepartment());
        }
        if (updateRequest.getDesignation() != null) {
            user.setDesignation(updateRequest.getDesignation());
        }

        return userRepository.save(user);
    }

    public User updateUserRole(Long id, UserRole newRole) {
        User user = getUserById(id);
        user.setRole(newRole);
        return userRepository.save(user);
    }

    public void deactivateUser(Long id) {
        User user = getUserById(id);
        user.setIsActive(false);
        userRepository.save(user);
        log.info("User deactivated: {}", id);
    }

    public void activateUser(Long id) {
        User user = getUserById(id);
        user.setIsActive(true);
        userRepository.save(user);
        log.info("User activated: {}", id);
    }

    public void changePassword(Long id, String newPassword) {
        User user = getUserById(id);
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("Password changed for user: {}", id);
    }

    public void changePasswordWithValidation(Long id, String currentPassword, String newPassword) {
        User user = getUserById(id);
        
        // Validate current password
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new BusinessException("Current password is incorrect");
        }
        
        // Update to new password
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("Password changed successfully for user: {}", id);
    }

    @Transactional(readOnly = true)
    public long countByRole(UserRole role) {
        return userRepository.countByRoleAndActive(role);
    }

    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public String resetPassword(Long id) {
        User user = getUserById(id);
        String temporaryPassword = generateTemporaryPassword();
        user.setPasswordHash(passwordEncoder.encode(temporaryPassword));
        userRepository.save(user);
        log.info("Password reset for user: {} ({})", user.getName(), user.getEmail());
        return temporaryPassword;
    }

    private String generateTemporaryPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%";
        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder();
        for (int i = 0; i < 12; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }
        return password.toString();
    }

    public void deleteUser(Long id) {
        User user = getUserById(id);
        log.info("Deleting user: {} ({})", user.getName(), user.getEmail());
        userRepository.delete(user);
        log.info("User deleted successfully: {}", id);
    }

    public User uploadProfilePhoto(Long id, MultipartFile file) {
        User user = getUserById(id);
        
        // Delete old photo if exists
        if (user.getProfileImageUrl() != null) {
            storageService.deleteFile(user.getProfileImageUrl());
        }
        
        // Upload new photo
        String photoUrl = storageService.uploadFile(file, "profile-photos");
        user.setProfileImageUrl(photoUrl);
        
        User updatedUser = userRepository.save(user);
        log.info("Profile photo uploaded for user: {}", id);
        return updatedUser;
    }
}
