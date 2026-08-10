package br.com.bartertech.domain;

import java.time.Instant;
import java.util.Objects;

public record RegistroStatusProposta(StatusProposta status, Instant ocorridoEm) {
    public RegistroStatusProposta {
        Objects.requireNonNull(status, "status e obrigatorio");
        Objects.requireNonNull(ocorridoEm, "momento do status e obrigatorio");
    }
}
