package br.com.bartertech.adapter.in.web.dto;

import java.util.UUID;

public record MatchExplicadoResponse(
        UUID parceiroId,
        String parceiroNome,
        String parceiroEmail,
        String parceiroAvatarUrl,
        String parceiroBio,
        String parceiroLocalizacao,

        UUID meuServicoId,
        String meuServicoTitulo,
        String meuServicoTipo,

        UUID servicoParceiroId,
        String servicoParceiroTitulo,
        String servicoParceiroTipo,

        String motivoMatch,
        int scoreCompatibilidade,
        boolean propostaEmAndamento
) {
}
