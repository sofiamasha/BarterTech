package br.com.bartertech.adapter.in.web.dto;

import java.time.Instant;
import java.util.UUID;

public record ContratoResponse(
        UUID id,
        UUID propostaId,
        PropostaResponse proposta,
        Instant geradoEm,
        String conteudo,
        String hashIntegridade,
        boolean integro
) {
}
