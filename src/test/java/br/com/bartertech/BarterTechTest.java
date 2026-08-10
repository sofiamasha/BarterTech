package br.com.bartertech;

import br.com.bartertech.domain.CondicaoContrato;
import br.com.bartertech.domain.ContratoEscambo;
import br.com.bartertech.domain.PropostaTroca;
import br.com.bartertech.domain.Servico;
import br.com.bartertech.domain.StatusProposta;
import br.com.bartertech.domain.Usuario;
import br.com.bartertech.exception.PropostaExpiradaException;
import br.com.bartertech.exception.ServicoIndisponivelException;
import br.com.bartertech.exception.TrocaInvalidaException;
import br.com.bartertech.exception.UsuarioInativoException;
import br.com.bartertech.repository.RepositorioEmMemoria;
import br.com.bartertech.service.HashSha256Service;
import br.com.bartertech.service.MatchService;
import br.com.bartertech.service.PropostaService;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class BarterTechTest {
    private final Clock clock = Clock.fixed(Instant.parse("2026-08-10T12:00:00Z"), ZoneOffset.UTC);

    @Test
    void criaUsuarioAtivoComDadosValidos() {
        Usuario usuario = new Usuario("Ana Silva", "ana@example.com");
        assertTrue(usuario.ativo());
        assertEquals("Ana Silva", usuario.nome());
    }

    @Test
    void cadastraServicoParaSeuProprietario() {
        Usuario usuario = new Usuario("Ana", "ana@example.com");
        Servico servico = new Servico(usuario.id(), "Design", "Logo para aplicativo");
        usuario.oferecerServico(servico);
        assertEquals(1, usuario.servicosOferecidos().size());
        assertTrue(servico.disponivel());
    }

    @Test
    void encontraMatchReciprocoValido() {
        Cenario cenario = cenarioCompativel();
        assertEquals(1, new MatchService().encontrarMatches(List.of(cenario.ana, cenario.bruno)).size());
    }

    @Test
    void naoEncontraMatchQuandoInteresseNaoEReciproco() {
        Cenario cenario = cenarioCompativel();
        cenario.bruno.definirInteresses(List.of("programacao"));
        assertTrue(new MatchService().encontrarMatches(List.of(cenario.ana, cenario.bruno)).isEmpty());
    }

    @Test
    void rejeitaPropostaComServicosIncompativeis() {
        Cenario cenario = cenarioCompativel();
        cenario.bruno.definirInteresses(List.of("programacao"));
        assertThrows(TrocaInvalidaException.class, () -> service().criar(proposta(cenario, Duration.ofDays(1), List.of())));
    }

    @Test
    void rejeitaPropostaComServicoIndisponivel() {
        Cenario cenario = cenarioCompativel();
        cenario.ingles.tornarIndisponivel();
        assertThrows(ServicoIndisponivelException.class, () -> service().criar(proposta(cenario, Duration.ofDays(1), List.of())));
    }

    @Test
    void rejeitaPropostaQuandoUsuarioEstaInativo() {
        Cenario cenario = cenarioCompativel();
        cenario.bruno.desativar();
        assertThrows(UsuarioInativoException.class, () -> service().criar(proposta(cenario, Duration.ofDays(1), List.of())));
    }

    @Test
    void rejeitaPropostaExpirada() {
        Cenario cenario = cenarioCompativel();
        Clock antesDaExpiracao = Clock.fixed(Instant.now(clock).minus(Duration.ofDays(2)), ZoneOffset.UTC);
        PropostaTroca proposta = new PropostaTroca(cenario.ana, cenario.bruno, cenario.design, cenario.ingles,
                Instant.now(clock).minus(Duration.ofDays(1)), List.of(), antesDaExpiracao);
        assertThrows(PropostaExpiradaException.class, () -> service().criar(proposta));
    }

    @Test
    void criaContratoParaPropostaAceitaComCondicoesAtendidas() {
        Cenario cenario = cenarioCompativel();
        CondicaoContrato condicao = new CondicaoContrato("Definir horario da entrega", true);
        condicao.marcarComoAtendida();
        PropostaTroca proposta = proposta(cenario, Duration.ofDays(1), List.of(condicao));
        PropostaService service = service();
        service.criar(proposta);
        service.aceitar(proposta);
        ContratoEscambo contrato = service.gerarContrato(proposta);
        assertEquals(StatusProposta.ACEITA, proposta.status());
        assertEquals(List.of(StatusProposta.PENDENTE, StatusProposta.ACEITA),
                proposta.historico().stream().map(registro -> registro.status()).toList());
        assertEquals(proposta.id(), contrato.propostaId());
        assertFalse(contrato.hashIntegridade().isBlank());
    }

    @Test
    void verificaIntegridadeEIdentificaAlteracaoNoConteudo() {
        Cenario cenario = cenarioCompativel();
        PropostaTroca proposta = proposta(cenario, Duration.ofDays(1), List.of());
        PropostaService service = service();
        service.criar(proposta);
        service.aceitar(proposta);
        ContratoEscambo contrato = service.gerarContrato(proposta);
        HashSha256Service hash = new HashSha256Service();
        assertTrue(contrato.possuiIntegridade(hash));
        assertNotEquals(contrato.hashIntegridade(), hash.gerarHash(contrato.conteudo() + " alteracao"));
    }

    @Test
    void naoGeraContratoComCondicaoObrigatoriaPendente() {
        Cenario cenario = cenarioCompativel();
        PropostaTroca proposta = proposta(cenario, Duration.ofDays(1), List.of(new CondicaoContrato("Confirmar local", true)));
        PropostaService service = service();
        service.criar(proposta);
        service.aceitar(proposta);
        assertThrows(TrocaInvalidaException.class, () -> service.gerarContrato(proposta));
    }

    private PropostaService service() {
        return new PropostaService(clock, new RepositorioEmMemoria<>(PropostaTroca::id),
                new RepositorioEmMemoria<>(ContratoEscambo::id), new HashSha256Service());
    }

    private PropostaTroca proposta(Cenario cenario, Duration prazo, List<CondicaoContrato> condicoes) {
        return new PropostaTroca(cenario.ana, cenario.bruno, cenario.design, cenario.ingles,
                Instant.now(clock).plus(prazo), condicoes, clock);
    }

    private Cenario cenarioCompativel() {
        Usuario ana = new Usuario("Ana", "ana@example.com");
        Usuario bruno = new Usuario("Bruno", "bruno@example.com");
        Servico design = new Servico(ana.id(), "design", "Identidade visual");
        Servico ingles = new Servico(bruno.id(), "ingles", "Aulas de conversacao");
        ana.oferecerServico(design);
        bruno.oferecerServico(ingles);
        ana.definirInteresses(List.of("ingles"));
        bruno.definirInteresses(List.of("design"));
        return new Cenario(ana, bruno, design, ingles);
    }

    private record Cenario(Usuario ana, Usuario bruno, Servico design, Servico ingles) { }
}
