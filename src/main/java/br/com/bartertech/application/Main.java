package br.com.bartertech.application;

import br.com.bartertech.domain.ContratoEscambo;
import br.com.bartertech.domain.PropostaTroca;
import br.com.bartertech.domain.Servico;
import br.com.bartertech.domain.Usuario;
import br.com.bartertech.repository.RepositorioEmMemoria;
import br.com.bartertech.service.HashSha256Service;
import br.com.bartertech.service.MatchService;
import br.com.bartertech.service.PropostaService;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.List;

public final class Main {
    private Main() { }

    public static void main(String[] args) {
        Clock clock = Clock.systemUTC();
        Usuario ana = new Usuario("Ana", "ana@bartertech.dev");
        Usuario bruno = new Usuario("Bruno", "bruno@bartertech.dev");
        Servico design = new Servico(ana.id(), "design", "Identidade visual para um projeto");
        Servico ingles = new Servico(bruno.id(), "ingles", "Conversacao em ingles por video");
        ana.oferecerServico(design);
        bruno.oferecerServico(ingles);
        ana.definirInteresses(List.of("ingles"));
        bruno.definirInteresses(List.of("design"));

        System.out.println("Matches encontrados: " + new MatchService().encontrarMatches(List.of(ana, bruno)).size());
        PropostaTroca proposta = new PropostaTroca(ana, bruno, design, ingles,
                Instant.now(clock).plus(Duration.ofDays(7)), List.of(), clock);
        PropostaService propostas = new PropostaService(clock,
                new RepositorioEmMemoria<>(PropostaTroca::id),
                new RepositorioEmMemoria<>(ContratoEscambo::id), new HashSha256Service());
        propostas.criar(proposta);
        propostas.aceitar(proposta);
        ContratoEscambo contrato = propostas.gerarContrato(proposta);
        System.out.println("Contrato gerado: " + contrato.id());
        System.out.println("Hash de integridade: " + contrato.hashIntegridade());
    }
}
