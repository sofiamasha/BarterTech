package br.com.bartertech.infrastructure.persistence.entity;

import br.com.bartertech.domain.StatusServico;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "servicos")
public class ServicoEntity {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proprietario_id", nullable = false)
    private UsuarioEntity proprietario;

    @Column(nullable = false, length = 150)
    private String titulo;

    @Column(nullable = false, length = 100)
    private String tipo;

    @Column(nullable = false, length = 100)
    private String categoria;

    @Column(nullable = false, length = 2000)
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatusServico status = StatusServico.DISPONIVEL;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private Instant criadoEm = Instant.now();

    @Column(name = "atualizado_em", nullable = false)
    private Instant atualizadoEm = Instant.now();

    public ServicoEntity() {
    }

    public ServicoEntity(UUID id, UsuarioEntity proprietario, String titulo, String tipo, String categoria, String descricao, StatusServico status) {
        this.id = id != null ? id : UUID.randomUUID();
        this.proprietario = proprietario;
        this.titulo = titulo;
        this.tipo = tipo;
        this.categoria = categoria;
        this.descricao = descricao;
        this.status = status != null ? status : StatusServico.DISPONIVEL;
        this.criadoEm = Instant.now();
        this.atualizadoEm = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UsuarioEntity getProprietario() { return proprietario; }
    public void setProprietario(UsuarioEntity proprietario) { this.proprietario = proprietario; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public StatusServico getStatus() { return status; }
    public void setStatus(StatusServico status) { this.status = status; }
    public Instant getCriadoEm() { return criadoEm; }
    public void setCriadoEm(Instant criadoEm) { this.criadoEm = criadoEm; }
    public Instant getAtualizadoEm() { return atualizadoEm; }
    public void setAtualizadoEm(Instant atualizadoEm) { this.atualizadoEm = atualizadoEm; }
}
