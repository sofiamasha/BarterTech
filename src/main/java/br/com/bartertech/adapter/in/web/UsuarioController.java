package br.com.bartertech.adapter.in.web;

import br.com.bartertech.adapter.in.web.dto.UpdatePerfilRequest;
import br.com.bartertech.adapter.in.web.dto.UsuarioResponse;
import br.com.bartertech.application.usecase.UsuarioUseCase;
import br.com.bartertech.infrastructure.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/usuarios")
@Tag(name = "Usuários", description = "Gerenciamento de perfil, interesses e membros da comunidade")
public class UsuarioController {

    private final UsuarioUseCase usuarioUseCase;

    public UsuarioController(UsuarioUseCase usuarioUseCase) {
        this.usuarioUseCase = usuarioUseCase;
    }

    @PutMapping("/perfil")
    @Operation(summary = "Atualizar informações do próprio perfil (bio, localização, interesses)")
    public ResponseEntity<UsuarioResponse> atualizarPerfil(@Valid @RequestBody UpdatePerfilRequest request) {
        UUID usuarioId = SecurityUtils.getUsuarioIdAutenticado();
        UsuarioResponse response = usuarioUseCase.atualizarPerfil(usuarioId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Visualizar detalhes públicos do perfil de um membro")
    public ResponseEntity<UsuarioResponse> obterPorId(@PathVariable UUID id) {
        UsuarioResponse response = usuarioUseCase.obterPorId(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/comunidade")
    @Operation(summary = "Listar outros usuários ativos da comunidade para descoberta")
    public ResponseEntity<List<UsuarioResponse>> listarMembrosComunidade() {
        UUID usuarioId = SecurityUtils.getUsuarioIdAutenticado();
        List<UsuarioResponse> membros = usuarioUseCase.listarAtivos(usuarioId);
        return ResponseEntity.ok(membros);
    }
}
