package br.com.bartertech.service;

import br.com.bartertech.domain.Match;
import br.com.bartertech.domain.Servico;
import br.com.bartertech.domain.Usuario;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public final class MatchService {
    public List<Match> encontrarMatches(Collection<Usuario> usuarios) {
        List<Usuario> participantes = new ArrayList<>(usuarios);
        List<Match> matches = new ArrayList<>();
        for (int indiceA = 0; indiceA < participantes.size(); indiceA++) {
            Usuario usuarioA = participantes.get(indiceA);
            if (!usuarioA.ativo()) continue;
            for (int indiceB = indiceA + 1; indiceB < participantes.size(); indiceB++) {
                Usuario usuarioB = participantes.get(indiceB);
                if (!usuarioB.ativo()) continue;
                adicionarMatchesReciprocos(usuarioA, usuarioB, matches);
            }
        }
        return List.copyOf(matches);
    }

    private void adicionarMatchesReciprocos(Usuario usuarioA, Usuario usuarioB, List<Match> matches) {
        for (Servico servicoA : usuarioA.servicosOferecidos()) {
            for (Servico servicoB : usuarioB.servicosOferecidos()) {
                if (servicoA.disponivel() && servicoB.disponivel()
                        && usuarioA.procura(servicoB.tipo()) && usuarioB.procura(servicoA.tipo())) {
                    matches.add(new Match(usuarioA, usuarioB, servicoA, servicoB));
                }
            }
        }
    }
}
