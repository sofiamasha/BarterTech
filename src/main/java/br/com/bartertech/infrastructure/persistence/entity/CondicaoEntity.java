package br.com.bartertech.infrastructure.persistence.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "proposta_condicoes")
public class CondicaoEntity {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proposta_id", nullable = false)
    private PropostaEntity proposta;

    @Column(nullable = false, length = 1000)
    private String descricao;

    @Column(nullable = false)
    private boolean obrigatoria;

    @Column(nullable = false)
    private boolean atendida;

    public CondicaoEntity() {
    }

    public CondicaoEntity(UUID id, PropostaEntity proposta, String descricao, boolean obrigatoria, boolean atendida) {
        this.id = id != null ? id : UUID.randomUUID();
        this.proposta = proposta;
        this.descricao = descricao;
        this.obrigatoria = obrigatoria;
        this.atendida = atendida;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public PropostaEntity getProposta() { return proposta; }
    public void setProposta(PropostaEntity proposta) { this.proposta = proposta; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public boolean isObrigatoria() { return obrigatoria; }
    public void setObrigatoria(boolean obrigatoria) { this.obrigatoria = obrigatoria; }
    public boolean isAtendida() { return atendida; }
    public void setAtendida(boolean atendida) { this.atendida = atendida; }
}
