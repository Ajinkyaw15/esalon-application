package com.ecozii.esalon.repository;

import com.ecozii.esalon.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByCustomerIdOrderByAppointmentDateDesc(Long customerId);

    List<Appointment> findByAppointmentDateAndSalonId(LocalDate date, Long salonId);

    boolean existsBySalonIdAndAppointmentDateAndAppointmentTime(
            Long salonId, LocalDate date, LocalTime time);

    @Query("SELECT a.appointmentTime FROM Appointment a " +
            "WHERE a.salonId = :salonId AND a.appointmentDate = :date " +
            "AND a.status != 'CANCELLED'")
    List<LocalTime> findBookedTimesBySalonIdAndDate(
            @Param("salonId") Long salonId,
            @Param("date") LocalDate date);

    List<Appointment> findBySalonIdOrderByAppointmentDateAsc(Long salonId);
}