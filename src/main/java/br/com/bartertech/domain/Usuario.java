package br.com.bartertech.domain;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

public final class Usuario {
    private final UUID id;
    private final String nome;
    private final String email;
    private boolean ativo;
    private final List<Servico> servicosOferecidos = new ArrayList<>();
    private final Set<String> interesses = new LinkedHashSet<>();

    public Usuario(String nome, String email) {
        this(UUID.randomUUID(), nome, email, true);
    }

    public Usuario(UUID id, String nome, String email, boolean ativo) {
        this.id = Objects.requireNonNull(id, "id e obrigatorio");
        this.nome = textoObrigatorio(nome, "nome");
        this.email = textoObrigatorio(email, "email");
        this.ativo = ativo;
    }

    public void oferecerServico(Servico servico) {
        Servico item = Objects.requireNonNull(servico, "servico e obrigatorio");
        if (!item.proprietarioId().equals(id)) {
            throw new IllegalArgumentException("O servico deve pertencer ao usuario");
        }
        servicosOferecidos.add(item);
    }

    public void definirInteresses(Collection<String> novosInteresses) {
        Objects.requireNonNull(novosInteresses, "interesses sao obrigatorios");
        interesses.clear();
        novosInteresses.stream().map(Usuario::normalizar).forEach(interesses::add);
    }

    public boolean procura(String tipoServico) {
        return interesses.contains(normalizar(tipoServico));
    }

    public void desativar() {
        ativo = false;
    }

    public void ativar() {
        ativo = true;
    }

    public UUID id() { return id; }
    public String nome() { return nome; }
    public String email() { return email; }
    public boolean ativo() { return ativo; }
    public List<Servico> servicosOferecidos() { return Collections.unmodifiableList(servicosOferecidos); }
    public Set<String> interesses() { return Collections.unmodifiableSet(interesses); }

    static String normalizar(String valor) {
        return textoObrigatorio(valor, "tipo de servico").trim().toLowerCase();
    }

    private static String textoObrigatorio(String valor, String campo) {
        if (valor == null || valor.isBlank()) {
            throw new IllegalArgumentException(campo + " e obrigatorio");
        }
        return valor.trim();
    }
}
