package br.com.bartertech.repository;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;

public final class RepositorioEmMemoria<T> implements Repositorio<T> {
    private final Map<UUID, T> dados = new LinkedHashMap<>();
    private final Function<T, UUID> extrairId;

    public RepositorioEmMemoria(Function<T, UUID> extrairId) {
        this.extrairId = extrairId;
    }

    public T salvar(T entidade) {
        dados.put(extrairId.apply(entidade), entidade);
        return entidade;
    }

    public Optional<T> buscarPorId(UUID id) { return Optional.ofNullable(dados.get(id)); }
    public List<T> listar() { return new ArrayList<>(dados.values()); }
}
