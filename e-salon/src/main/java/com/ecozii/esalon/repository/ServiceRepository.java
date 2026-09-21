package com.ecozii.esalon.repository;

import com.ecozii.esalon.model.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Collection;
import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {

    List<Service> findByIsActiveTrueOrderByNameAsc();

    List<Service> findByCategoryAndIsActiveTrue(String category);

    List<Service> findBySalonIdAndIsActiveTrue(Long salonId);

    List<Service> findBySalonIdInAndIsActiveTrue(Collection<Long> salonIds);
}