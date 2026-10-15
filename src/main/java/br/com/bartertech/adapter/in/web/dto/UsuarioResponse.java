package br.com.bartertech.adapter.in.web.dto;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

public record UsuarioResponse(
        UUID id,
        String nome,
        String email,
        String bio,
        String localizacao,
        String avatarUrl,
        boolean ativo,
        Set<String> interesses,
        Instant criadoEm
) {
}
