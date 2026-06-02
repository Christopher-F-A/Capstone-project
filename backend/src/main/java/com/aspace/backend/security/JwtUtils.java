package com.aspace.backend.security;

import com.aspace.backend.entities.User;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import org.springframework.stereotype.Component;
import java.util.Date;

@Component
public class JwtUtils {

    private final String jwtSecret = "ASpaceSuperSecretKeyForJWTTokenGeneration2026ExtraLong";
    private final int jwtExpirationMs = 86400000; // 1 Giorno

    // Algoritmo HMAC256 usando la libreria Auth0
    private final Algorithm algorithm = Algorithm.HMAC256(jwtSecret.getBytes());

    public String generateJwtToken(User user) {
        return JWT.create()
                .withSubject(user.getEmail()) // L'email rimane il Subject per l'autenticazione
                .withClaim("username", user.getUsername()) // Aggiungiamo lo username come claim
                .withIssuedAt(new Date())
                .withExpiresAt(new Date((new Date()).getTime() + jwtExpirationMs))
                .sign(algorithm);
    }

    public String getEmailFromJwtToken(String token) {
        return JWT.require(algorithm)
                .build()
                .verify(token)
                .getSubject();
    }

    public String getUsernameFromJwtToken(String token) {
        return JWT.require(algorithm).build().verify(token).getClaim("username").asString();
    }

    public boolean validateJwtToken(String authToken) {
        try {
            JWT.require(algorithm).build().verify(authToken);
            return true;
        } catch (JWTVerificationException e) {
            System.out.println("Token JWT non valido: " + e.getMessage());
            return false;
        }
    }
}