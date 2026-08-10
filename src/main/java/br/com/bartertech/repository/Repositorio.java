package br.com.bartertech.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface Repositorio<T> {
    T salvar(T entidade);
    Optional<T> buscarPorId(UUID id);
    List<T> listar();
}
