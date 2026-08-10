package br.com.bartertech.service;

import br.com.bartertech.domain.IntegridadeContrato;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public final class HashSha256Service implements IntegridadeContrato {
    @Override
    public String gerarHash(String conteudo) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256").digest(conteudo.getBytes(StandardCharsets.UTF_8));
            return java.util.HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 nao esta disponivel na JVM", exception);
        }
    }
}
