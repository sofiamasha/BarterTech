package br.com.bartertech.adapter.in.web;

import br.com.bartertech.adapter.in.web.dto.MatchExplicadoResponse;
import br.com.bartertech.application.usecase.MatchUseCase;
import br.com.bartertech.infrastructure.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/matches")
@Tag(name = "Matching", description = "Algoritmo de combinações recíprocas e compatibilidade mútua de escambo")
public class MatchController {

    private final MatchUseCase matchUseCase;

    public MatchController(MatchUseCase matchUseCase) {
        this.matchUseCase = matchUseCase;
    }

    @GetMapping
    @Operation(summary = "Obter matches recíprocos compatíveis para o usuário autenticado com explicação detalhada")
    public ResponseEntity<List<MatchExplicadoResponse>> obterMeusMatches() {
        UUID usuarioId = SecurityUtils.getUsuarioIdAutenticado();
        List<MatchExplicadoResponse> matches = matchUseCase.encontrarMatchesParaUsuario(usuarioId);
        return ResponseEntity.ok(matches);
    }
}
