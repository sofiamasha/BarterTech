package br.com.bartertech.application.usecase;

import br.com.bartertech.adapter.in.web.dto.MatchExplicadoResponse;
import br.com.bartertech.domain.StatusServico;
import br.com.bartertech.exception.ResourceNotFoundException;
import br.com.bartertech.infrastructure.persistence.entity.ServicoEntity;
import br.com.bartertech.infrastructure.persistence.entity.UsuarioEntity;
import br.com.bartertech.infrastructure.persistence.repository.SpringDataPropostaRepository;
import br.com.bartertech.infrastructure.persistence.repository.SpringDataServicoRepository;
import br.com.bartertech.infrastructure.persistence.repository.SpringDataUsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class MatchUseCase {

    private final SpringDataUsuarioRepository usuarioRepository;
    private final SpringDataServicoRepository servicoRepository;
    private final SpringDataPropostaRepository propostaRepository;

    public MatchUseCase(SpringDataUsuarioRepository usuarioRepository,
                        SpringDataServicoRepository servicoRepository,
                        SpringDataPropostaRepository propostaRepository) {
        this.usuarioRepository = usuarioRepository;
        this.servicoRepository = servicoRepository;
        this.propostaRepository = propostaRepository;
    }

    @Transactional(readOnly = true)
    public List<MatchExplicadoResponse> encontrarMatchesParaUsuario(UUID usuarioId) {
        UsuarioEntity usuarioAtual = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        if (!usuarioAtual.isAtivo()) {
            return Collections.emptyList();
        }

        List<ServicoEntity> meusServicosDisponiveis = servicoRepository.findByProprietarioIdAndStatus(
                usuarioId, StatusServico.DISPONIVEL
        );

        Set<String> meusInteresses = usuarioAtual.getInteresses();

        if (meusServicosDisponiveis.isEmpty() || meusInteresses.isEmpty()) {
            return Collections.emptyList();
        }

        // Buscar todos os serviços disponíveis de outros usuários ativos
        List<ServicoEntity> outrosServicos = servicoRepository.findAllDisponiveisComProprietario().stream()
                .filter(s -> !s.getProprietario().getId().equals(usuarioId))
                .toList();

        List<MatchExplicadoResponse> matches = new ArrayList<>();
        Set<String> combinacoesProcessadas = new HashSet<>();

        for (ServicoEntity meuServico : meusServicosDisponiveis) {
            String meuTipo = normalizar(meuServico.getTipo());

            for (ServicoEntity servicoOutro : outrosServicos) {
                UsuarioEntity outroUsuario = servicoOutro.getProprietario();
                String tipoOutro = normalizar(servicoOutro.getTipo());

                // Condição 1: Eu procuro o que ele oferece?
                boolean euProcuroEle = meusInteresses.contains(tipoOutro)
                        || meusInteresses.stream().anyMatch(interesse -> tipoOutro.contains(interesse) || interesse.contains(tipoOutro));

                // Condição 2: Ele procura o que eu ofereço?
                Set<String> interessesDele = outroUsuario.getInteresses();
                boolean eleProcuraEu = interessesDele.contains(meuTipo)
                        || interessesDele.stream().anyMatch(interesse -> meuTipo.contains(interesse) || interesse.contains(meuTipo));

                if (euProcuroEle && eleProcuraEu) {
                    String chavePar = meuServico.getId() + "_" + servicoOutro.getId();
                    if (!combinacoesProcessadas.contains(chavePar)) {
                        combinacoesProcessadas.add(chavePar);

                        boolean propostaPendente = propostaRepository.existsPropostaPendenteEntre(
                                usuarioId, outroUsuario.getId()
                        );

                        int score = calcularScore(meuServico, servicoOutro, meusInteresses, interessesDele);

                        String motivo = String.format(
                                "Combinação recíproca confirmada: Você oferece \"%s\" (%s) que %s procura, e %s oferece \"%s\" (%s) que coincide com seus interesses cadastrados.",
                                meuServico.getTitulo(), meuServico.getTipo(),
                                outroUsuario.getNome(), outroUsuario.getNome(),
                                servicoOutro.getTitulo(), servicoOutro.getTipo()
                        );

                        matches.add(new MatchExplicadoResponse(
                                outroUsuario.getId(),
                                outroUsuario.getNome(),
                                outroUsuario.getEmail(),
                                outroUsuario.getAvatarUrl(),
                                outroUsuario.getBio(),
                                outroUsuario.getLocalizacao(),
                                meuServico.getId(),
                                meuServico.getTitulo(),
                                meuServico.getTipo(),
                                servicoOutro.getId(),
                                servicoOutro.getTitulo(),
                                servicoOutro.getTipo(),
                                motivo,
                                score,
                                propostaPendente
                        ));
                    }
                }
            }
        }

        // Ordenar por score decrescente
        matches.sort((m1, m2) -> Integer.compare(m2.scoreCompatibilidade(), m1.scoreCompatibilidade()));
        return matches;
    }

    private int calcularScore(ServicoEntity meuServico, ServicoEntity servicoOutro,
                              Set<String> meusInteresses, Set<String> interessesDele) {
        int score = 80; // Base para match recíproco confirmado
        if (meusInteresses.contains(normalizar(servicoOutro.getTipo()))) {
            score += 10;
        }
        if (interessesDele.contains(normalizar(meuServico.getTipo()))) {
            score += 10;
        }
        return Math.min(100, score);
    }

    private static String normalizar(String valor) {
        return valor != null ? valor.trim().toLowerCase() : "";
    }
}
