package com.ammarakshitha.repository;

import com.ammarakshitha.model.Baby;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BabyRepository extends JpaRepository<Baby, Long> {
    
    List<Baby> findByPatientIdOrderByBirthOrderAsc(Long patientId);
    
    void deleteByPatientId(Long patientId);
}
