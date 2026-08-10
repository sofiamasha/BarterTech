package br.com.bartertech.domain;

import java.util.Objects;

public final class CondicaoContrato {
    private final String descricao;
    private final boolean obrigatoria;
    private boolean atendida;

    public CondicaoContrato(String descricao, boolean obrigatoria) {
        if (descricao == null || descricao.isBlank()) {
            throw new IllegalArgumentException("descricao da condicao e obrigatoria");
        }
        this.descricao = descricao.trim();
        this.obrigatoria = obrigatoria;
    }

    public void marcarComoAtendida() { atendida = true; }
    public String descricao() { return descricao; }
    public boolean obrigatoria() { return obrigatoria; }
    public boolean atendida() { return atendida; }
}
