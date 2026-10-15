package br.com.bartertech.application.usecase;

import br.com.bartertech.adapter.in.web.dto.*;
import br.com.bartertech.domain.StatusProposta;
import br.com.bartertech.domain.StatusServico;
import br.com.bartertech.exception.PropostaExpiradaException;
import br.com.bartertech.exception.ResourceNotFoundException;
import br.com.bartertech.exception.ServicoIndisponivelException;
import br.com.bartertech.exception.TrocaInvalidaException;
import br.com.bartertech.exception.UsuarioInativoException;
import br.com.bartertech.infrastructure.persistence.entity.*;
import br.com.bartertech.infrastructure.persistence.repository.SpringDataContratoRepository;
import br.com.bartertech.infrastructure.persistence.repository.SpringDataPropostaRepository;
import br.com.bartertech.infrastructure.persistence.repository.SpringDataServicoRepository;
import br.com.bartertech.infrastructure.persistence.repository.SpringDataUsuarioRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.util.*;

@Service
public class PropostaUseCase {

    private final SpringDataPropostaRepository propostaRepository;
    private final SpringDataUsuarioRepository usuarioRepository;
    private final SpringDataServicoRepository servicoRepository;
    private final SpringDataContratoRepository contratoRepository;
    private final ServicoUseCase servicoUseCase;
    private final Clock clock;

    public PropostaUseCase(SpringDataPropostaRepository propostaRepository,
                           SpringDataUsuarioRepository usuarioRepository,
                           SpringDataServicoRepository servicoRepository,
                           SpringDataContratoRepository contratoRepository,
                           ServicoUseCase servicoUseCase,
                           Clock clock) {
        this.propostaRepository = propostaRepository;
        this.usuarioRepository = usuarioRepository;
        this.servicoRepository = servicoRepository;
        this.contratoRepository = contratoRepository;
        this.servicoUseCase = servicoUseCase;
        this.clock = clock;
    }

    @Transactional
    public PropostaResponse criarProposta(UUID solicitanteId, CriarPropostaRequest request) {
        if (solicitanteId.equals(request.destinatarioId())) {
            throw new TrocaInvalidaException("Não é possível criar uma proposta de troca consigo mesmo");
        }

        UsuarioEntity solicitante = usuarioRepository.findById(solicitanteId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário solicitante não encontrado"));
        UsuarioEntity destinatario = usuarioRepository.findById(request.destinatarioId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário destinatário não encontrado"));

        if (!solicitante.isAtivo() || !destinatario.isAtivo()) {
            throw new UsuarioInativoException("Ambos os participantes devem ter contas ativas para negociar");
        }

        ServicoEntity servicoOferecido = servicoRepository.findById(request.servicoOferecidoId())
                .orElseThrow(() -> new ResourceNotFoundException("Serviço oferecido não encontrado"));
        ServicoEntity servicoSolicitado = servicoRepository.findById(request.servicoSolicitadoId())
                .orElseThrow(() -> new ResourceNotFoundException("Serviço solicitado não encontrado"));

        if (!servicoOferecido.getProprietario().getId().equals(solicitanteId)) {
            throw new TrocaInvalidaException("O serviço oferecido deve pertencer ao proponente");
        }

        if (!servicoSolicitado.getProprietario().getId().equals(destinatario.getId())) {
            throw new TrocaInvalidaException("O serviço solicitado deve pertencer ao destinatário");
        }

        if (servicoOferecido.getStatus() != StatusServico.DISPONIVEL || servicoSolicitado.getStatus() != StatusServico.DISPONIVEL) {
            throw new ServicoIndisponivelException("Ambos os serviços precisam estar com status DISPONÍVEL");
        }

        Instant agora = Instant.now(clock);
        if (!request.expiraEm().isAfter(agora)) {
            throw new PropostaExpiradaException("A data de expiração da proposta deve estar no futuro");
        }

        PropostaEntity proposta = new PropostaEntity(
                UUID.randomUUID(),
                solicitante,
                destinatario,
                servicoOferecido,
                servicoSolicitado,
                agora,
                request.expiraEm(),
                StatusProposta.PENDENTE,
                request.mensagem()
        );

        if (request.condicoes() != null && !request.condicoes().isEmpty()) {
            for (CondicaoItemRequest item : request.condicoes()) {
                if (item.descricao() != null && !item.descricao().isBlank()) {
                    CondicaoEntity cond = new CondicaoEntity(
                            UUID.randomUUID(),
                            proposta,
                            item.descricao().trim(),
                            item.obrigatoria(),
                            false
                    );
                    proposta.getCondicoes().add(cond);
                }
            }
        }

        HistoricoPropostaEntity historicoInicial = new HistoricoPropostaEntity(
                UUID.randomUUID(),
                proposta,
                StatusProposta.PENDENTE,
                "Proposta enviada pelo proponente",
                agora
        );
        proposta.getHistorico().add(historicoInicial);

        PropostaEntity salva = propostaRepository.save(proposta);
        return toResponse(salva, solicitanteId);
    }

    @Transactional
    public PropostaResponse aceitar(UUID propostaId, UUID usuarioDestinatarioId) {
        PropostaEntity proposta = buscarEVerificarExpiracao(propostaId);

        if (!proposta.getDestinatario().getId().equals(usuarioDestinatarioId)) {
            throw new AccessDeniedException("Apenas o destinatário da proposta pode aceitá-la");
        }

        if (proposta.getStatus() != StatusProposta.PENDENTE) {
            throw new IllegalStateException("Apenas propostas com status PENDENTE podem ser aceitas");
        }

        Instant agora = Instant.now(clock);
        proposta.setStatus(StatusProposta.ACEITA);

        HistoricoPropostaEntity historico = new HistoricoPropostaEntity(
                UUID.randomUUID(),
                proposta,
                StatusProposta.ACEITA,
                "Proposta aceita pelo destinatário",
                agora
        );
        proposta.getHistorico().add(historico);

        PropostaEntity salva = propostaRepository.save(proposta);
        return toResponse(salva, usuarioDestinatarioId);
    }

    @Transactional
    public PropostaResponse rejeitar(UUID propostaId, UUID usuarioDestinatarioId) {
        PropostaEntity proposta = buscarEVerificarExpiracao(propostaId);

        if (!proposta.getDestinatario().getId().equals(usuarioDestinatarioId)) {
            throw new AccessDeniedException("Apenas o destinatário da proposta pode rejeitá-la");
        }

        if (proposta.getStatus() != StatusProposta.PENDENTE) {
            throw new IllegalStateException("Apenas propostas pendentes podem ser rejeitadas");
        }

        Instant agora = Instant.now(clock);
        proposta.setStatus(StatusProposta.REJEITADA);

        HistoricoPropostaEntity historico = new HistoricoPropostaEntity(
                UUID.randomUUID(),
                proposta,
                StatusProposta.REJEITADA,
                "Proposta recusada pelo destinatário",
                agora
        );
        proposta.getHistorico().add(historico);

        PropostaEntity salva = propostaRepository.save(proposta);
        return toResponse(salva, usuarioDestinatarioId);
    }

    @Transactional
    public PropostaResponse cancelar(UUID propostaId, UUID usuarioSolicitanteId) {
        PropostaEntity proposta = buscarEVerificarExpiracao(propostaId);

        if (!proposta.getSolicitante().getId().equals(usuarioSolicitanteId)) {
            throw new AccessDeniedException("Apenas quem enviou a proposta pode cancelá-la");
        }

        if (proposta.getStatus() != StatusProposta.PENDENTE) {
            throw new IllegalStateException("Apenas propostas pendentes podem ser canceladas");
        }

        Instant agora = Instant.now(clock);
        proposta.setStatus(StatusProposta.REJEITADA);

        HistoricoPropostaEntity historico = new HistoricoPropostaEntity(
                UUID.randomUUID(),
                proposta,
                StatusProposta.REJEITADA,
                "Proposta cancelada pelo próprio solicitante",
                agora
        );
        proposta.getHistorico().add(historico);

        PropostaEntity salva = propostaRepository.save(proposta);
        return toResponse(salva, usuarioSolicitanteId);
    }

    @Transactional
    public PropostaResponse alternarCondicao(UUID propostaId, UUID condicaoId, UUID usuarioId) {
        PropostaEntity proposta = propostaRepository.findById(propostaId)
                .orElseThrow(() -> new ResourceNotFoundException("Proposta não encontrada"));

        boolean ehParticipante = proposta.getSolicitante().getId().equals(usuarioId)
                || proposta.getDestinatario().getId().equals(usuarioId);

        if (!ehParticipante) {
            throw new AccessDeniedException("Apenas os participantes da negociação podem alterar as condições");
        }

        CondicaoEntity condicao = proposta.getCondicoes().stream()
                .filter(c -> c.getId().equals(condicaoId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Condição não encontrada"));

        condicao.setAtendida(!condicao.isAtendida());
        PropostaEntity salva = propostaRepository.save(proposta);
        return toResponse(salva, usuarioId);
    }

    @Transactional(readOnly = true)
    public PropostaResponse obterPorId(UUID propostaId, UUID usuarioId) {
        PropostaEntity proposta = buscarEVerificarExpiracao(propostaId);
        boolean ehParticipante = proposta.getSolicitante().getId().equals(usuarioId)
                || proposta.getDestinatario().getId().equals(usuarioId);

        if (!ehParticipante) {
            throw new AccessDeniedException("Você não tem acesso a esta proposta");
        }

        return toResponse(proposta, usuarioId);
    }

    @Transactional(readOnly = true)
    public List<PropostaResponse> listarEnviadas(UUID solicitanteId) {
        return propostaRepository.findBySolicitanteIdOrderByCriadaEmDesc(solicitanteId).stream()
                .map(p -> toResponse(p, solicitanteId))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PropostaResponse> listarRecebidas(UUID destinatarioId) {
        return propostaRepository.findByDestinatarioIdOrderByCriadaEmDesc(destinatarioId).stream()
                .map(p -> toResponse(p, destinatarioId))
                .toList();
    }

    private PropostaEntity buscarEVerificarExpiracao(UUID propostaId) {
        PropostaEntity proposta = propostaRepository.findById(propostaId)
                .orElseThrow(() -> new ResourceNotFoundException("Proposta não encontrada"));

        Instant agora = Instant.now(clock);
        if (proposta.getStatus() == StatusProposta.PENDENTE && agora.isAfter(proposta.getExpiraEm())) {
            proposta.setStatus(StatusProposta.EXPIRADA);
            proposta.getHistorico().add(new HistoricoPropostaEntity(
                    UUID.randomUUID(),
                    proposta,
                    StatusProposta.EXPIRADA,
                    "Prazo de validade da proposta expirou",
                    agora
            ));
            propostaRepository.save(proposta);
        }

        return proposta;
    }

    public PropostaResponse toResponse(PropostaEntity entity, UUID usuarioAtualId) {
        boolean ehSolicitante = entity.getSolicitante().getId().equals(usuarioAtualId);
        boolean ehDestinatario = entity.getDestinatario().getId().equals(usuarioAtualId);
        boolean pendente = entity.getStatus() == StatusProposta.PENDENTE;
        boolean aceita = entity.getStatus() == StatusProposta.ACEITA;

        Optional<ContratoEntity> contratoOpt = contratoRepository.findByPropostaId(entity.getId());
        UUID contratoId = contratoOpt.map(ContratoEntity::getId).orElse(null);

        boolean todasObrigatoriasAtendidas = entity.getCondicoes().stream()
                .noneMatch(c -> c.isObrigatoria() && !c.isAtendida());

        boolean podeAceitar = ehDestinatario && pendente;
        boolean podeRejeitar = ehDestinatario && pendente;
        boolean podeCancelar = ehSolicitante && pendente;
        boolean podeGerarContrato = aceita && contratoId == null && todasObrigatoriasAtendidas;

        List<CondicaoResponse> condicoes = entity.getCondicoes().stream()
                .map(c -> new CondicaoResponse(c.getId(), c.getDescricao(), c.isObrigatoria(), c.isAtendida()))
                .toList();

        List<HistoricoPropostaResponse> historico = entity.getHistorico().stream()
                .map(h -> new HistoricoPropostaResponse(h.getId(), h.getStatus(), h.getObservacao(), h.getOcorridoEm()))
                .toList();

        return new PropostaResponse(
                entity.getId(),
                AuthUseCase.toResponse(entity.getSolicitante()),
                AuthUseCase.toResponse(entity.getDestinatario()),
                servicoUseCase.toResponse(entity.getServicoOferecido()),
                servicoUseCase.toResponse(entity.getServicoSolicitado()),
                entity.getStatus(),
                entity.getMensagem(),
                entity.getCriadaEm(),
                entity.getExpiraEm(),
                condicoes,
                historico,
                contratoId,
                podeAceitar,
                podeRejeitar,
                podeCancelar,
                podeGerarContrato
        );
    }
}
