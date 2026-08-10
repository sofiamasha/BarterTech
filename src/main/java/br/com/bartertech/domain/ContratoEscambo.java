package br.com.bartertech.domain;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class ContratoEscambo {
    private final UUID id;
    private final UUID propostaId;
    private final Instant geradoEm;
    private final String conteudo;
    private final String hashIntegridade;

    public ContratoEscambo(UUID propostaId, Instant geradoEm, String conteudo, String hashIntegridade) {
        this.id = UUID.randomUUID();
        this.propostaId = propostaId;
        this.geradoEm = geradoEm;
        this.conteudo = conteudo;
        this.hashIntegridade = hashIntegridade;
    }

    public boolean possuiIntegridade(IntegridadeContrato integridade) {
        return hashIntegridade.equals(integridade.gerarHash(conteudo));
    }

    public UUID id() { return id; }
    public UUID propostaId() { return propostaId; }
    public Instant geradoEm() { return geradoEm; }
    public String conteudo() { return conteudo; }
    public String hashIntegridade() { return hashIntegridade; }

    public static String montarConteudo(PropostaTroca proposta) {
        List<String> condicoes = proposta.condicoes().stream()
                .map(c -> c.descricao() + "|" + c.obrigatoria() + "|" + c.atendida())
                .toList();
        return String.join("\n",
                "proposta=" + proposta.id(),
                "solicitante=" + proposta.solicitante().id(),
                "destinatario=" + proposta.destinatario().id(),
                "oferecido=" + proposta.servicoOferecido().id(),
                "solicitado=" + proposta.servicoSolicitado().id(),
                "condicoes=" + String.join(";", condicoes));
    }
}
