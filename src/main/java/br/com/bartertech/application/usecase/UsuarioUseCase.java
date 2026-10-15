package br.com.bartertech.application.usecase;

import br.com.bartertech.adapter.in.web.dto.UpdatePerfilRequest;
import br.com.bartertech.adapter.in.web.dto.UsuarioResponse;
import br.com.bartertech.exception.ResourceNotFoundException;
import br.com.bartertech.infrastructure.persistence.entity.UsuarioEntity;
import br.com.bartertech.infrastructure.persistence.repository.SpringDataUsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UsuarioUseCase {

    private final SpringDataUsuarioRepository usuarioRepository;

    public UsuarioUseCase(SpringDataUsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public UsuarioResponse atualizarPerfil(UUID usuarioId, UpdatePerfilRequest request) {
        UsuarioEntity usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        usuario.setNome(request.nome().trim());
        usuario.setBio(request.bio());
        usuario.setLocalizacao(request.localizacao());
        usuario.setAvatarUrl(request.avatarUrl());
        usuario.setAtualizadoEm(Instant.now());

        if (request.interesses() != null) {
            Set<String> normalizados = request.interesses().stream()
                    .filter(s -> s != null && !s.isBlank())
                    .map(s -> s.trim().toLowerCase())
                    .collect(Collectors.toCollection(LinkedHashSet::new));
            usuario.setInteresses(normalizados);
        }

        UsuarioEntity salvo = usuarioRepository.save(usuario);
        return AuthUseCase.toResponse(salvo);
    }

    @Transactional(readOnly = true)
    public UsuarioResponse obterPorId(UUID usuarioId) {
        UsuarioEntity usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        return AuthUseCase.toResponse(usuario);
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listarAtivos(UUID usuarioExcetoId) {
        return usuarioRepository.findAllAtivosExceto(usuarioExcetoId).stream()
                .map(AuthUseCase::toResponse)
                .toList();
    }
}
