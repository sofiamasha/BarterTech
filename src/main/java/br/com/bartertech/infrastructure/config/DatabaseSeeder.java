package br.com.bartertech.infrastructure.config;

import br.com.bartertech.domain.StatusServico;
import br.com.bartertech.infrastructure.persistence.entity.ServicoEntity;
import br.com.bartertech.infrastructure.persistence.entity.UsuarioEntity;
import br.com.bartertech.infrastructure.persistence.repository.SpringDataServicoRepository;
import br.com.bartertech.infrastructure.persistence.repository.SpringDataUsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Seeder de inicialização com dados de demonstração realistas para ambiente de desenvolvimento.
 * Cria contas e serviços de exemplo claramente identificados para testes imediatos.
 */
@Component
@Profile("!test")
public class DatabaseSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSeeder.class);

    private final SpringDataUsuarioRepository usuarioRepository;
    private final SpringDataServicoRepository servicoRepository;
    private final PasswordEncoder passwordEncoder;

    public DatabaseSeeder(SpringDataUsuarioRepository usuarioRepository,
                          SpringDataServicoRepository servicoRepository,
                          PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.servicoRepository = servicoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (usuarioRepository.count() > 0) {
            log.info("Base de dados já contém registros. Seeder ignorado.");
            return;
        }

        log.info("Inicializando dados de demonstração do BarterTech...");
        String senhaPadrao = passwordEncoder.encode("SenhaSegura123!");

        // 1. Ana Silva (Design & UI/UX - Procura Inglês e Marketing)
        UsuarioEntity ana = new UsuarioEntity(
                UUID.fromString("11111111-1111-1111-1111-111111111111"),
                "Ana Silva (Demonstração)",
                "ana@bartertech.dev",
                senhaPadrao
        );
        ana.setBio("Product Designer com mais de 7 anos de experiência em interfaces web, design system e branding para startups de tecnologia.");
        ana.setLocalizacao("São Paulo, SP");
        ana.setAvatarUrl("https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80");
        ana.setInteresses(new LinkedHashSet<>(Set.of("ingles", "marketing", "copywriting")));
        usuarioRepository.save(ana);

        // 2. Bruno Costa (Professor de Inglês - Procura Design e Programação)
        UsuarioEntity bruno = new UsuarioEntity(
                UUID.fromString("22222222-2222-2222-2222-222222222222"),
                "Bruno Costa (Demonstração)",
                "bruno@bartertech.dev",
                senhaPadrao
        );
        bruno.setBio("Educador bilíngue e mentor de conversação focado em inglês para profissionais de tecnologia e preparação para entrevistas internacionais.");
        bruno.setLocalizacao("Belo Horizonte, MG");
        bruno.setAvatarUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80");
        bruno.setInteresses(new LinkedHashSet<>(Set.of("design", "programacao", "desenvolvimento")));
        usuarioRepository.save(bruno);

        // 3. Carlos Souza (Engenheiro de Software Fullstack - Procura Fotografia e Design)
        UsuarioEntity carlos = new UsuarioEntity(
                UUID.fromString("33333333-3333-3333-3333-333333333333"),
                "Carlos Souza (Demonstração)",
                "carlos@bartertech.dev",
                senhaPadrao
        );
        carlos.setBio("Engenheiro de software fullstack especialista em arquitetura backend Java, Spring Boot, React e infraestrutura em nuvem.");
        carlos.setLocalizacao("Florianópolis, SC");
        carlos.setAvatarUrl("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80");
        carlos.setInteresses(new LinkedHashSet<>(Set.of("design", "fotografia", "musica")));
        usuarioRepository.save(carlos);

        // 4. Diana Martins (Fotógrafa e Produtora de Conteúdo - Procura Programação e Inglês)
        UsuarioEntity diana = new UsuarioEntity(
                UUID.fromString("44444444-4444-4444-4444-444444444444"),
                "Diana Martins (Demonstração)",
                "diana@bartertech.dev",
                senhaPadrao
        );
        diana.setBio("Fotógrafa comercial e de retratos profissionais corporativos. Produzo ensaios para LinkedIn, portfólios e presença digital.");
        diana.setLocalizacao("Rio de Janeiro, RJ");
        diana.setAvatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80");
        diana.setInteresses(new LinkedHashSet<>(Set.of("programacao", "ingles", "video")));
        usuarioRepository.save(diana);

        // Serviços oferecidos
        ServicoEntity servicoAna1 = new ServicoEntity(
                UUID.fromString("a1111111-1111-1111-1111-111111111111"),
                ana,
                "Identidade Visual e UI/UX para SaaS",
                "design",
                "Design e Criatividade",
                "Criação completa de manual de marca, paleta cromática, tipografia e prototipagem de até 5 telas essenciais no Figma para o seu produto digital.",
                StatusServico.DISPONIVEL
        );

        ServicoEntity servicoBruno1 = new ServicoEntity(
                UUID.fromString("b2222222-2222-2222-2222-222222222222"),
                bruno,
                "Mentoria de Inglês Técnico para Tech Interviews",
                "ingles",
                "Educação e Idiomas",
                "Pacote de 4 sessões intensivas de 1h de conversação por vídeo, com revisão de CV em inglês e simulação real de entrevista técnica em empresas do exterior.",
                StatusServico.DISPONIVEL
        );

        ServicoEntity servicoCarlos1 = new ServicoEntity(
                UUID.fromString("c3333333-3333-3333-3333-333333333333"),
                carlos,
                "Desenvolvimento de API REST e Integrações Web",
                "programacao",
                "Tecnologia e Programação",
                "Construção de endpoints seguros, documentação OpenAPI/Swagger e modelagem de banco de dados para automação de processos ou MVPs.",
                StatusServico.DISPONIVEL
        );

        ServicoEntity servicoDiana1 = new ServicoEntity(
                UUID.fromString("d4444444-4444-4444-4444-444444444444"),
                diana,
                "Ensaio Fotográfico e Retratos Profissionais",
                "fotografia",
                "Design e Criatividade",
                "Sessão fotográfica profissional para posicionamento executivo no LinkedIn e sites pessoais, incluindo 10 fotos tratadas em alta resolução.",
                StatusServico.DISPONIVEL
        );

        servicoRepository.saveAll(List.of(servicoAna1, servicoBruno1, servicoCarlos1, servicoDiana1));
        log.info("Dados de demonstração cadastrados com sucesso. Credenciais padrão: email de teste / SenhaSegura123!");
    }
}
