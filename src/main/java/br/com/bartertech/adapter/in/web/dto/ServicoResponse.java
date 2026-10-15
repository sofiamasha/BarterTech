package br.com.bartertech.adapter.in.web.dto;

import br.com.bartertech.domain.StatusServico;
import java.time.Instant;
import java.util.UUID;

public record ServicoResponse(
        UUID id,
        UUID proprietarioId,
        String proprietarioNome,
        String proprietarioEmail,
        String proprietarioAvatarUrl,
        String proprietarioLocalizacao,
        String titulo,
        String tipo,
        String categoria,
        String descricao,
        StatusServico status,
        Instant criadoEm
) {
}
