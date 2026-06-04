package com.aspace.backend.service;

import com.aspace.backend.dto.BookingRequestDTO;
import com.aspace.backend.dto.EventCreationDTO;
import com.aspace.backend.entities.*;
import com.aspace.backend.exceptions.ResourceBadRequestException;
import com.aspace.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private AssociationRepository associationRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MembershipRepository membershipRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    /**
     * Crea e pubblica un nuovo evento per un'associazione.
     */
    @Transactional
    public Event createEvent(EventCreationDTO dto) {
        Association association = associationRepository.findById(dto.getAssociationId())
                .orElseThrow(() -> new ResourceBadRequestException("Associazione non trovata."));

        if (dto.getEventDate().isBefore(LocalDateTime.now())) {
            throw new ResourceBadRequestException("Non puoi creare un evento nel passato.");
        }

        if (dto.getMaxSlots() <= 0) {
            throw new ResourceBadRequestException("La capacità massima dei posti deve essere maggiore di zero.");
        }

        Event event = new Event();
        event.setAssociation(association);
        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setLocation(dto.getLocation());
        event.setEventDate(dto.getEventDate());
        event.setMaxSlots(dto.getMaxSlots());
        event.setBookedSlots(0);
        event.setCancelled(false);
        event.setImageUrl(dto.getImageUrl());

        return eventRepository.save(event);
    }

    @Transactional
    public void deleteEvent(Long eventId) {
        // 1. Verifica esistenza dell'evento
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceBadRequestException("Evento non trovato."));

        // 2. Recupera l'utente dal JWT
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceBadRequestException("Utente non trovato."));

        // 3. Recupera la membership
        Membership membership = membershipRepository.findByUserIdAndAssociationId(currentUser.getId(), event.getAssociation().getId())
                .orElseThrow(() -> new ResourceBadRequestException("Non appartieni a questa associazione."));

        // 4. Controllo permessi
        if (membership.getRole() != Membership.Role.ADMIN && membership.getRole() != Membership.Role.SUPERADMIN) {
            throw new ResourceBadRequestException("Operazione negata: Solo gli amministratori possono eliminare gli eventi.");
        }

        if (event.getImageUrl() != null) {
            try {
                cloudinaryService.deleteFile(event.getImageUrl());
            } catch (Exception e) {
                System.err.println("Impossibile eliminare l'immagine dell'evento da Cloudinary: " + e.getMessage());
            }
        }

        eventRepository.delete(event);
    }

    /**
     * Gestisce la prenotazione di un posto a un evento da parte di un utente.
     * Verifica la capienza ed evita doppie prenotazioni.
     */
    @Transactional
    public Booking bookEvent(BookingRequestDTO dto) {
        // 1. Verifica esistenza dell'evento
        Event event = eventRepository.findById(dto.getEventId())
                .orElseThrow(() -> new ResourceBadRequestException("Evento richiesto non trovato."));

        // 2. Verifica se l'evento è stato annullato
        if (event.isCancelled()) {
            throw new ResourceBadRequestException("Impossibile prenotare: l'evento è stato annullato.");
        }

        // 3. Verifica esistenza dell'utente
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceBadRequestException("Utente non trovato."));

        // 4. Controllo disponibilità posti
        if (event.getBookedSlots() >= event.getMaxSlots()) {
            throw new ResourceBadRequestException("Siamo spiacenti, i posti per questo evento sono esauriti.");
        }

        // 5. Controllo anti-duplicati
        if (bookingRepository.existsByEventIdAndUserIdAndStatus(dto.getEventId(), dto.getUserId(), Booking.Status.CONFIRMED)) {
            throw new ResourceBadRequestException("Hai già un posto prenotato e confermato per questo evento.");
        }

        // 6. Crea la prenotazione
        Booking booking = new Booking();
        booking.setEvent(event);
        booking.setUser(user);
        booking.setBookingDate(LocalDateTime.now());
        booking.setStatus(Booking.Status.CONFIRMED);

        Booking savedBooking = bookingRepository.save(booking);

        // 7. Aggiorna il contatore dei posti occupati sull'evento
        event.setBookedSlots(event.getBookedSlots() + 1);
        eventRepository.save(event); // Aggiorna l'entità principale

        return savedBooking;
    }

    /**
     * Recupera la lista di tutti gli eventi di un'associazione.
     */
    public List<Event> getEventsByAssociation(Long associationId) {
        if (!associationRepository.existsById(associationId)) {
            throw new ResourceBadRequestException("Associazione non trovata.");
        }
        return eventRepository.findByAssociationIdOrderByEventDateDesc(associationId);
    }
}