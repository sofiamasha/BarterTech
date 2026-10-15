package br.com.bartertech.adapter.in.web.dto;

import br.com.bartertech.domain.StatusProposta;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record PropostaResponse(
        UUID id,
        UsuarioResponse solicitante,
        UsuarioResponse destinatario,
        ServicoResponse servicoOferecido,
        ServicoResponse servicoSolicitado,
        StatusProposta status,
        String mensagem,
        Instant criadaEm,
        Instant expiraEm,
        List<CondicaoResponse> condicoes,
        List<HistoricoPropostaResponse> historico,
        UUID contratoId,
        boolean podeAceitar,
        boolean podeRejeitar,
        boolean podeCancelar,
        boolean podeGerarContrato
) {
}
