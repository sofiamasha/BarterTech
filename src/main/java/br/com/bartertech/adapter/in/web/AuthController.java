package br.com.bartertech.adapter.in.web;

import br.com.bartertech.adapter.in.web.dto.*;
import br.com.bartertech.application.usecase.AuthUseCase;
import br.com.bartertech.infrastructure.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Autenticação", description = "Endpoints para cadastro, login e verificação de sessão de usuários")
public class AuthController {

    private final AuthUseCase authUseCase;

    public AuthController(AuthUseCase authUseCase) {
        this.authUseCase = authUseCase;
    }

    @PostMapping("/register")
    @Operation(summary = "Cadastrar uma nova conta de usuário")
    public ResponseEntity<AuthResponse> cadastrar(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authUseCase.cadastrar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    @Operation(summary = "Autenticar com email e senha, obtendo token JWT")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authUseCase.autenticar(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @Operation(summary = "Obter dados do perfil do usuário autenticado")
    public ResponseEntity<UsuarioResponse> obterUsuarioAutenticado() {
        UsuarioResponse response = authUseCase.obterPerfilLogado(SecurityUtils.getUsuarioIdAutenticado());
        return ResponseEntity.ok(response);
    }
}
