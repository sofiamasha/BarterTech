package br.com.bartertech.adapter.in.web;

import br.com.bartertech.adapter.in.web.dto.CriarPropostaRequest;
import br.com.bartertech.adapter.in.web.dto.PropostaResponse;
import br.com.bartertech.application.usecase.PropostaUseCase;
import br.com.bartertech.infrastructure.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/propostas")
@Tag(name = "Propostas", description = "Ciclo de vida de propostas de escambo (envio, aceite, recusa, cancelamento e condições)")
public class PropostaController {

    private final PropostaUseCase propostaUseCase;

    public PropostaController(PropostaUseCase propostaUseCase) {
        this.propostaUseCase = propostaUseCase;
    }

    @PostMapping
    @Operation(summary = "Enviar uma nova proposta de troca de serviços")
    public ResponseEntity<PropostaResponse> criar(@Valid @RequestBody CriarPropostaRequest request) {
        UUID solicitanteId = SecurityUtils.getUsuarioIdAutenticado();
        PropostaResponse response = propostaUseCase.criarProposta(solicitanteId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/enviadas")
    @Operation(summary = "Listar todas as propostas enviadas pelo usuário logado")
    public ResponseEntity<List<PropostaResponse>> listarEnviadas() {
        UUID usuarioId = SecurityUtils.getUsuarioIdAutenticado();
        return ResponseEntity.ok(propostaUseCase.listarEnviadas(usuarioId));
    }

    @GetMapping("/recebidas")
    @Operation(summary = "Listar todas as propostas recebidas de outros usuários")
    public ResponseEntity<List<PropostaResponse>> listarRecebidas() {
        UUID usuarioId = SecurityUtils.getUsuarioIdAutenticado();
        return ResponseEntity.ok(propostaUseCase.listarRecebidas(usuarioId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter detalhes completos de uma proposta específica")
    public ResponseEntity<PropostaResponse> obterPorId(@PathVariable UUID id) {
        UUID usuarioId = SecurityUtils.getUsuarioIdAutenticado();
        return ResponseEntity.ok(propostaUseCase.obterPorId(id, usuarioId));
    }

    @PostMapping("/{id}/aceitar")
    @Operation(summary = "Aceitar uma proposta de escambo recebida")
    public ResponseEntity<PropostaResponse> aceitar(@PathVariable UUID id) {
        UUID usuarioId = SecurityUtils.getUsuarioIdAutenticado();
        return ResponseEntity.ok(propostaUseCase.aceitar(id, usuarioId));
    }

    @PostMapping("/{id}/rejeitar")
    @Operation(summary = "Rejeitar uma proposta de escambo recebida")
    public ResponseEntity<PropostaResponse> rejeitar(@PathVariable UUID id) {
        UUID usuarioId = SecurityUtils.getUsuarioIdAutenticado();
        return ResponseEntity.ok(propostaUseCase.rejeitar(id, usuarioId));
    }

    @PostMapping("/{id}/cancelar")
    @Operation(summary = "Cancelar uma proposta de escambo enviada anteriormente")
    public ResponseEntity<PropostaResponse> cancelar(@PathVariable UUID id) {
        UUID usuarioId = SecurityUtils.getUsuarioIdAutenticado();
        return ResponseEntity.ok(propostaUseCase.cancelar(id, usuarioId));
    }

    @PatchMapping("/{id}/condicoes/{condicaoId}/alternar")
    @Operation(summary = "Alternar o estado de cumprimento de uma condição acordada (atendida / pendente)")
    public ResponseEntity<PropostaResponse> alternarCondicao(@PathVariable UUID id, @PathVariable UUID condicaoId) {
        UUID usuarioId = SecurityUtils.getUsuarioIdAutenticado();
        return ResponseEntity.ok(propostaUseCase.alternarCondicao(id, condicaoId, usuarioId));
    }
}
