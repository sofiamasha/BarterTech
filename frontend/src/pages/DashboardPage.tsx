import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  api, 
  Servico, 
  MatchExplicado, 
  Proposta, 
  Contrato 
} from '../services/api';
import { 
  Briefcase, 
  Sparkles, 
  SendHorizontal, 
  FileCheck2, 
  PlusCircle, 
  ArrowRight, 
  Search, 
  CheckCircle2, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';
import { Badge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface DashboardPageProps {
  navegarPara: (rota: string, params?: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ navegarPara }) => {
  const { user } = useAuth();
  const [meusServicos, setMeusServicos] = useState<Servico[]>([]);
  const [matches, setMatches] = useState<MatchExplicado[]>([]);
  const [propostasRecebidas, setPropostasRecebidas] = useState<Proposta[]>([]);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      const [resServicos, resMatches, resRecebidas, resContratos] = await Promise.all([
        api.servicos.listarMeus(),
        api.matches.obterMeus(),
        api.propostas.listarRecebidas(),
        api.contratos.listarMeus(),
      ]);
      setMeusServicos(resServicos);
      setMatches(resMatches);
      setPropostasRecebidas(resRecebidas);
      setContratos(resContratos);
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
    } finally {
      setCarregando(false);
    }
  };

  if (carregando) {
    return <LoadingSpinner mensagem="Carregando métricas e matches do seu painel..." />;
  }

  const propostasPendentes = propostasRecebidas.filter(p => p.status === 'PENDENTE');

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 4rem' }}>
      {/* Header do Usuário */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem',
        marginBottom: '2.5rem'
      }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Painel Geral de Escambo
          </span>
          <h2>Olá, {user?.nome}</h2>
          <p style={{ marginTop: '0.2rem' }}>
            {user?.bio || 'Gerencie suas habilidades, explore oportunidades e formalize contratos.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => navegarPara('catalogo')} className="btn btn-secondary">
            <Search size={16} /> Buscar Serviços
          </button>
          <button onClick={() => navegarPara('meus-servicos', { abrirModalCriacao: true })} className="btn btn-primary">
            <PlusCircle size={16} /> Publicar Habilidade
          </button>
        </div>
      </div>

      {/* Cards de Métricas em Grid */}
      <div className="grid-cols-4" style={{ marginBottom: '3rem' }}>
        <div className="card" onClick={() => navegarPara('meus-servicos')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Meus Serviços</span>
            <div style={{ color: 'var(--color-primary)', backgroundColor: 'var(--color-primary-subtle)', padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}>
              <Briefcase size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800 }}>{meusServicos.length}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-success)' }}>
            {meusServicos.filter(s => s.status === 'DISPONIVEL').length} disponíveis para troca
          </span>
        </div>

        <div className="card" onClick={() => navegarPara('matches')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Matches Recíprocos</span>
            <div style={{ color: 'var(--color-success)', backgroundColor: 'var(--color-success-subtle)', padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}>
              <Sparkles size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--color-success)' }}>{matches.length}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {matches.length > 0 ? 'Combinações mútuas ativas' : 'Cadastre mais interesses'}
          </span>
        </div>

        <div className="card" onClick={() => navegarPara('propostas')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Propostas Recebidas</span>
            <div style={{ color: 'var(--color-warning)', backgroundColor: 'var(--color-warning-subtle)', padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}>
              <SendHorizontal size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800 }}>{propostasRecebidas.length}</div>
          <span style={{ fontSize: '0.75rem', color: propostasPendentes.length > 0 ? 'var(--color-warning)' : 'var(--text-muted)' }}>
            {propostasPendentes.length} aguardando sua resposta
          </span>
        </div>

        <div className="card" onClick={() => navegarPara('contratos')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Contratos SHA-256</span>
            <div style={{ color: 'var(--color-info)', backgroundColor: 'var(--color-info-subtle)', padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}>
              <FileCheck2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800 }}>{contratos.length}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-info)' }}>
            Formalizados & Auditáveis
          </span>
        </div>
      </div>

      {/* Seção de Matches em Destaque */}
      <div style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3>Matches Recíprocos Identificados</h3>
            <p>Parcerias onde suas habilidades e necessidades atendem mutuamente aos critérios de ambos os profissionais.</p>
          </div>
          {matches.length > 0 && (
            <button onClick={() => navegarPara('matches')} className="btn btn-ghost btn-sm">
              Ver todos os matches <ArrowRight size={16} />
            </button>
          )}
        </div>

        {matches.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <Sparkles size={32} color="var(--color-primary)" style={{ margin: '0 auto 1rem' }} />
            <h4 style={{ marginBottom: '0.5rem' }}>Nenhum match recíproco detectado no momento</h4>
            <p style={{ maxWidth: '480px', margin: '0 auto 1.5rem', fontSize: '0.875rem' }}>
              Para gerar matches automáticos, certifique-se de que você possui <strong>ao menos um serviço disponível publicado</strong> e <strong>habilidades procuradas (interesses) cadastradas no seu perfil</strong>.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={() => navegarPara('meus-servicos', { abrirModalCriacao: true })} className="btn btn-primary btn-sm">
                Publicar Serviço
              </button>
              <button onClick={() => navegarPara('perfil')} className="btn btn-secondary btn-sm">
                Configurar Interesses
              </button>
            </div>
          </div>
        ) : (
          <div className="grid-cols-2">
            {matches.slice(0, 2).map((m, idx) => (
              <div key={idx} className="card card-interactive" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {m.parceiroAvatarUrl ? (
                        <img src={m.parceiroAvatarUrl} alt={m.parceiroNome} style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                          {m.parceiroNome[0]}
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 700 }}>{m.parceiroNome}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.parceiroLocalizacao || 'Remoto'}</div>
                      </div>
                    </div>
                    <span className="badge badge-success">Score {m.scoreCompatibilidade}%</span>
                  </div>

                  <div style={{ backgroundColor: 'var(--bg-surface)', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Você oferece:</span>
                      <strong style={{ color: 'var(--color-primary)' }}>{m.meuServicoTitulo}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Ele(a) oferece:</span>
                      <strong style={{ color: 'var(--color-success)' }}>{m.servicoParceiroTitulo}</strong>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                    {m.motivoMatch}
                  </p>
                </div>

                <button 
                  onClick={() => navegarPara('matches')} 
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  <SendHorizontal size={16} /> Iniciar Proposta de Troca
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Propostas Pendentes de Ação */}
      {propostasPendentes.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3>Propostas Recebidas Aguardando Decisão</h3>
              <p>Outros membros propuseram escambo com seus serviços publicados.</p>
            </div>
            <button onClick={() => navegarPara('propostas')} className="btn btn-ghost btn-sm">
              Ver todas as propostas <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid-cols-1">
            {propostasPendentes.slice(0, 3).map(p => (
              <div key={p.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
                    <span style={{ fontWeight: 700 }}>{p.solicitante.nome}</span>
                    <Badge status={p.status} />
                  </div>
                  <p style={{ fontSize: '0.85rem' }}>
                    Oferece: <strong>{p.servicoOferecido.titulo}</strong> em troca do seu serviço: <strong>{p.servicoSolicitado.titulo}</strong>
                  </p>
                </div>
                <button onClick={() => navegarPara('propostas')} className="btn btn-secondary btn-sm">
                  Avaliar Negociação
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
