package br.com.bartertech.adapter.in.web;

import br.com.bartertech.adapter.in.web.dto.ContratoResponse;
import br.com.bartertech.adapter.in.web.dto.VerificacaoIntegridadeResponse;
import br.com.bartertech.application.usecase.ContratoUseCase;
import br.com.bartertech.infrastructure.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/contratos")
@Tag(name = "Contratos", description = "Formalização de contratos de escambo e verificação de integridade criptográfica SHA-256")
public class ContratoController {

    private final ContratoUseCase contratoUseCase;

    public ContratoController(ContratoUseCase contratoUseCase) {
        this.contratoUseCase = contratoUseCase;
    }

    @PostMapping("/gerar/{propostaId}")
    @Operation(summary = "Emitir contrato de escambo formalizado para proposta aceita com condições cumpridas")
    public ResponseEntity<ContratoResponse> gerarContrato(@PathVariable UUID propostaId) {
        UUID usuarioId = SecurityUtils.getUsuarioIdAutenticado();
        ContratoResponse response = contratoUseCase.gerarContrato(propostaId, usuarioId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "Listar todos os contratos formalizados do usuário autenticado")
    public ResponseEntity<List<ContratoResponse>> listarMeusContratos() {
        UUID usuarioId = SecurityUtils.getUsuarioIdAutenticado();
        return ResponseEntity.ok(contratoUseCase.listarMeusContratos(usuarioId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Visualizar documento de contrato formalizado por ID")
    public ResponseEntity<ContratoResponse> obterPorId(@PathVariable UUID id) {
        UUID usuarioId = SecurityUtils.getUsuarioIdAutenticado();
        return ResponseEntity.ok(contratoUseCase.obterPorId(id, usuarioId));
    }

    @GetMapping("/proposta/{propostaId}")
    @Operation(summary = "Obter contrato formalizado associado a uma proposta")
    public ResponseEntity<ContratoResponse> obterPorPropostaId(@PathVariable UUID propostaId) {
        UUID usuarioId = SecurityUtils.getUsuarioIdAutenticado();
        return ResponseEntity.ok(contratoUseCase.obterPorPropostaId(propostaId, usuarioId));
    }

    @GetMapping("/{id}/verificar-integridade")
    @Operation(summary = "Realizar auditoria criptográfica recalculando o hash SHA-256 do conteúdo canônico")
    public ResponseEntity<VerificacaoIntegridadeResponse> verificarIntegridade(@PathVariable UUID id) {
        return ResponseEntity.ok(contratoUseCase.verificarIntegridade(id));
    }
}
