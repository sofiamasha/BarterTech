package br.com.bartertech.infrastructure.persistence.repository;

import br.com.bartertech.domain.StatusServico;
import br.com.bartertech.infrastructure.persistence.entity.ServicoEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpringDataServicoRepository extends JpaRepository<ServicoEntity, UUID> {

    List<ServicoEntity> findByProprietarioId(UUID proprietarioId);

    List<ServicoEntity> findByProprietarioIdAndStatus(UUID proprietarioId, StatusServico status);

    @Query("SELECT s FROM ServicoEntity s JOIN FETCH s.proprietario p " +
           "WHERE s.status = :status AND p.ativo = true " +
           "AND (:busca IS NULL OR LOWER(s.titulo) LIKE LOWER(CONCAT('%', :busca, '%')) " +
           "     OR LOWER(s.descricao) LIKE LOWER(CONCAT('%', :busca, '%')) " +
           "     OR LOWER(s.tipo) LIKE LOWER(CONCAT('%', :busca, '%'))) " +
           "AND (:categoria IS NULL OR LOWER(s.categoria) = LOWER(:categoria)) " +
           "AND (:proprietarioExcetoId IS NULL OR p.id != :proprietarioExcetoId)")
    Page<ServicoEntity> pesquisarPublicos(
            @Param("status") StatusServico status,
            @Param("busca") String busca,
            @Param("categoria") String categoria,
            @Param("proprietarioExcetoId") UUID proprietarioExcetoId,
            Pageable pageable
    );

    @Query("SELECT s FROM ServicoEntity s JOIN FETCH s.proprietario p " +
           "WHERE s.status = 'DISPONIVEL' AND p.ativo = true")
    List<ServicoEntity> findAllDisponiveisComProprietario();

    @Query("SELECT DISTINCT s.categoria FROM ServicoEntity s WHERE s.status = 'DISPONIVEL' ORDER BY s.categoria ASC")
    List<String> findDistinctCategorias();
}
