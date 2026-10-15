package br.com.bartertech.application.usecase;

import br.com.bartertech.adapter.in.web.dto.ContratoResponse;
import br.com.bartertech.adapter.in.web.dto.VerificacaoIntegridadeResponse;
import br.com.bartertech.domain.IntegridadeContrato;
import br.com.bartertech.domain.StatusProposta;
import br.com.bartertech.exception.ResourceNotFoundException;
import br.com.bartertech.exception.TrocaInvalidaException;
import br.com.bartertech.infrastructure.persistence.entity.CondicaoEntity;
import br.com.bartertech.infrastructure.persistence.entity.ContratoEntity;
import br.com.bartertech.infrastructure.persistence.entity.PropostaEntity;
import br.com.bartertech.infrastructure.persistence.repository.SpringDataContratoRepository;
import br.com.bartertech.infrastructure.persistence.repository.SpringDataPropostaRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.util.*;

@Service
public class ContratoUseCase {

    private final SpringDataContratoRepository contratoRepository;
    private final SpringDataPropostaRepository propostaRepository;
    private final PropostaUseCase propostaUseCase;
    private final IntegridadeContrato integridade;
    private final Clock clock;

    public ContratoUseCase(SpringDataContratoRepository contratoRepository,
                           SpringDataPropostaRepository propostaRepository,
                           PropostaUseCase propostaUseCase,
                           IntegridadeContrato integridade,
                           Clock clock) {
        this.contratoRepository = contratoRepository;
        this.propostaRepository = propostaRepository;
        this.propostaUseCase = propostaUseCase;
        this.integridade = integridade;
        this.clock = clock;
    }

    @Transactional
    public ContratoResponse gerarContrato(UUID propostaId, UUID usuarioSolicitanteId) {
        PropostaEntity proposta = propostaRepository.findById(propostaId)
                .orElseThrow(() -> new ResourceNotFoundException("Proposta não encontrada"));

        boolean ehParticipante = proposta.getSolicitante().getId().equals(usuarioSolicitanteId)
                || proposta.getDestinatario().getId().equals(usuarioSolicitanteId);

        if (!ehParticipante) {
            throw new AccessDeniedException("Apenas os participantes da negociação podem formalizar o contrato");
        }

        if (proposta.getStatus() != StatusProposta.ACEITA) {
            throw new TrocaInvalidaException("A proposta precisa estar com status ACEITA para gerar um contrato de escambo");
        }

        if (contratoRepository.findByPropostaId(propostaId).isPresent()) {
            throw new IllegalStateException("O contrato para esta proposta já foi formalizado anteriormente");
        }

        boolean pendenciaObrigatoria = proposta.getCondicoes().stream()
                .anyMatch(c -> c.isObrigatoria() && !c.isAtendida());

        if (pendenciaObrigatoria) {
            throw new TrocaInvalidaException("Existem condições contratuais obrigatórias que ainda não foram marcadas como atendidas");
        }

        Instant agora = Instant.now(clock);
        String conteudoCanonico = serializarConteudoCanonico(proposta, agora);
        String hash = integridade.gerarHash(conteudoCanonico);

        ContratoEntity contrato = new ContratoEntity(
                UUID.randomUUID(),
                proposta,
                agora,
                conteudoCanonico,
                hash
        );

        ContratoEntity salvo = contratoRepository.save(contrato);
        return toResponse(salvo, usuarioSolicitanteId);
    }

    @Transactional(readOnly = true)
    public ContratoResponse obterPorId(UUID contratoId, UUID usuarioAtualId) {
        ContratoEntity contrato = contratoRepository.findById(contratoId)
                .orElseThrow(() -> new ResourceNotFoundException("Contrato não encontrado"));

        PropostaEntity p = contrato.getProposta();
        boolean ehParticipante = p.getSolicitante().getId().equals(usuarioAtualId)
                || p.getDestinatario().getId().equals(usuarioAtualId);

        if (!ehParticipante) {
            throw new AccessDeniedException("Você não tem permissão para visualizar este contrato");
        }

        return toResponse(contrato, usuarioAtualId);
    }

    @Transactional(readOnly = true)
    public ContratoResponse obterPorPropostaId(UUID propostaId, UUID usuarioAtualId) {
        ContratoEntity contrato = contratoRepository.findByPropostaId(propostaId)
                .orElseThrow(() -> new ResourceNotFoundException("Contrato não encontrado para a proposta informada"));

        PropostaEntity p = contrato.getProposta();
        boolean ehParticipante = p.getSolicitante().getId().equals(usuarioAtualId)
                || p.getDestinatario().getId().equals(usuarioAtualId);

        if (!ehParticipante) {
            throw new AccessDeniedException("Você não tem permissão para visualizar este contrato");
        }

        return toResponse(contrato, usuarioAtualId);
    }

    @Transactional(readOnly = true)
    public List<ContratoResponse> listarMeusContratos(UUID usuarioId) {
        return contratoRepository.findAllByUsuarioId(usuarioId).stream()
                .map(c -> toResponse(c, usuarioId))
                .toList();
    }

    @Transactional(readOnly = true)
    public VerificacaoIntegridadeResponse verificarIntegridade(UUID contratoId) {
        ContratoEntity contrato = contratoRepository.findById(contratoId)
                .orElseThrow(() -> new ResourceNotFoundException("Contrato não encontrado"));

        String hashCalculado = integridade.gerarHash(contrato.getConteudo());
        boolean integro = contrato.getHashIntegridade().equalsIgnoreCase(hashCalculado);

        String mensagem = integro
                ? "Integridade criptográfica confirmada: O hash SHA-256 recalculado a partir do conteúdo canônico armazenado coincide perfeitamente com o registro original. Nenhum dado foi alterado."
                : "Alerta de violação: O hash calculado não coincide com o hash original registrado. O conteúdo do contrato sofreu modificação indevida.";

        return new VerificacaoIntegridadeResponse(
                contrato.getId(),
                contrato.getHashIntegridade(),
                hashCalculado,
                integro,
                mensagem
        );
    }

    public static String serializarConteudoCanonico(PropostaEntity p, Instant geradoEm) {
        // Serialização canônica determinística com ordenação lexicográfica de chaves
        List<String> condicoesSerializadas = p.getCondicoes().stream()
                .sorted(Comparator.comparing(CondicaoEntity::getDescricao))
                .map(c -> String.format("{\"desc\":\"%s\",\"obrig\":%b,\"atend\":%b}",
                        c.getDescricao().replace("\"", "\\\""),
                        c.isObrigatoria(),
                        c.isAtendida()))
                .toList();

        return String.format(
                "CANONICAL_BARTER_CONTRACT:v1\n" +
                "contrato.proposta_id=%s\n" +
                "contrato.gerado_em=%s\n" +
                "participante.solicitante.id=%s\n" +
                "participante.solicitante.nome=%s\n" +
                "participante.solicitante.email=%s\n" +
                "participante.destinatario.id=%s\n" +
                "participante.destinatario.nome=%s\n" +
                "participante.destinatario.email=%s\n" +
                "servico.oferecido.id=%s\n" +
                "servico.oferecido.titulo=%s\n" +
                "servico.oferecido.tipo=%s\n" +
                "servico.solicitado.id=%s\n" +
                "servico.solicitado.titulo=%s\n" +
                "servico.solicitado.tipo=%s\n" +
                "condicoes=[%s]",
                p.getId(),
                geradoEm,
                p.getSolicitante().getId(),
                p.getSolicitante().getNome(),
                p.getSolicitante().getEmail(),
                p.getDestinatario().getId(),
                p.getDestinatario().getNome(),
                p.getDestinatario().getEmail(),
                p.getServicoOferecido().getId(),
                p.getServicoOferecido().getTitulo(),
                p.getServicoOferecido().getTipo(),
                p.getServicoSolicitado().getId(),
                p.getServicoSolicitado().getTitulo(),
                p.getServicoSolicitado().getTipo(),
                String.join(",", condicoesSerializadas)
        );
    }

    private ContratoResponse toResponse(ContratoEntity entity, UUID usuarioAtualId) {
        String hashCalculado = integridade.gerarHash(entity.getConteudo());
        boolean integro = entity.getHashIntegridade().equalsIgnoreCase(hashCalculado);

        return new ContratoResponse(
                entity.getId(),
                entity.getProposta().getId(),
                propostaUseCase.toResponse(entity.getProposta(), usuarioAtualId),
                entity.getGeradoEm(),
                entity.getConteudo(),
                entity.getHashIntegridade(),
                integro
        );
    }
}
