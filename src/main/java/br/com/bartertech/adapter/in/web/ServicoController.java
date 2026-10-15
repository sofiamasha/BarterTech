package br.com.bartertech.adapter.in.web;

import br.com.bartertech.adapter.in.web.dto.AtualizarServicoRequest;
import br.com.bartertech.adapter.in.web.dto.CriarServicoRequest;
import br.com.bartertech.adapter.in.web.dto.ServicoResponse;
import br.com.bartertech.application.usecase.ServicoUseCase;
import br.com.bartertech.infrastructure.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/servicos")
@Tag(name = "Serviços", description = "Catálogo de habilidades, publicação e gestão de serviços oferecidos")
public class ServicoController {

    private final ServicoUseCase servicoUseCase;

    public ServicoController(ServicoUseCase servicoUseCase) {
        this.servicoUseCase = servicoUseCase;
    }

    @GetMapping
    @Operation(summary = "Pesquisar catálogo público de serviços com filtros e paginação")
    public ResponseEntity<Page<ServicoResponse>> pesquisar(
            @RequestParam(required = false) String busca,
            @RequestParam(required = false) String categoria,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "12") int tamanho
    ) {
        UUID usuarioAtualId = SecurityUtils.getUsuarioAutenticado()
                .map(u -> u.getId())
                .orElse(null);

        PageRequest pageRequest = PageRequest.of(pagina, tamanho, Sort.by("criadoEm").descending());
        Page<ServicoResponse> resultado = servicoUseCase.pesquisarPublicos(busca, categoria, usuarioAtualId, pageRequest);
        return ResponseEntity.ok(resultado);
    }

    @GetMapping("/categorias")
    @Operation(summary = "Listar todas as categorias com serviços disponíveis")
    public ResponseEntity<List<String>> listarCategorias() {
        return ResponseEntity.ok(servicoUseCase.listarCategorias());
    }

    @GetMapping("/meus")
    @Operation(summary = "Listar todos os serviços publicados pelo usuário logado")
    public ResponseEntity<List<ServicoResponse>> listarMeus() {
        UUID usuarioId = SecurityUtils.getUsuarioIdAutenticado();
        return ResponseEntity.ok(servicoUseCase.listarMeusServicos(usuarioId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter detalhes de um serviço específico")
    public ResponseEntity<ServicoResponse> obterPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(servicoUseCase.obterPorId(id));
    }

    @PostMapping
    @Operation(summary = "Publicar um novo serviço no catálogo")
    public ResponseEntity<ServicoResponse> criar(@Valid @RequestBody CriarServicoRequest request) {
        UUID usuarioId = SecurityUtils.getUsuarioIdAutenticado();
        ServicoResponse response = servicoUseCase.criarServico(usuarioId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar detalhes de um serviço próprio")
    public ResponseEntity<ServicoResponse> atualizar(@PathVariable UUID id, @Valid @RequestBody AtualizarServicoRequest request) {
        UUID usuarioId = SecurityUtils.getUsuarioIdAutenticado();
        ServicoResponse response = servicoUseCase.atualizarServico(usuarioId, id, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/alternar-status")
    @Operation(summary = "Alternar disponibilidade (DISPONÍVEL / INDISPONÍVEL) de um serviço próprio")
    public ResponseEntity<Void> alternarDisponibilidade(@PathVariable UUID id) {
        UUID usuarioId = SecurityUtils.getUsuarioIdAutenticado();
        servicoUseCase.alternarDisponibilidade(usuarioId, id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir permanentemente um serviço próprio")
    public ResponseEntity<Void> excluir(@PathVariable UUID id) {
        UUID usuarioId = SecurityUtils.getUsuarioIdAutenticado();
        servicoUseCase.excluirServico(usuarioId, id);
        return ResponseEntity.noContent().build();
    }
}
