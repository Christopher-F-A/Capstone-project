package com.aspace.backend.service;

import com.aspace.backend.dto.LoginRequestDTO;
import com.aspace.backend.dto.LoginResponseDTO;
import com.aspace.backend.dto.UserRegistrationDTO;
import com.aspace.backend.entities.Avatar;
import com.aspace.backend.entities.User;
import com.aspace.backend.exceptions.ResourceBadRequestException;
import com.aspace.backend.repository.AvatarRepository;
import com.aspace.backend.repository.UserRepository;
import com.aspace.backend.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AvatarRepository avatarRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private com.aspace.backend.security.JwtUtils jwtUtils;

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Autowired
    private AuthenticationManager authenticationManager;

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
     * Autentica un utente e restituisce un token JWT valido.
     */
    public LoginResponseDTO loginUser(LoginRequestDTO loginDTO) {
        // 1. Autenticazione (es. con AuthenticationManager)
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginDTO.getEmail(), loginDTO.getPassword())
        );

        // 2. Recupera l'utente dal database (fondamentale per avere l'oggetto completo)
        User user = userRepository.findByEmail(loginDTO.getEmail())
                .orElseThrow(() -> new ResourceBadRequestException("Utente non trovato"));

        // 3. Genera il token passando l'intero oggetto user
        String jwt = jwtUtils.generateJwtToken(user);

        // 4. Ritorna il DTO che include anche lo username per il frontend
        return new LoginResponseDTO(jwt, user.getUsername(), user.getEmail(), user.getFirstName());
    }


    public JwtUtils getJwtUtils() {
        return jwtUtils;
    }

    public void setJwtUtils(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }
}