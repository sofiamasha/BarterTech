package br.com.bartertech.adapter.in.web.dto;

import java.util.UUID;

public record VerificacaoIntegridadeResponse(
        UUID contratoId,
        String hashRegistrado,
        String hashCalculado,
        boolean integro,
        String mensagemExplicativa
) {
}
