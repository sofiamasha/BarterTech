package br.com.bartertech.infrastructure.security;

import br.com.bartertech.infrastructure.persistence.entity.UsuarioEntity;
import br.com.bartertech.infrastructure.persistence.repository.SpringDataUsuarioRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final SpringDataUsuarioRepository usuarioRepository;

    public CustomUserDetailsService(SpringDataUsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UsuarioEntity usuario = usuarioRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado com o email: " + email));
        return new CustomUserPrincipal(usuario.getId(), usuario.getEmail(), usuario.getSenhaHash(), usuario.isAtivo());
    }
}
