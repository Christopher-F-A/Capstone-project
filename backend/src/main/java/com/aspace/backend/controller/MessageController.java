package com.aspace.backend.controller;

import com.aspace.backend.dto.MessageSendDTO;
import com.aspace.backend.entities.Message;
import com.aspace.backend.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    /**
     * Invia un messaggio diretto.
     * POST http://localhost:8080/api/messages
     */
    @PostMapping
    public ResponseEntity<Message> sendMessage(@RequestBody MessageSendDTO dto) {
        Message sentMessage = messageService.sendMessage(dto);
        return new ResponseEntity<>(sentMessage, HttpStatus.CREATED);
    }

    /**
     * Recupera la chat tra due utenti (e azzera le notifiche dei messaggi letti).
     * GET http://localhost:8080/api/messages/history?userId=1&contactId=2
     */
    @GetMapping("/history")
    public ResponseEntity<List<Message>> getChatHistory(@RequestParam Long userId, @RequestParam Long contactId) {
        List<Message> history = messageService.getChatHistory(userId, contactId);
        return ResponseEntity.ok(history);
    }

    /**
     * Ottiene l'elenco dei messaggi non letti di un utente (utile per i contatori sul frontend).
     * GET http://localhost:8080/api/messages/unread/{userId}
     */
    @GetMapping("/unread/{userId}")
    public ResponseEntity<List<Message>> getUnreadMessages(@PathVariable Long userId) {
        return ResponseEntity.ok(messageService.getUnreadMessages(userId));
    }
}