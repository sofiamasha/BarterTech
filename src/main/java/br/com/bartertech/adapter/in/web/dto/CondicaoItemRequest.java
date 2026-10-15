package br.com.bartertech.adapter.in.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CondicaoItemRequest(
        @NotBlank(message = "A descrição da condição é obrigatória")
        @Size(max = 1000, message = "A descrição não pode exceder 1000 caracteres")
        String descricao,

        boolean obrigatoria
) {
}
