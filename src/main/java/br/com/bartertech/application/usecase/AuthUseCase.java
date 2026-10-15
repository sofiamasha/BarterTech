package br.com.bartertech.application.usecase;

import br.com.bartertech.adapter.in.web.dto.*;
import br.com.bartertech.domain.Usuario;
import br.com.bartertech.exception.ResourceNotFoundException;
import br.com.bartertech.infrastructure.persistence.entity.UsuarioEntity;
import br.com.bartertech.infrastructure.persistence.repository.SpringDataUsuarioRepository;
import br.com.bartertech.infrastructure.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AuthUseCase {

    private final SpringDataUsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;

    public AuthUseCase(SpringDataUsuarioRepository usuarioRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider,
                       AuthenticationManager authenticationManager) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public AuthResponse cadastrar(RegisterRequest request) {
        if (usuarioRepository.existsByEmailIgnoreCase(request.email().trim())) {
            throw new IllegalArgumentException("O email informado já está em uso por outra conta");
        }

        UsuarioEntity entity = new UsuarioEntity(
                UUID.randomUUID(),
                request.nome().trim(),
                request.email().trim().toLowerCase(),
                passwordEncoder.encode(request.senha())
        );
        entity.setBio(request.bio());
        entity.setLocalizacao(request.localizacao());
        entity.setAvatarUrl(request.avatarUrl());

        if (request.interesses() != null && !request.interesses().isEmpty()) {
            Set<String> normalizados = request.interesses().stream()
                    .filter(s -> s != null && !s.isBlank())
                    .map(s -> s.trim().toLowerCase())
                    .collect(Collectors.toCollection(LinkedHashSet::new));
            entity.setInteresses(normalizados);
        }

        UsuarioEntity salvo = usuarioRepository.save(entity);
        String token = tokenProvider.gerarToken(salvo.getId(), salvo.getEmail());
        return new AuthResponse(token, toResponse(salvo));
    }

    @Transactional(readOnly = true)
    public AuthResponse autenticar(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email().trim().toLowerCase(), request.senha())
        );

        UsuarioEntity usuario = usuarioRepository.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        String token = tokenProvider.gerarToken(usuario.getId(), usuario.getEmail());
        return new AuthResponse(token, toResponse(usuario));
    }

    @Transactional(readOnly = true)
    public UsuarioResponse obterPerfilLogado(UUID usuarioId) {
        UsuarioEntity usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        return toResponse(usuario);
    }

    public static UsuarioResponse toResponse(UsuarioEntity entity) {
        return new UsuarioResponse(
                entity.getId(),
                entity.getNome(),
                entity.getEmail(),
                entity.getBio(),
                entity.getLocalizacao(),
                entity.getAvatarUrl(),
                entity.isAtivo(),
                entity.getInteresses(),
                entity.getCriadoEm()
        );
    }
}
