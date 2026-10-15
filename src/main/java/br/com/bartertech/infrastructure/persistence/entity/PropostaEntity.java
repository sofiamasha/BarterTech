package br.com.bartertech.infrastructure.persistence.entity;

import br.com.bartertech.domain.StatusProposta;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "propostas")
public class PropostaEntity {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "solicitante_id", nullable = false)
    private UsuarioEntity solicitante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destinatario_id", nullable = false)
    private UsuarioEntity destinatario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "servico_oferecido_id", nullable = false)
    private ServicoEntity servicoOferecido;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "servico_solicitado_id", nullable = false)
    private ServicoEntity servicoSolicitado;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatusProposta status = StatusProposta.PENDENTE;

    @Column(length = 2000)
    private String mensagem;

    @Column(name = "criada_em", nullable = false, updatable = false)
    private Instant criadaEm = Instant.now();

    @Column(name = "expira_em", nullable = false)
    private Instant expiraEm;

    @OneToMany(mappedBy = "proposta", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<CondicaoEntity> condicoes = new ArrayList<>();

    @OneToMany(mappedBy = "proposta", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("ocorridoEm ASC")
    private List<HistoricoPropostaEntity> historico = new ArrayList<>();

    public PropostaEntity() {
    }

    public PropostaEntity(UUID id, UsuarioEntity solicitante, UsuarioEntity destinatario,
                          ServicoEntity servicoOferecido, ServicoEntity servicoSolicitado,
                          Instant criadaEm, Instant expiraEm, StatusProposta status, String mensagem) {
        this.id = id != null ? id : UUID.randomUUID();
        this.solicitante = solicitante;
        this.destinatario = destinatario;
        this.servicoOferecido = servicoOferecido;
        this.servicoSolicitado = servicoSolicitado;
        this.criadaEm = criadaEm != null ? criadaEm : Instant.now();
        this.expiraEm = expiraEm;
        this.status = status != null ? status : StatusProposta.PENDENTE;
        this.mensagem = mensagem;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UsuarioEntity getSolicitante() { return solicitante; }
    public void setSolicitante(UsuarioEntity solicitante) { this.solicitante = solicitante; }
    public UsuarioEntity getDestinatario() { return destinatario; }
    public void setDestinatario(UsuarioEntity destinatario) { this.destinatario = destinatario; }
    public ServicoEntity getServicoOferecido() { return servicoOferecido; }
    public void setServicoOferecido(ServicoEntity servicoOferecido) { this.servicoOferecido = servicoOferecido; }
    public ServicoEntity getServicoSolicitado() { return servicoSolicitado; }
    public void setServicoSolicitado(ServicoEntity servicoSolicitado) { this.servicoSolicitado = servicoSolicitado; }
    public StatusProposta getStatus() { return status; }
    public void setStatus(StatusProposta status) { this.status = status; }
    public String getMensagem() { return mensagem; }
    public void setMensagem(String mensagem) { this.mensagem = mensagem; }
    public Instant getCriadaEm() { return criadaEm; }
    public void setCriadaEm(Instant criadaEm) { this.criadaEm = criadaEm; }
    public Instant getExpiraEm() { return expiraEm; }
    public void setExpiraEm(Instant expiraEm) { this.expiraEm = expiraEm; }
    public List<CondicaoEntity> getCondicoes() { return condicoes; }
    public void setCondicoes(List<CondicaoEntity> condicoes) { this.condicoes = condicoes; }
    public List<HistoricoPropostaEntity> getHistorico() { return historico; }
    public void setHistorico(List<HistoricoPropostaEntity> historico) { this.historico = historico; }
}
