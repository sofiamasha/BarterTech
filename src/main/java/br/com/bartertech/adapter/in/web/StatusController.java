package br.com.bartertech.adapter.in.web;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/status")
@Tag(name = "Status", description = "Monitoramento e saúde operacional do sistema")
public class StatusController {

    @GetMapping
    @Operation(summary = "Verificar integridade operacional da API")
    public ResponseEntity<Map<String, Object>> obterStatus() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "servico", "BarterTech API",
                "versao", "1.0.0",
                "timestamp", Instant.now(),
                "ambiente", "producao-pronta"
        ));
    }
}
