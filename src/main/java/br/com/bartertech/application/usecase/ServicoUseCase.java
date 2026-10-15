package br.com.bartertech.application.usecase;

import br.com.bartertech.adapter.in.web.dto.AtualizarServicoRequest;
import br.com.bartertech.adapter.in.web.dto.CriarServicoRequest;
import br.com.bartertech.adapter.in.web.dto.ServicoResponse;
import br.com.bartertech.domain.StatusServico;
import br.com.bartertech.domain.Usuario;
import br.com.bartertech.exception.ResourceNotFoundException;
import br.com.bartertech.infrastructure.persistence.entity.ServicoEntity;
import br.com.bartertech.infrastructure.persistence.entity.UsuarioEntity;
import br.com.bartertech.infrastructure.persistence.repository.SpringDataServicoRepository;
import br.com.bartertech.infrastructure.persistence.repository.SpringDataUsuarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class ServicoUseCase {

    private final SpringDataServicoRepository servicoRepository;
    private final SpringDataUsuarioRepository usuarioRepository;

    public ServicoUseCase(SpringDataServicoRepository servicoRepository,
                          SpringDataUsuarioRepository usuarioRepository) {
        this.servicoRepository = servicoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public ServicoResponse criarServico(UUID usuarioId, CriarServicoRequest request) {
        UsuarioEntity proprietario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário proprietário não encontrado"));

        if (!proprietario.isAtivo()) {
            throw new IllegalStateException("Usuários inativos não podem publicar serviços");
        }

        String tipoNormalizado = normalizar(request.tipo());

        ServicoEntity entity = new ServicoEntity(
                UUID.randomUUID(),
                proprietario,
                request.titulo().trim(),
                tipoNormalizado,
                request.categoria().trim(),
                request.descricao().trim(),
                StatusServico.DISPONIVEL
        );

        ServicoEntity salvo = servicoRepository.save(entity);
        return toResponse(salvo);
    }

    @Transactional
    public ServicoResponse atualizarServico(UUID usuarioId, UUID servicoId, AtualizarServicoRequest request) {
        ServicoEntity servico = servicoRepository.findById(servicoId)
                .orElseThrow(() -> new ResourceNotFoundException("Serviço não encontrado"));

        if (!servico.getProprietario().getId().equals(usuarioId)) {
            throw new AccessDeniedException("Você não tem permissão para alterar este serviço");
        }

        servico.setTitulo(request.titulo().trim());
        servico.setTipo(normalizar(request.tipo()));
        servico.setCategoria(request.categoria().trim());
        servico.setDescricao(request.descricao().trim());
        servico.setStatus(request.status());
        servico.setAtualizadoEm(Instant.now());

        ServicoEntity salvo = servicoRepository.save(servico);
        return toResponse(salvo);
    }

    @Transactional
    public void alternarDisponibilidade(UUID usuarioId, UUID servicoId) {
        ServicoEntity servico = servicoRepository.findById(servicoId)
                .orElseThrow(() -> new ResourceNotFoundException("Serviço não encontrado"));

        if (!servico.getProprietario().getId().equals(usuarioId)) {
            throw new AccessDeniedException("Você não tem permissão para alterar este serviço");
        }

        if (servico.getStatus() == StatusServico.DISPONIVEL) {
            servico.setStatus(StatusServico.INDISPONIVEL);
        } else {
            servico.setStatus(StatusServico.DISPONIVEL);
        }
        servico.setAtualizadoEm(Instant.now());
        servicoRepository.save(servico);
    }

    @Transactional
    public void excluirServico(UUID usuarioId, UUID servicoId) {
        ServicoEntity servico = servicoRepository.findById(servicoId)
                .orElseThrow(() -> new ResourceNotFoundException("Serviço não encontrado"));

        if (!servico.getProprietario().getId().equals(usuarioId)) {
            throw new AccessDeniedException("Você não tem permissão para remover este serviço");
        }

        servicoRepository.delete(servico);
    }

    @Transactional(readOnly = true)
    public ServicoResponse obterPorId(UUID servicoId) {
        ServicoEntity servico = servicoRepository.findById(servicoId)
                .orElseThrow(() -> new ResourceNotFoundException("Serviço não encontrado"));
        return toResponse(servico);
    }

    @Transactional(readOnly = true)
    public Page<ServicoResponse> pesquisarPublicos(String busca, String categoria, UUID usuarioAtualId, Pageable pageable) {
        String buscaTratada = (busca != null && !busca.isBlank()) ? busca.trim() : null;
        String categoriaTratada = (categoria != null && !categoria.isBlank()) ? categoria.trim() : null;

        return servicoRepository.pesquisarPublicos(
                StatusServico.DISPONIVEL,
                buscaTratada,
                categoriaTratada,
                usuarioAtualId,
                pageable
        ).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<ServicoResponse> listarMeusServicos(UUID usuarioId) {
        return servicoRepository.findByProprietarioId(usuarioId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<String> listarCategorias() {
        return servicoRepository.findDistinctCategorias();
    }

    public ServicoResponse toResponse(ServicoEntity entity) {
        UsuarioEntity p = entity.getProprietario();
        return new ServicoResponse(
                entity.getId(),
                p.getId(),
                p.getNome(),
                p.getEmail(),
                p.getAvatarUrl(),
                p.getLocalizacao(),
                entity.getTitulo(),
                entity.getTipo(),
                entity.getCategoria(),
                entity.getDescricao(),
                entity.getStatus(),
                entity.getCriadoEm()
        );
    }

    private static String normalizar(String valor) {
        return valor != null ? valor.trim().toLowerCase() : "";
    }
}
