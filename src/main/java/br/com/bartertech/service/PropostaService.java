package br.com.bartertech.service;

import br.com.bartertech.domain.ContratoEscambo;
import br.com.bartertech.domain.IntegridadeContrato;
import br.com.bartertech.domain.PropostaTroca;
import br.com.bartertech.exception.PropostaExpiradaException;
import br.com.bartertech.exception.ServicoIndisponivelException;
import br.com.bartertech.exception.TrocaInvalidaException;
import br.com.bartertech.exception.UsuarioInativoException;
import br.com.bartertech.repository.Repositorio;

import java.time.Clock;
import java.time.Instant;
import java.util.Objects;

public final class PropostaService {
    private final Clock clock;
    private final Repositorio<PropostaTroca> propostas;
    private final Repositorio<ContratoEscambo> contratos;
    private final IntegridadeContrato integridade;

    public PropostaService(Clock clock, Repositorio<PropostaTroca> propostas,
                            Repositorio<ContratoEscambo> contratos, IntegridadeContrato integridade) {
        this.clock = Objects.requireNonNull(clock, "clock e obrigatorio");
        this.propostas = Objects.requireNonNull(propostas, "repositorio de propostas e obrigatorio");
        this.contratos = Objects.requireNonNull(contratos, "repositorio de contratos e obrigatorio");
        this.integridade = Objects.requireNonNull(integridade, "servico de integridade e obrigatorio");
    }

    public PropostaTroca criar(PropostaTroca proposta) {
        validarElegibilidade(proposta);
        return propostas.salvar(proposta);
    }

    public void aceitar(PropostaTroca proposta) {
        validarElegibilidade(proposta);
        proposta.aceitar(clock);
        propostas.salvar(proposta);
    }

    public void rejeitar(PropostaTroca proposta) {
        proposta.rejeitar(clock);
        propostas.salvar(proposta);
    }

    public ContratoEscambo gerarContrato(PropostaTroca proposta) {
        validarElegibilidade(proposta);
        if (proposta.status() != br.com.bartertech.domain.StatusProposta.ACEITA) {
            throw new TrocaInvalidaException("A proposta precisa estar aceita para gerar o contrato");
        }
        boolean pendenciaObrigatoria = proposta.condicoes().stream()
                .anyMatch(condicao -> condicao.obrigatoria() && !condicao.atendida());
        if (pendenciaObrigatoria) {
            throw new TrocaInvalidaException("Existem condicoes obrigatorias nao atendidas");
        }
        Instant agora = Instant.now(clock);
        String conteudo = ContratoEscambo.montarConteudo(proposta);
        ContratoEscambo contrato = new ContratoEscambo(proposta.id(), agora, conteudo, integridade.gerarHash(conteudo));
        return contratos.salvar(contrato);
    }

    private void validarElegibilidade(PropostaTroca proposta) {
        if (!proposta.solicitante().ativo() || !proposta.destinatario().ativo()) {
            throw new UsuarioInativoException("Os dois usuarios devem estar ativos");
        }
        if (proposta.expirada(clock)) {
            proposta.atualizarExpiracao(clock);
            throw new PropostaExpiradaException("A proposta esta expirada");
        }
        if (!proposta.servicoOferecido().disponivel() || !proposta.servicoSolicitado().disponivel()) {
            throw new ServicoIndisponivelException("Os dois servicos devem estar disponiveis");
        }
        if (proposta.solicitante().equals(proposta.destinatario())
                || !proposta.servicoOferecido().proprietarioId().equals(proposta.solicitante().id())
                || !proposta.servicoSolicitado().proprietarioId().equals(proposta.destinatario().id())
                || !proposta.solicitante().procura(proposta.servicoSolicitado().tipo())
                || !proposta.destinatario().procura(proposta.servicoOferecido().tipo())) {
            throw new TrocaInvalidaException("Os servicos nao representam uma troca reciproca compativel");
        }
    }
}
