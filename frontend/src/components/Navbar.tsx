import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeftRight, 
  Layers, 
  Sparkles, 
  SendHorizontal, 
  FileCheck2, 
  Briefcase, 
  User, 
  LogOut, 
  LogIn, 
  UserPlus, 
  LayoutDashboard 
} from 'lucide-react';

interface NavbarProps {
  rotaAtual: string;
  navegarPara: (rota: string, params?: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ rotaAtual, navegarPara }) => {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <div 
          className="brand-logo" 
          onClick={() => navegarPara(user ? 'dashboard' : 'landing')} 
          style={{ cursor: 'pointer' }}
        >
          <div style={{
            backgroundColor: 'var(--color-primary-subtle)',
            padding: '0.45rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            color: 'var(--color-primary)'
          }}>
            <ArrowLeftRight size={22} />
          </div>
          <span>Barter</span>Tech
        </div>

        <nav>
          <ul className="nav-links">
            {!user ? (
              <>
                <li>
                  <button 
                    onClick={() => navegarPara('landing')} 
                    className={`nav-link ${rotaAtual === 'landing' ? 'active' : ''}`}
                    style={{ background: 'none', border: 'none' }}
                  >
                    Início
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navegarPara('catalogo')} 
                    className={`nav-link ${rotaAtual === 'catalogo' ? 'active' : ''}`}
                    style={{ background: 'none', border: 'none' }}
                  >
                    <Layers size={16} /> Catálogo de Serviços
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navegarPara('login')} 
                    className="btn btn-secondary btn-sm"
                  >
                    <LogIn size={15} /> Entrar
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navegarPara('cadastro')} 
                    className="btn btn-primary btn-sm"
                  >
                    <UserPlus size={15} /> Criar Conta
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <button 
                    onClick={() => navegarPara('dashboard')} 
                    className={`nav-link ${rotaAtual === 'dashboard' ? 'active' : ''}`}
                    style={{ background: 'none', border: 'none' }}
                  >
                    <LayoutDashboard size={16} /> Dashboard
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navegarPara('catalogo')} 
                    className={`nav-link ${rotaAtual === 'catalogo' ? 'active' : ''}`}
                    style={{ background: 'none', border: 'none' }}
                  >
                    <Layers size={16} /> Catálogo
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navegarPara('matches')} 
                    className={`nav-link ${rotaAtual === 'matches' ? 'active' : ''}`}
                    style={{ background: 'none', border: 'none' }}
                  >
                    <Sparkles size={16} color="var(--color-success)" /> Matches
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navegarPara('propostas')} 
                    className={`nav-link ${rotaAtual === 'propostas' ? 'active' : ''}`}
                    style={{ background: 'none', border: 'none' }}
                  >
                    <SendHorizontal size={16} /> Propostas
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navegarPara('contratos')} 
                    className={`nav-link ${rotaAtual === 'contratos' ? 'active' : ''}`}
                    style={{ background: 'none', border: 'none' }}
                  >
                    <FileCheck2 size={16} /> Contratos
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navegarPara('meus-servicos')} 
                    className={`nav-link ${rotaAtual === 'meus-servicos' ? 'active' : ''}`}
                    style={{ background: 'none', border: 'none' }}
                  >
                    <Briefcase size={16} /> Meus Serviços
                  </button>
                </li>
                <li style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button 
                    onClick={() => navegarPara('perfil')} 
                    className={`nav-link ${rotaAtual === 'perfil' ? 'active' : ''}`}
                    style={{ background: 'none', border: 'none', padding: '0.3rem 0.5rem' }}
                    title="Editar Perfil"
                  >
                    {user.avatarUrl ? (
                      <img 
                        src={user.avatarUrl} 
                        alt={user.nome} 
                        style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }} 
                      />
                    ) : (
                      <User size={18} />
                    )}
                    <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.nome.split(' ')[0]}
                    </span>
                  </button>
                  <button 
                    onClick={logout} 
                    className="btn btn-ghost btn-sm" 
                    title="Sair da conta"
                    style={{ padding: '0.4rem', color: 'var(--text-muted)' }}
                  >
                    <LogOut size={16} />
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};
