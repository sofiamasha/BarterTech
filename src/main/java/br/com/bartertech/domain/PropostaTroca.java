package br.com.bartertech.domain;

import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

public final class PropostaTroca {
    private final UUID id;
    private final Usuario solicitante;
    private final Usuario destinatario;
    private final Servico servicoOferecido;
    private final Servico servicoSolicitado;
    private final Instant criadaEm;
    private final Instant expiraEm;
    private final List<CondicaoContrato> condicoes;
    private final List<RegistroStatusProposta> historico = new ArrayList<>();
    private StatusProposta status = StatusProposta.PENDENTE;

    public PropostaTroca(Usuario solicitante, Usuario destinatario, Servico servicoOferecido,
                          Servico servicoSolicitado, Instant expiraEm, List<CondicaoContrato> condicoes,
                          Clock clock) {
        this.id = UUID.randomUUID();
        this.solicitante = Objects.requireNonNull(solicitante, "solicitante e obrigatorio");
        this.destinatario = Objects.requireNonNull(destinatario, "destinatario e obrigatorio");
        this.servicoOferecido = Objects.requireNonNull(servicoOferecido, "servico oferecido e obrigatorio");
        this.servicoSolicitado = Objects.requireNonNull(servicoSolicitado, "servico solicitado e obrigatorio");
        this.criadaEm = Instant.now(Objects.requireNonNull(clock, "clock e obrigatorio"));
        this.expiraEm = Objects.requireNonNull(expiraEm, "data de expiracao e obrigatoria");
        if (!expiraEm.isAfter(criadaEm)) {
            throw new IllegalArgumentException("A proposta deve expirar no futuro");
        }
        this.condicoes = new ArrayList<>(Objects.requireNonNull(condicoes, "condicoes sao obrigatorias"));
        historico.add(new RegistroStatusProposta(status, criadaEm));
    }

    public boolean expirada(Clock clock) {
        return !Instant.now(clock).isBefore(expiraEm);
    }

    public void aceitar(Clock clock) {
        atualizarExpiracao(clock);
        if (status != StatusProposta.PENDENTE) {
            throw new IllegalStateException("Somente propostas pendentes podem ser aceitas");
        }
        status = StatusProposta.ACEITA;
        historico.add(new RegistroStatusProposta(status, Instant.now(clock)));
    }

    public void rejeitar(Clock clock) {
        atualizarExpiracao(clock);
        if (status != StatusProposta.PENDENTE) {
            throw new IllegalStateException("Somente propostas pendentes podem ser rejeitadas");
        }
        status = StatusProposta.REJEITADA;
        historico.add(new RegistroStatusProposta(status, Instant.now(clock)));
    }

    public void atualizarExpiracao(Clock clock) {
        if (status == StatusProposta.PENDENTE && expirada(clock)) {
            status = StatusProposta.EXPIRADA;
            historico.add(new RegistroStatusProposta(status, Instant.now(clock)));
        }
    }

    public UUID id() { return id; }
    public Usuario solicitante() { return solicitante; }
    public Usuario destinatario() { return destinatario; }
    public Servico servicoOferecido() { return servicoOferecido; }
    public Servico servicoSolicitado() { return servicoSolicitado; }
    public Instant criadaEm() { return criadaEm; }
    public Instant expiraEm() { return expiraEm; }
    public List<CondicaoContrato> condicoes() { return Collections.unmodifiableList(condicoes); }
    public List<RegistroStatusProposta> historico() { return Collections.unmodifiableList(historico); }
    public StatusProposta status() { return status; }
}
