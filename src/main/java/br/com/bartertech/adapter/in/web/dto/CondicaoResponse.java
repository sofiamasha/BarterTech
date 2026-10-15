package br.com.bartertech.adapter.in.web.dto;

import java.util.UUID;

public record CondicaoResponse(
        UUID id,
        String descricao,
        boolean obrigatoria,
        boolean atendida
) {
}
