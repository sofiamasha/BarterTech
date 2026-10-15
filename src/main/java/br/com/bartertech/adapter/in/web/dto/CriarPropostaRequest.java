package br.com.bartertech.adapter.in.web.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record CriarPropostaRequest(
        @NotNull(message = "O destinatário é obrigatório")
        UUID destinatarioId,

        @NotNull(message = "O serviço oferecido é obrigatório")
        UUID servicoOferecidoId,

        @NotNull(message = "O serviço solicitado é obrigatório")
        UUID servicoSolicitadoId,

        @NotNull(message = "A data de expiração é obrigatória")
        @Future(message = "A data de expiração deve estar no futuro")
        Instant expiraEm,

        String mensagem,

        List<CondicaoItemRequest> condicoes
) {
}
