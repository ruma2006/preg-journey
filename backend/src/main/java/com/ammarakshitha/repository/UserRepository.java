package com.ammarakshitha.repository;

import com.ammarakshitha.model.User;
import com.ammarakshitha.model.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByPhone(String phone);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    List<User> findByRole(UserRole role);

    List<User> findByRoleAndIsActiveTrue(UserRole role);

    Page<User> findByIsActiveTrue(Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.role = :role AND u.isActive = true ORDER BY u.name")
    List<User> findActiveDoctors(@Param("role") UserRole role);

    @Query("SELECT u FROM User u WHERE u.role IN :roles AND u.isActive = true")
    List<User> findByRolesAndActive(@Param("roles") List<UserRole> roles);

    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role AND u.isActive = true")
    long countByRoleAndActive(@Param("role") UserRole role);
}
