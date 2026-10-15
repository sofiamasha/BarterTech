package br.com.bartertech.infrastructure.security;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;
import java.util.UUID;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static UUID getUsuarioIdAutenticado() {
        return getUsuarioAutenticado()
                .map(CustomUserPrincipal::getId)
                .orElseThrow(() -> new AccessDeniedException("Usuário não autenticado"));
    }

    public static Optional<CustomUserPrincipal> getUsuarioAutenticado() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserPrincipal principal) {
            return Optional.of(principal);
        }
        return Optional.empty();
    }
}
