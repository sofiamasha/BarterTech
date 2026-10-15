package br.com.bartertech.adapter.in.web.dto;

import java.time.Instant;
import java.util.Map;

public record ErrorResponse(
        int status,
        String erro,
        String mensagem,
        Instant timestamp,
        Map<String, String> validacoes
) {
    public ErrorResponse(int status, String erro, String mensagem) {
        this(status, erro, mensagem, Instant.now(), null);
    }

    public ErrorResponse(int status, String erro, String mensagem, Map<String, String> validacoes) {
        this(status, erro, mensagem, Instant.now(), validacoes);
    }
}
