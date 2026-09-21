package com.ecozii.esalon.repository;

import com.ecozii.esalon.model.Salon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SalonRepository extends JpaRepository<Salon, Long> {

    List<Salon> findByIsActiveTrueOrderByRatingDesc();

    List<Salon> findByCityAndIsActiveTrue(String city);

    @Query(value = "SELECT *, " +
            "(6371 * acos(cos(radians(:latitude)) * cos(radians(latitude)) * " +
            "cos(radians(longitude) - radians(:longitude)) + sin(radians(:latitude)) * " +
            "sin(radians(latitude)))) AS distance " +
            "FROM salons " +
            "WHERE is_active = true " +
            "AND latitude IS NOT NULL AND longitude IS NOT NULL " +
            "HAVING distance <= :radiusKm " +
            "ORDER BY distance ASC, rating DESC",
            nativeQuery = true)
    List<Salon> findNearbySalonsSortedByRating(
            @Param("latitude") Double latitude,
            @Param("longitude") Double longitude,
            @Param("radiusKm") Double radiusKm
    );
}