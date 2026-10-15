package br.com.bartertech.infrastructure.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtTokenProvider {

    private final SecretKey key;
    private final long expirationHours;

    public JwtTokenProvider(
            @Value("${security.jwt.secret:BarterTechUltraSecureKeyForJWTGenerationMinimum256BitsLong2026!}") String secret,
            @Value("${security.jwt.expiration-hours:24}") long expirationHours) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationHours = expirationHours;
    }

    public String gerarToken(UUID usuarioId, String email) {
        Instant agora = Instant.now();
        Instant expiracao = agora.plus(expirationHours, ChronoUnit.HOURS);

        return Jwts.builder()
                .subject(email)
                .claim("userId", usuarioId.toString())
                .issuedAt(Date.from(agora))
                .expiration(Date.from(expiracao))
                .signWith(key)
                .compact();
    }

    public String obterEmailDoToken(String token) {
        return obterClaims(token).getSubject();
    }

    public UUID obterUsuarioIdDoToken(String token) {
        String userIdStr = obterClaims(token).get("userId", String.class);
        return UUID.fromString(userIdStr);
    }

    public boolean validarToken(String token) {
        try {
            obterClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }

    private Claims obterClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
