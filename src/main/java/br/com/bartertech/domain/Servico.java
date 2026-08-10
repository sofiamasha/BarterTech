package br.com.bartertech.domain;

import java.util.Objects;
import java.util.UUID;

public final class Servico {
    private final UUID id;
    private final UUID proprietarioId;
    private final String tipo;
    private final String descricao;
    private StatusServico status;

    public Servico(UUID proprietarioId, String tipo, String descricao) {
        this(UUID.randomUUID(), proprietarioId, tipo, descricao, StatusServico.DISPONIVEL);
    }

    public Servico(UUID id, UUID proprietarioId, String tipo, String descricao, StatusServico status) {
        this.id = Objects.requireNonNull(id, "id e obrigatorio");
        this.proprietarioId = Objects.requireNonNull(proprietarioId, "proprietario e obrigatorio");
        this.tipo = Usuario.normalizar(tipo);
        if (descricao == null || descricao.isBlank()) {
            throw new IllegalArgumentException("descricao e obrigatoria");
        }
        this.descricao = descricao.trim();
        this.status = Objects.requireNonNull(status, "status e obrigatorio");
    }

    public void tornarIndisponivel() { status = StatusServico.INDISPONIVEL; }
    public void tornarDisponivel() { status = StatusServico.DISPONIVEL; }
    public boolean disponivel() { return status == StatusServico.DISPONIVEL; }
    public UUID id() { return id; }
    public UUID proprietarioId() { return proprietarioId; }
    public String tipo() { return tipo; }
    public String descricao() { return descricao; }
    public StatusServico status() { return status; }
}
