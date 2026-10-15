package br.com.bartertech.infrastructure.config;

import br.com.bartertech.domain.IntegridadeContrato;
import br.com.bartertech.service.HashSha256Service;
import br.com.bartertech.service.MatchService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;

@Configuration
public class DomainConfig {

    @Bean
    public Clock clock() {
        return Clock.systemUTC();
    }

    @Bean
    public IntegridadeContrato integridadeContrato() {
        return new HashSha256Service();
    }

    @Bean
    public MatchService matchService() {
        return new MatchService();
    }
}
