package br.com.bartertech.infrastructure.persistence.repository;

import br.com.bartertech.infrastructure.persistence.entity.UsuarioEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SpringDataUsuarioRepository extends JpaRepository<UsuarioEntity, UUID> {
    Optional<UsuarioEntity> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);

    @Query("SELECT u FROM UsuarioEntity u WHERE u.ativo = true AND u.id != :usuarioId")
    List<UsuarioEntity> findAllAtivosExceto(@Param("usuarioId") UUID usuarioId);
}
