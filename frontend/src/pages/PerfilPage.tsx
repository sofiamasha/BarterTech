import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { User, Plus, X, Check, AlertCircle, Save } from 'lucide-react';

export const PerfilPage: React.FC = () => {
  const { user, updateUser } = useAuth();

  const [nome, setNome] = useState(user?.nome || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [localizacao, setLocalizacao] = useState(user?.localizacao || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [interesseInput, setInteresseInput] = useState('');
  const [interesses, setInteresses] = useState<string[]>(user?.interesses || []);

  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const adicionarInteresse = () => {
    const limpo = interesseInput.trim().toLowerCase();
    if (limpo && !interesses.includes(limpo)) {
      setInteresses([...interesses, limpo]);
      setInteresseInput('');
    }
  };

  const removerInteresse = (item: string) => {
    setInteresses(interesses.filter(i => i !== item));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setSucesso(false);
    setSalvando(true);

    try {
      const atualizado = await api.usuarios.atualizarPerfil({
        nome,
        bio,
        localizacao,
        avatarUrl,
        interesses,
      });
      updateUser(atualizado);
      setSucesso(true);
      setTimeout(() => setSucesso(false), 3000);
    } catch (err: any) {
      setErro(err.message || 'Erro ao atualizar informações do perfil.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 4rem', maxWidth: '720px' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Configuração de Conta
        </span>
        <h2>Meu Perfil Profissional</h2>
        <p>Atualize suas informações e defina as habilidades que você deseja receber em trocas.</p>
      </div>

      <div className="card" style={{ padding: '2.5rem' }}>
        {sucesso && (
          <div style={{
            backgroundColor: 'var(--color-success-subtle)',
            border: '1px solid var(--color-success)',
            color: '#6ee7b7',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '0.875rem'
          }}>
            <Check size={18} />
            <span>Perfil atualizado com sucesso! As alterações já estão ativas para novos matches.</span>
          </div>
        )}

        {erro && (
          <div style={{
            backgroundColor: 'var(--color-danger-subtle)',
            border: '1px solid var(--color-danger)',
            color: '#fca5a5',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '0.875rem'
          }}>
            <AlertCircle size={18} />
            <span>{erro}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={nome} style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-primary)' }} />
            ) : (
              <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.75rem' }}>
                {nome ? nome[0] : 'U'}
              </div>
            )}
            <div style={{ flex: 1 }}>
              <label className="form-label" htmlFor="perf-avatar">URL da Foto de Perfil (Avatar)</label>
              <input 
                id="perf-avatar"
                type="url" 
                className="form-input" 
                placeholder="https://exemplo.com/sua-foto.jpg"
                value={avatarUrl}
                onChange={e => setAvatarUrl(e.target.value)}
              />
            </div>
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label" htmlFor="perf-nome">Nome Completo</label>
              <input 
                id="perf-nome"
                type="text" 
                className="form-input" 
                value={nome}
                onChange={e => setNome(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="perf-email">Email Cadastrado</label>
              <input 
                id="perf-email"
                type="email" 
                className="form-input" 
                value={user?.email || ''}
                disabled
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="perf-local">Cidade / Estado / Modelo</label>
            <input 
              id="perf-local"
              type="text" 
              className="form-input" 
              placeholder="Ex: São Paulo, SP ou Remoto"
              value={localizacao}
              onChange={e => setLocalizacao(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="perf-bio">Biografia Profissional</label>
            <textarea 
              id="perf-bio"
              className="form-textarea" 
              rows={3}
              placeholder="Descreva sua atuação e principais conquistas..."
              value={bio}
              onChange={e => setBio(e.target.value)}
            />
          </div>

          {/* Interesses / Tags de Match */}
          <div className="form-group" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
            <label className="form-label">
              Habilidades que você procura em troca (Interesses para o Algoritmo de Match)
            </label>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              O sistema utiliza exatamente essas tags para cruzar com as ofertas de outros usuários no banco de dados.
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Ex: ingles, design, marketing, programacao..." 
                value={interesseInput}
                onChange={e => setInteresseInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); adicionarInteresse(); } }}
              />
              <button type="button" onClick={adicionarInteresse} className="btn btn-secondary">
                <Plus size={16} /> Adicionar
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {interesses.map(item => (
                <span key={item} className="badge badge-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
                  #{item}
                  <X 
                    size={14} 
                    style={{ cursor: 'pointer', marginLeft: '0.4rem' }} 
                    onClick={() => removerInteresse(item)} 
                  />
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={salvando}>
              <Save size={18} /> {salvando ? 'Salvando...' : 'Salvar Alterações do Perfil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
