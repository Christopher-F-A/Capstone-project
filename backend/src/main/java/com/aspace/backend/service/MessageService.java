package com.aspace.backend.service;

import com.aspace.backend.dto.MessageSendDTO;
import com.aspace.backend.entities.Message;
import com.aspace.backend.entities.User;
import com.aspace.backend.exceptions.ResourceBadRequestException;
import com.aspace.backend.repository.MessageRepository;
import com.aspace.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Invia un messaggio da un utente a un altro.
     */
    @Transactional
    public Message sendMessage(MessageSendDTO dto) {
        if (dto.getContent() == null || dto.getContent().trim().isEmpty()) {
            throw new ResourceBadRequestException("Il contenuto del messaggio non può essere vuoto.");
        }
        if (dto.getSenderId().equals(dto.getReceiverId())) {
            throw new ResourceBadRequestException("Non puoi inviare un messaggio a te stesso.");
        }

        User sender = userRepository.findById(dto.getSenderId())
                .orElseThrow(() -> new ResourceBadRequestException("Mittente non trovato."));

        User receiver = userRepository.findById(dto.getReceiverId())
                .orElseThrow(() -> new ResourceBadRequestException("Destinatario non trovato."));

        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(dto.getContent().trim());
        message.setIsRead(Message.ReadStatus.NOT_READ);
        message.setCreatedAt(LocalDateTime.now());

        return messageRepository.save(message);
    }

    /**
     * Recupera lo storico della chat usando la query derivata a 4 parametri
     * e marca come "READ" i messaggi ricevuti.
     */
    @Transactional
    public List<Message> getChatHistory(Long userId, Long contactId) {
        // Passiamo le due combinazioni: (userId -> contactId) OPPURE (contactId -> userId)
        List<Message> history = messageRepository.findBySenderIdAndReceiverIdOrSenderIdAndReceiverIdOrderByIdAsc(
                userId, contactId, contactId, userId
        );

        // Aggiorna lo stato di lettura per i messaggi indirizzati all'utente corrente
        for (Message m : history) {
            if (m.getReceiver().getId().equals(userId) && m.getIsRead() == Message.ReadStatus.NOT_READ) {
                m.setIsRead(Message.ReadStatus.READ);
            }
        }

        return messageRepository.saveAll(history);
    }

    /**
     * Conta o restituisce i messaggi ancora non letti per la notifica (badge).
     */
    public List<Message> getUnreadMessages(Long userId) {
        return messageRepository.findByReceiverIdAndIsRead(userId, Message.ReadStatus.NOT_READ);
    }
}