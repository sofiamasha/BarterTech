package br.com.bartertech.adapter.in.web;

import br.com.bartertech.adapter.in.web.dto.*;
import br.com.bartertech.domain.StatusProposta;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BarterTechApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Deve retornar status UP no endpoint público de monitoramento")
    void deveRetornarStatusOperacional() throws Exception {
        mockMvc.perform(get("/api/v1/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.servico").value("BarterTech API"));
    }

    @Test
    @DisplayName("Deve rejeitar acesso a rotas privadas sem autenticação JWT")
    void deveRejeitarAcessoSemToken() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Deve realizar ciclo completo: cadastro, login, publicação de serviços, match recíproco e contrato com SHA-256")
    void deveExecutarCicloCompletoDeEscamboEContrato() throws Exception {
        // 1. Cadastrar Usuário A (Designer)
        RegisterRequest reqA = new RegisterRequest(
                "Mariana Designer",
                "mariana." + UUID.randomUUID() + "@test.dev",
                "SenhaForte123!",
                "Especialista em UX",
                "Curitiba, PR",
                null,
                Set.of("ingles")
        );

        MvcResult resCadastroA = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqA)))
                .andExpect(status().isCreated())
                .andReturn();

        AuthResponse authA = objectMapper.readValue(resCadastroA.getResponse().getContentAsString(), AuthResponse.class);
        assertNotNull(authA.token());
        UUID idA = authA.usuario().id();

        // 2. Cadastrar Usuário B (Professor de Inglês)
        RegisterRequest reqB = new RegisterRequest(
                "Rodrigo English",
                "rodrigo." + UUID.randomUUID() + "@test.dev",
                "SenhaForte123!",
                "Professor nativo",
                "Porto Alegre, RS",
                null,
                Set.of("design")
        );

        MvcResult resCadastroB = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqB)))
                .andExpect(status().isCreated())
                .andReturn();

        AuthResponse authB = objectMapper.readValue(resCadastroB.getResponse().getContentAsString(), AuthResponse.class);
        assertNotNull(authB.token());
        UUID idB = authB.usuario().id();

        // 3. Usuário A publica serviço de Design
        CriarServicoRequest servA = new CriarServicoRequest(
                "Design de UI para App Mobile",
                "design",
                "Design e Criatividade",
                "Prototipagem de fluxo de usuário em alta fidelidade"
        );

        MvcResult resServA = mockMvc.perform(post("/api/v1/servicos")
                        .header("Authorization", "Bearer " + authA.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(servA)))
                .andExpect(status().isCreated())
                .andReturn();

        ServicoResponse servicoA = objectMapper.readValue(resServA.getResponse().getContentAsString(), ServicoResponse.class);

        // 4. Usuário B publica serviço de Inglês
        CriarServicoRequest servB = new CriarServicoRequest(
                "Aulas de Inglês para Negócios",
                "ingles",
                "Idiomas",
                "Conversação prática avançada sobre tecnologia"
        );

        MvcResult resServB = mockMvc.perform(post("/api/v1/servicos")
                        .header("Authorization", "Bearer " + authB.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(servB)))
                .andExpect(status().isCreated())
                .andReturn();

        ServicoResponse servicoB = objectMapper.readValue(resServB.getResponse().getContentAsString(), ServicoResponse.class);

        // 5. Usuário A consulta seus Matches
        MvcResult resMatchesA = mockMvc.perform(get("/api/v1/matches")
                        .header("Authorization", "Bearer " + authA.token()))
                .andExpect(status().isOk())
                .andReturn();

        List<MatchExplicadoResponse> matchesA = objectMapper.readValue(
                resMatchesA.getResponse().getContentAsString(),
                objectMapper.getTypeFactory().constructCollectionType(List.class, MatchExplicadoResponse.class)
        );

        assertFalse(matchesA.isEmpty(), "Deve encontrar match recíproco entre Mariana e Rodrigo");
        MatchExplicadoResponse match = matchesA.get(0);
        assertEquals(idB, match.parceiroId());
        assertEquals(100, match.scoreCompatibilidade());
        assertNotNull(match.motivoMatch());

        // 6. Usuário A envia proposta para Usuário B
        CriarPropostaRequest reqProp = new CriarPropostaRequest(
                idB,
                servicoA.id(),
                servicoB.id(),
                Instant.now().plus(7, ChronoUnit.DAYS),
                "Olá Rodrigo, gostaria de propor a troca do meu design pelo seu pacote de aulas de inglês!",
                List.of(
                        new CondicaoItemRequest("Entregar protótipo até sexta-feira", true),
                        new CondicaoItemRequest("Realizar aulas via Google Meet", false)
                )
        );

        MvcResult resProp = mockMvc.perform(post("/api/v1/propostas")
                        .header("Authorization", "Bearer " + authA.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqProp)))
                .andExpect(status().isCreated())
                .andReturn();

        PropostaResponse propostaCriada = objectMapper.readValue(resProp.getResponse().getContentAsString(), PropostaResponse.class);
        assertEquals(StatusProposta.PENDENTE, propostaCriada.status());
        UUID propostaId = propostaCriada.id();

        // 7. Usuário B consulta propostas recebidas e aceita a proposta
        MvcResult resAceite = mockMvc.perform(post("/api/v1/propostas/" + propostaId + "/aceitar")
                        .header("Authorization", "Bearer " + authB.token()))
                .andExpect(status().isOk())
                .andReturn();

        PropostaResponse propostaAceita = objectMapper.readValue(resAceite.getResponse().getContentAsString(), PropostaResponse.class);
        assertEquals(StatusProposta.ACEITA, propostaAceita.status());

        // 8. Marcar condição obrigatória como atendida
        UUID condicaoObrigatoriaId = propostaAceita.condicoes().stream()
                .filter(CondicaoResponse::obrigatoria)
                .findFirst()
                .orElseThrow()
                .id();

        mockMvc.perform(patch("/api/v1/propostas/" + propostaId + "/condicoes/" + condicaoObrigatoriaId + "/alternar")
                        .header("Authorization", "Bearer " + authB.token()))
                .andExpect(status().isOk());

        // 9. Emitir contrato formalizado
        MvcResult resContrato = mockMvc.perform(post("/api/v1/contratos/gerar/" + propostaId)
                        .header("Authorization", "Bearer " + authA.token()))
                .andExpect(status().isCreated())
                .andReturn();

        ContratoResponse contrato = objectMapper.readValue(resContrato.getResponse().getContentAsString(), ContratoResponse.class);
        assertNotNull(contrato.id());
        assertNotNull(contrato.hashIntegridade());
        assertEquals(64, contrato.hashIntegridade().length(), "O hash SHA-256 deve ter 64 caracteres hexadecimais");
        assertTrue(contrato.integro());

        // 10. Realizar auditoria de integridade do contrato
        mockMvc.perform(get("/api/v1/contratos/" + contrato.id() + "/verificar-integridade")
                        .header("Authorization", "Bearer " + authA.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.integro").value(true))
                .andExpect(jsonPath("$.hashRegistrado").value(contrato.hashIntegridade()))
                .andExpect(jsonPath("$.hashCalculado").value(contrato.hashIntegridade()));
    }
}
