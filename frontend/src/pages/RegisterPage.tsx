import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus, AlertCircle, Plus, X } from 'lucide-react';

interface RegisterPageProps {
  navegarPara: (rota: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ navegarPara }) => {
  const { register } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [bio, setBio] = useState('');
  const [interesseInput, setInteresseInput] = useState('');
  const [interesses, setInteresses] = useState<string[]>(['ingles', 'design']);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

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

    if (senha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setCarregando(true);
    try {
      await register({
        nome,
        email,
        senha,
        localizacao,
        bio,
        interesses,
      });
      navegarPara('dashboard');
    } catch (err: any) {
      setErro(err.message || 'Erro ao realizar cadastro.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '580px', padding: '3rem 1.5rem' }}>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            padding: '0.75rem',
            backgroundColor: 'var(--color-primary-subtle)',
            borderRadius: 'var(--radius-full)',
            color: 'var(--color-primary)',
            marginBottom: '1rem'
          }}>
            <UserPlus size={26} />
          </div>
          <h2>Criar Conta Profissional</h2>
          <p>Ofereça seus serviços e encontre quem precisa das suas habilidades</p>
        </div>

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
          <div className="form-group">
            <label className="form-label" htmlFor="reg-nome">Nome Completo</label>
            <input 
              id="reg-nome"
              type="text" 
              className="form-input" 
              placeholder="Ex: Mariana Silva" 
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email</label>
              <input 
                id="reg-email"
                type="email" 
                className="form-input" 
                placeholder="seu.email@exemplo.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-senha">Senha (mín. 6 caracteres)</label>
              <input 
                id="reg-senha"
                type="password" 
                className="form-input" 
                placeholder="••••••••" 
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-local">Cidade / Estado</label>
            <input 
              id="reg-local"
              type="text" 
              className="form-input" 
              placeholder="Ex: Curitiba, PR ou Remoto" 
              value={localizacao}
              onChange={(e) => setLocalizacao(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-bio">Biografia e Especialidade</label>
            <textarea 
              id="reg-bio"
              className="form-textarea" 
              rows={3}
              placeholder="Conte resumidamente sobre sua experiência e formação profissional..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          {/* Interesses / Habilidades Procuradas */}
          <div className="form-group">
            <label className="form-label">Habilidades que você procura em troca (Interesses para Match)</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Ex: programacao, marketing, ingles..." 
                value={interesseInput}
                onChange={(e) => setInteresseInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); adicionarInteresse(); } }}
              />
              <button type="button" onClick={adicionarInteresse} className="btn btn-secondary">
                <Plus size={16} /> Adicionar
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {interesses.map(item => (
                <span key={item} className="badge badge-primary" style={{ padding: '0.35rem 0.65rem' }}>
                  {item}
                  <X 
                    size={14} 
                    style={{ cursor: 'pointer', marginLeft: '0.35rem' }} 
                    onClick={() => removerInteresse(item)} 
                  />
                </span>
              ))}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Essas palavras-chave são utilizadas pelo algoritmo para cruzar com o catálogo de outros profissionais.
            </span>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-lg" 
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={carregando}
          >
            {carregando ? 'Registrando conta...' : 'Concluir Cadastro e Acessar'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
          Já possui conta cadastrada?{' '}
          <button 
            type="button"
            onClick={() => navegarPara('login')} 
            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer' }}
          >
            Faça login aqui
          </button>
        </div>
      </div>
    </div>
  );
};
