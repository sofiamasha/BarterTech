import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, KeyRound, Mail, Sparkles, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  navegarPara: (rota: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ navegarPara }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      await login(email, senha);
      navegarPara('dashboard');
    } catch (err: any) {
      setErro(err.message || 'Credenciais inválidas. Verifique seu email e senha.');
    } finally {
      setCarregando(false);
    }
  };

  const preencherContaTeste = (emailTeste: string) => {
    setEmail(emailTeste);
    setSenha('SenhaSegura123!');
  };

  return (
    <div className="container" style={{ maxWidth: '480px', padding: '3rem 1.5rem' }}>
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
            <LogIn size={26} />
          </div>
          <h2>Entrar no BarterTech</h2>
          <p>Acesse seu painel e negocie trocas de serviços</p>
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
            <label className="form-label" htmlFor="login-email">Email Profissional</label>
            <div style={{ position: 'relative' }}>
              <input 
                id="login-email"
                type="email" 
                className="form-input" 
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-senha">Senha de Acesso</label>
            <input 
              id="login-senha"
              type="password" 
              className="form-input" 
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={carregando}
          >
            {carregando ? 'Autenticando...' : 'Entrar na Plataforma'}
          </button>
        </form>

        {/* Contas de Demonstração Rápidas para Avaliação Técnica */}
        <div style={{
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 600 }}>
            <Sparkles size={14} color="var(--color-warning)" /> CONTAS PRÉ-CADASTRADAS PARA TESTE RÁPIDO:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
            <button 
              type="button" 
              onClick={() => preencherContaTeste('ana@bartertech.dev')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', justifyContent: 'flex-start' }}
            >
              Ana (Design)
            </button>
            <button 
              type="button" 
              onClick={() => preencherContaTeste('bruno@bartertech.dev')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', justifyContent: 'flex-start' }}
            >
              Bruno (Inglês)
            </button>
            <button 
              type="button" 
              onClick={() => preencherContaTeste('carlos@bartertech.dev')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', justifyContent: 'flex-start' }}
            >
              Carlos (Programação)
            </button>
            <button 
              type="button" 
              onClick={() => preencherContaTeste('diana@bartertech.dev')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', justifyContent: 'flex-start' }}
            >
              Diana (Fotografia)
            </button>
          </div>
          <span style={{ display: 'block', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Senha padrão: <code>SenhaSegura123!</code>
          </span>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
          Não tem conta ainda?{' '}
          <button 
            type="button"
            onClick={() => navegarPara('cadastro')} 
            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer' }}
          >
            Cadastre-se gratuitamente
          </button>
        </div>
      </div>
    </div>
  );
};
