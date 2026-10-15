package br.com.bartertech.infrastructure.persistence.repository;

import br.com.bartertech.infrastructure.persistence.entity.ContratoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SpringDataContratoRepository extends JpaRepository<ContratoEntity, UUID> {

    Optional<ContratoEntity> findByPropostaId(UUID propostaId);

    @Query("SELECT c FROM ContratoEntity c " +
           "JOIN FETCH c.proposta p " +
           "JOIN FETCH p.solicitante s " +
           "JOIN FETCH p.destinatario d " +
           "JOIN FETCH p.servicoOferecido so " +
           "JOIN FETCH p.servicoSolicitado ss " +
           "WHERE p.solicitante.id = :usuarioId OR p.destinatario.id = :usuarioId " +
           "ORDER BY c.geradoEm DESC")
    List<ContratoEntity> findAllByUsuarioId(@Param("usuarioId") UUID usuarioId);
}
