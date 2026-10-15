package br.com.bartertech.infrastructure.persistence.repository;

import br.com.bartertech.domain.StatusProposta;
import br.com.bartertech.infrastructure.persistence.entity.PropostaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface SpringDataPropostaRepository extends JpaRepository<PropostaEntity, UUID> {

    @Query("SELECT p FROM PropostaEntity p " +
           "JOIN FETCH p.solicitante s " +
           "JOIN FETCH p.destinatario d " +
           "JOIN FETCH p.servicoOferecido so " +
           "JOIN FETCH p.servicoSolicitado ss " +
           "WHERE p.solicitante.id = :usuarioId " +
           "ORDER BY p.criadaEm DESC")
    List<PropostaEntity> findBySolicitanteIdOrderByCriadaEmDesc(@Param("usuarioId") UUID usuarioId);

    @Query("SELECT p FROM PropostaEntity p " +
           "JOIN FETCH p.solicitante s " +
           "JOIN FETCH p.destinatario d " +
           "JOIN FETCH p.servicoOferecido so " +
           "JOIN FETCH p.servicoSolicitado ss " +
           "WHERE p.destinatario.id = :usuarioId " +
           "ORDER BY p.criadaEm DESC")
    List<PropostaEntity> findByDestinatarioIdOrderByCriadaEmDesc(@Param("usuarioId") UUID usuarioId);

    @Query("SELECT p FROM PropostaEntity p " +
           "WHERE (p.solicitante.id = :usuarioId OR p.destinatario.id = :usuarioId) " +
           "ORDER BY p.criadaEm DESC")
    List<PropostaEntity> findAllByUsuarioId(@Param("usuarioId") UUID usuarioId);

    @Query("SELECT p FROM PropostaEntity p WHERE p.status = 'PENDENTE' AND p.expiraEm <= :agora")
    List<PropostaEntity> findExpiradas(@Param("agora") Instant agora);

    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM PropostaEntity p " +
           "WHERE ((p.solicitante.id = :u1 AND p.destinatario.id = :u2) " +
           "   OR (p.solicitante.id = :u2 AND p.destinatario.id = :u1)) " +
           "AND p.status = 'PENDENTE'")
    boolean existsPropostaPendenteEntre(@Param("u1") UUID u1, @Param("u2") UUID u2);
}
