package com.ammarakshitha.controller;

import com.ammarakshitha.dto.ApiResponse;
import com.ammarakshitha.dto.ChangePasswordRequest;
import com.ammarakshitha.dto.UserDTO;
import com.ammarakshitha.dto.UserRegistrationRequest;
import com.ammarakshitha.model.User;
import com.ammarakshitha.model.enums.UserRole;
import com.ammarakshitha.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/v1/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "APIs for user management")
public class UserController {

    private final UserService userService;

    @PostMapping
    @Operation(summary = "Create a new user")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> createUser(
            @Valid @RequestBody UserRegistrationRequest request) {
        User user = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(user, "User created successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<ApiResponse<User>> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @GetMapping("/email/{email}")
    @Operation(summary = "Get user by email")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> getUserByEmail(@PathVariable String email) {
        User user = userService.getUserByEmail(email);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @GetMapping
    @Operation(summary = "Get all active users")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_OFFICER')")
    public ResponseEntity<ApiResponse<Page<User>>> getAllActiveUsers(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<User> users = userService.getAllActiveUsers(pageable);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/role/{role}")
    @Operation(summary = "Get users by role")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_OFFICER')")
    public ResponseEntity<ApiResponse<List<User>>> getUsersByRole(@PathVariable UserRole role) {
        List<User> users = userService.getUsersByRole(role);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/doctors")
    @Operation(summary = "Get all active doctors")
    public ResponseEntity<ApiResponse<List<User>>> getActiveDoctors() {
        List<User> doctors = userService.getActiveDoctors();
        return ResponseEntity.ok(ApiResponse.success(doctors));
    }

    @GetMapping("/help-desk")
    @Operation(summary = "Get all help desk users")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICAL_OFFICER')")
    public ResponseEntity<ApiResponse<List<User>>> getHelpDeskUsers() {
        List<User> users = userService.getHelpDeskUsers();
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update user details")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<ApiResponse<User>> updateUser(
            @PathVariable Long id,
            @RequestBody UserDTO updateRequest) {
        User user = userService.updateUser(id, updateRequest);
        return ResponseEntity.ok(ApiResponse.success(user, "User updated successfully"));
    }

    @PatchMapping("/{id}/role")
    @Operation(summary = "Update user role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> updateUserRole(
            @PathVariable Long id,
            @RequestParam UserRole role) {
        User user = userService.updateUserRole(id, role);
        return ResponseEntity.ok(ApiResponse.success(user, "User role updated"));
    }

    @PostMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate a user")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deactivateUser(@PathVariable Long id) {
        userService.deactivateUser(id);
        return ResponseEntity.ok(ApiResponse.success(null, "User deactivated"));
    }

    @PostMapping("/{id}/activate")
    @Operation(summary = "Activate a user")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> activateUser(@PathVariable Long id) {
        userService.activateUser(id);
        return ResponseEntity.ok(ApiResponse.success(null, "User activated"));
    }

    @PostMapping("/{id}/change-password")
    @Operation(summary = "Change user password")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @PathVariable Long id,
            @RequestParam String newPassword) {
        userService.changePassword(id, newPassword);
        return ResponseEntity.ok(ApiResponse.success(null, "Password changed successfully"));
    }

    @PostMapping("/{id}/reset-password")
    @Operation(summary = "Reset user password (Admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> resetPassword(@PathVariable Long id) {
        String temporaryPassword = userService.resetPassword(id);
        return ResponseEntity.ok(ApiResponse.success(temporaryPassword,
            "Password reset successfully. Please share the temporary password with the user."));
    }

    // Current user profile endpoints
    @GetMapping("/me")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<ApiResponse<User>> getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PutMapping("/me")
    @Operation(summary = "Update current user profile")
    public ResponseEntity<ApiResponse<User>> updateCurrentUser(
            @Valid @RequestBody UserDTO updateRequest,
            Authentication authentication) {
        String email = authentication.getName();
        User currentUser = userService.getUserByEmail(email);
        User updatedUser = userService.updateUser(currentUser.getId(), updateRequest);
        return ResponseEntity.ok(ApiResponse.success(updatedUser, "Profile updated successfully"));
    }

    @PostMapping(value = "/me/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload profile photo")
    public ResponseEntity<ApiResponse<User>> uploadProfilePhoto(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        String email = authentication.getName();
        User currentUser = userService.getUserByEmail(email);
        User updatedUser = userService.uploadProfilePhoto(currentUser.getId(), file);
        return ResponseEntity.ok(ApiResponse.success(updatedUser, "Profile photo uploaded successfully"));
    }

    @PostMapping("/me/change-password")
    @Operation(summary = "Change current user password")
    public ResponseEntity<ApiResponse<Void>> changeCurrentUserPassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        User currentUser = userService.getUserByEmail(email);
        userService.changePasswordWithValidation(
            currentUser.getId(),
            request.getCurrentPassword(),
            request.getNewPassword()
        );
        return ResponseEntity.ok(ApiResponse.success(null, "Password changed successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a user (Admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success(null, "User deleted successfully"));
    }
}
