package br.com.bartertech.infrastructure.persistence.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "contratos")
public class ContratoEntity {

    @Id
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proposta_id", nullable = false, unique = true)
    private PropostaEntity proposta;

    @Column(name = "gerado_em", nullable = false, updatable = false)
    private Instant geradoEm = Instant.now();

    @Lob
    @Column(nullable = false)
    private String conteudo;

    @Column(name = "hash_integridade", nullable = false, length = 64)
    private String hashIntegridade;

    public ContratoEntity() {
    }

    public ContratoEntity(UUID id, PropostaEntity proposta, Instant geradoEm, String conteudo, String hashIntegridade) {
        this.id = id != null ? id : UUID.randomUUID();
        this.proposta = proposta;
        this.geradoEm = geradoEm != null ? geradoEm : Instant.now();
        this.conteudo = conteudo;
        this.hashIntegridade = hashIntegridade;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public PropostaEntity getProposta() { return proposta; }
    public void setProposta(PropostaEntity proposta) { this.proposta = proposta; }
    public Instant getGeradoEm() { return geradoEm; }
    public void setGeradoEm(Instant geradoEm) { this.geradoEm = geradoEm; }
    public String getConteudo() { return conteudo; }
    public void setConteudo(String conteudo) { this.conteudo = conteudo; }
    public String getHashIntegridade() { return hashIntegridade; }
    public void setHashIntegridade(String hashIntegridade) { this.hashIntegridade = hashIntegridade; }
}
