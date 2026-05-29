package com.aspace.backend.repository;

import com.aspace.backend.entities.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    // Trova tutte le prenotazioni attive di un utente specifico
    List<Booking> findByUserIdAndStatus(Long userId, Booking.Status status);

    // Controlla se un utente ha già una prenotazione attiva per un determinato evento (evita doppi posti)
    boolean existsByEventIdAndUserIdAndStatus(Long eventId, Long userId, Booking.Status status);
}