package br.com.bartertech.adapter.in.web.dto;

import br.com.bartertech.domain.StatusProposta;
import java.time.Instant;
import java.util.UUID;

public record HistoricoPropostaResponse(
        UUID id,
        StatusProposta status,
        String observacao,
        Instant ocorridoEm
) {
}
