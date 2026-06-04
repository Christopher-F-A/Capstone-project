package com.aspace.backend.controller;

import com.aspace.backend.dto.BookingRequestDTO;
import com.aspace.backend.dto.EventCreationDTO;
import com.aspace.backend.entities.Booking;
import com.aspace.backend.entities.Event;
import com.aspace.backend.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
public class EventController {

    @Autowired
    private EventService eventService;

    /**
     * Endpoint per pubblicare un nuovo evento.
     * POST http://localhost:8080/api/events
     */
    @PostMapping
    public ResponseEntity<Event> createEvent(@RequestBody EventCreationDTO dto) {
        Event createdEvent = eventService.createEvent(dto);
        return new ResponseEntity<>(createdEvent, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Evento eliminato definitivamente dall'agenda.");
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint per permettere a un utente di prenotare un posto.
     * POST http://localhost:8080/api/events/book
     */
    @PostMapping("/book")
    public ResponseEntity<Map<String, Object>> bookEvent(@RequestBody BookingRequestDTO dto) {
        Booking booking = eventService.bookEvent(dto);
        return new ResponseEntity<>(Map.of(
                "message", "Prenotazione confermata con successo!",
                "bookingId", booking.getId(),
                "status", booking.getStatus().name(),
                "currentBookedSlots", booking.getEvent().getBookedSlots()
        ), HttpStatus.CREATED);
    }

    /**
     * Endpoint per recuperare la lista degli eventi di un'associazione.
     * GET http://localhost:8080/api/events/association/{associationId}
     */
    @GetMapping("/association/{associationId}")
    public ResponseEntity<List<Event>> getEventsByAssociation(@PathVariable Long associationId) {
        List<Event> events = eventService.getEventsByAssociation(associationId);
        return ResponseEntity.ok(events);
    }
}