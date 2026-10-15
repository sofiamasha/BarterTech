package br.com.bartertech.infrastructure.persistence.entity;

import br.com.bartertech.domain.StatusProposta;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "proposta_historico")
public class HistoricoPropostaEntity {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proposta_id", nullable = false)
    private PropostaEntity proposta;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatusProposta status;

    @Column(length = 1000)
    private String observacao;

    @Column(name = "ocorrido_em", nullable = false)
    private Instant ocorridoEm = Instant.now();

    public HistoricoPropostaEntity() {
    }

    public HistoricoPropostaEntity(UUID id, PropostaEntity proposta, StatusProposta status, String observacao, Instant ocorridoEm) {
        this.id = id != null ? id : UUID.randomUUID();
        this.proposta = proposta;
        this.status = status;
        this.observacao = observacao;
        this.ocorridoEm = ocorridoEm != null ? ocorridoEm : Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public PropostaEntity getProposta() { return proposta; }
    public void setProposta(PropostaEntity proposta) { this.proposta = proposta; }
    public StatusProposta getStatus() { return status; }
    public void setStatus(StatusProposta status) { this.status = status; }
    public String getObservacao() { return observacao; }
    public void setObservacao(String observacao) { this.observacao = observacao; }
    public Instant getOcorridoEm() { return ocorridoEm; }
    public void setOcorridoEm(Instant ocorridoEm) { this.ocorridoEm = ocorridoEm; }
}
