package br.com.bartertech.adapter.in.web.dto;

import br.com.bartertech.domain.StatusServico;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AtualizarServicoRequest(
        @NotBlank(message = "O título é obrigatório")
        @Size(max = 150, message = "O título deve ter no máximo 150 caracteres")
        String titulo,

        @NotBlank(message = "O tipo do serviço é obrigatório")
        @Size(max = 100, message = "O tipo deve ter no máximo 100 caracteres")
        String tipo,

        @NotBlank(message = "A categoria é obrigatória")
        @Size(max = 100, message = "A categoria deve ter no máximo 100 caracteres")
        String categoria,

        @NotBlank(message = "A descrição é obrigatória")
        @Size(min = 10, max = 2000, message = "A descrição deve ter entre 10 e 2000 caracteres")
        String descricao,

        @NotNull(message = "O status é obrigatório")
        StatusServico status
) {
}
