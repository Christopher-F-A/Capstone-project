package com.aspace.backend.service;

import com.aspace.backend.dto.LoginRequestDTO;
import com.aspace.backend.dto.LoginResponseDTO;
import com.aspace.backend.dto.UserRegistrationDTO;
import com.aspace.backend.entities.Avatar;
import com.aspace.backend.entities.User;
import com.aspace.backend.exceptions.ResourceBadRequestException;
import com.aspace.backend.repository.AvatarRepository;
import com.aspace.backend.repository.UserRepository;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AvatarRepository avatarRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Value("${jwt.secret}")
    private String jwtSecret;

    /**
     * Registrazione di un nuovo utente con cifratura della password
     * e creazione automatica dell'avatar (Goccia 3D).
     */
    @Transactional
    public User registerUser(UserRegistrationDTO dto) {
        // 1. Controllo validità ed esistenza email
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new ResourceBadRequestException("Email già registrata sulla piattaforma A-SPACE.");
        }

        // 2. Controllo esistenza username
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new ResourceBadRequestException("Username già occupato.");
        }

        // 3. Mappatura DTO -> Entity e cifratura password
        User newUser = new User();
        newUser.setUsername(dto.getUsername());
        newUser.setEmail(dto.getEmail());
        newUser.setFirstName(dto.getFirstName());
        newUser.setLastName(dto.getLastName());
        newUser.setTaxCode(dto.getTaxCode());
        newUser.setBirthDate(dto.getBirthDate());

        // Cifratura con BCrypt
        String hashedPassword = passwordEncoder.encode(dto.getPassword());
        newUser.setPassword(hashedPassword);

        // 4. Salvataggio Utente su DB
        User savedUser = userRepository.save(newUser);

        // 5. Creazione automatica Avatar
        Avatar userAvatar = new Avatar();
        userAvatar.setUser(savedUser);
        avatarRepository.save(userAvatar);

        return savedUser;
    }

    /**
     * Autentica un utente e restituisce un token JWT valido per 24 ore.
     */
    public LoginResponseDTO loginUser(LoginRequestDTO dto) {
        // 1. Cerca l'utente tramite email
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new ResourceBadRequestException("Credenziali non valide."));

        // 2. Verifica se la password inserita corrisponde all'hash memorizzato nel DB
        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new ResourceBadRequestException("Credenziali non valide.");
        }

        // 3. Generazione del Token JWT (Scadenza impostata a 24 ore)
        Algorithm algorithm = Algorithm.HMAC256(jwtSecret);
        String token = JWT.create()
                .withSubject(user.getEmail())
                .withClaim("userId", user.getId())
                .withClaim("username", user.getUsername())
                .withIssuedAt(new Date())
                .withExpiresAt(new Date(System.currentTimeMillis() + 86400000))
                .sign(algorithm);

        // 4. Ritorna i dati necessari al frontend
        return new LoginResponseDTO(token, user.getUsername(), user.getId());
    }
}