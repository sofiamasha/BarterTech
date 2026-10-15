import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, Servico } from '../services/api';
import { 
  ArrowLeft, 
  User, 
  SendHorizontal, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  Trash2 
} from 'lucide-react';
import { Badge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface ServicoDetalhesPageProps {
  servicoId: string;
  navegarPara: (rota: string, params?: any) => void;
}

export const ServicoDetalhesPage: React.FC<ServicoDetalhesPageProps> = ({ servicoId, navegarPara }) => {
  const { user } = useAuth();
  const [servico, setServico] = useState<Servico | null>(null);
  const [meusServicos, setMeusServicos] = useState<Servico[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Estados do Modal de Proposta
  const [modalAberto, setModalAberto] = useState(false);
  const [meuServicoSelecionadoId, setMeuServicoSelecionadoId] = useState('');
  const [diasValidade, setDiasValidade] = useState(7);
  const [mensagem, setMensagem] = useState('');
  const [condicoes, setCondicoes] = useState<{ descricao: string; obrigatoria: boolean }[]>([
    { descricao: 'Alinhar escopo e detalhes por videoconferência inicial', obrigatoria: true }
  ]);
  const [novaCondicaoDesc, setNovaCondicaoDesc] = useState('');
  const [novaCondicaoObrigatoria, setNovaCondicaoObrigatoria] = useState(false);
  const [enviandoProposta, setEnviandoProposta] = useState(false);
  const [erroProposta, setErroProposta] = useState<string | null>(null);

  useEffect(() => {
    carregarDetalhes();
  }, [servicoId]);

  const carregarDetalhes = async () => {
    try {
      setCarregando(true);
      const res = await api.servicos.obterPorId(servicoId);
      setServico(res);

      if (user) {
        const meus = await api.servicos.listarMeus();
        const disponiveis = meus.filter(s => s.status === 'DISPONIVEL' && s.id !== servicoId);
        setMeusServicos(disponiveis);
        if (disponiveis.length > 0) {
          setMeuServicoSelecionadoId(disponiveis[0].id);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar detalhes do serviço:', err);
    } finally {
      setCarregando(false);
    }
  };

  const handleAdicionarCondicao = () => {
    if (!novaCondicaoDesc.trim()) return;
    setCondicoes([...condicoes, { descricao: novaCondicaoDesc.trim(), obrigatoria: novaCondicaoObrigatoria }]);
    setNovaCondicaoDesc('');
    setNovaCondicaoObrigatoria(false);
  };

  const handleRemoverCondicao = (idx: number) => {
    setCondicoes(condicoes.filter((_, i) => i !== idx));
  };

  const handleEnviarProposta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!servico) return;
    setErroProposta(null);

    if (!meuServicoSelecionadoId) {
      setErroProposta('Você precisa selecionar qual dos seus serviços deseja oferecer em troca.');
      return;
    }

    setEnviandoProposta(true);
    try {
      const expiraEm = new Date(Date.now() + diasValidade * 24 * 60 * 60 * 1000).toISOString();
      await api.propostas.criar({
        destinatarioId: servico.proprietarioId,
        servicoSolicitadoId: servico.id,
        servicoOferecidoId: meuServicoSelecionadoId,
        expiraEm,
        mensagem,
        condicoes,
      });
      setModalAberto(false);
      navegarPara('propostas');
    } catch (err: any) {
      setErroProposta(err.message || 'Erro ao enviar proposta.');
    } finally {
      setEnviandoProposta(false);
    }
  };

  if (carregando) {
    return <LoadingSpinner mensagem="Carregando especificações do serviço..." />;
  }

  if (!servico) {
    return (
      <div className="container" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
        <h3>Serviço não encontrado</h3>
        <p>O serviço solicitado pode ter sido desativado ou removido pelo proponente.</p>
        <button onClick={() => navegarPara('catalogo')} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          Voltar ao Catálogo
        </button>
      </div>
    );
  }

  const ehMeuServico = user && user.id === servico.proprietarioId;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 4rem', maxWidth: '900px' }}>
      <button onClick={() => navegarPara('catalogo')} className="btn btn-ghost btn-sm" style={{ marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Voltar ao Catálogo
      </button>

      <div className="card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span className="badge badge-primary">{servico.categoria}</span>
              <Badge status={servico.status} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                #{servico.tipo}
              </span>
            </div>
            <h2>{servico.titulo}</h2>
          </div>

          {!ehMeuServico && servico.status === 'DISPONIVEL' && (
            <button 
              onClick={() => {
                if (!user) {
                  navegarPara('login');
                } else {
                  setModalAberto(true);
                }
              }} 
              className="btn btn-primary btn-lg"
            >
              <SendHorizontal size={18} /> Propor Troca de Serviços
            </button>
          )}
        </div>

        <div style={{
          backgroundColor: 'var(--bg-surface)',
          padding: '1.5rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '2rem',
          border: '1px solid var(--border-subtle)'
        }}>
          <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            Descrição Detalhada do Serviço Oferecido
          </h4>
          <p style={{ fontSize: '0.95rem', lineHeight: 1.7, whiteSpace: 'pre-line', color: 'var(--text-secondary)' }}>
            {servico.descricao}
          </p>
        </div>

        {/* Perfil do Proponente */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {servico.proprietarioAvatarUrl ? (
              <img src={servico.proprietarioAvatarUrl} alt={servico.proprietarioNome} style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.25rem' }}>
                {servico.proprietarioNome[0]}
              </div>
            )}
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{servico.proprietarioNome}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{servico.proprietarioLocalizacao || 'Profissional Remoto'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Publicado em {new Date(servico.criadoEm).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>
      </div>

      {/* Modal de Proposta */}
      {modalAberto && (
        <div className="modal-overlay" onClick={() => setModalAberto(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Proposta de Troca com {servico.proprietarioNome}</h3>
              <button onClick={() => setModalAberto(false)} className="btn btn-ghost btn-sm">✕</button>
            </div>

            <form onSubmit={handleEnviarProposta}>
              <div className="modal-body">
                {erroProposta && (
                  <div style={{
                    backgroundColor: 'var(--color-danger-subtle)',
                    border: '1px solid var(--color-danger)',
                    color: '#fca5a5',
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.85rem'
                  }}>
                    <AlertCircle size={16} />
                    <span>{erroProposta}</span>
                  </div>
                )}

                <div style={{ backgroundColor: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Serviço que você deseja receber:</span>
                  <div style={{ fontWeight: 700, marginTop: '0.2rem' }}>{servico.titulo} ({servico.tipo})</div>
                </div>

                <div className="form-group">
                  <label className="form-label">Qual dos seus serviços você oferece em troca?</label>
                  {meusServicos.length === 0 ? (
                    <div style={{ color: 'var(--color-warning)', fontSize: '0.875rem', padding: '0.75rem', backgroundColor: 'var(--color-warning-subtle)', borderRadius: 'var(--radius-md)' }}>
                      Você não tem serviços com status DISPONÍVEL cadastrados. Cadastre uma habilidade primeiro para poder negociar.
                    </div>
                  ) : (
                    <select 
                      className="form-select"
                      value={meuServicoSelecionadoId}
                      onChange={e => setMeuServicoSelecionadoId(e.target.value)}
                      required
                    >
                      {meusServicos.map(s => (
                        <option key={s.id} value={s.id}>{s.titulo} ({s.tipo})</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Prazo de Validade da Proposta</label>
                  <select 
                    className="form-select"
                    value={diasValidade}
                    onChange={e => setDiasValidade(Number(e.target.value))}
                  >
                    <option value={3}>3 dias</option>
                    <option value={7}>7 dias (Padrão)</option>
                    <option value={15}>15 dias</option>
                    <option value={30}>30 dias</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Mensagem para o Destinatário</label>
                  <textarea 
                    className="form-textarea" 
                    rows={3}
                    placeholder="Olá! Gostaria de propor o escambo do meu serviço pelo seu. Seguem detalhes da minha disponibilidade..."
                    value={mensagem}
                    onChange={e => setMensagem(e.target.value)}
                  />
                </div>

                {/* Condições Contratuais */}
                <div className="form-group">
                  <label className="form-label">Condições Contratuais Acordadas</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    {condicoes.map((c, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0.75rem',
                        backgroundColor: 'var(--bg-input)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.85rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <CheckCircle2 size={16} color={c.obrigatoria ? 'var(--color-warning)' : 'var(--text-muted)'} />
                          <span>{c.descricao}</span>
                          {c.obrigatoria && <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>Obrigatória</span>}
                        </div>
                        <Trash2 size={14} style={{ cursor: 'pointer', color: 'var(--color-danger)' }} onClick={() => handleRemoverCondicao(idx)} />
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Adicionar nova condição..."
                      value={novaCondicaoDesc}
                      onChange={e => setNovaCondicaoDesc(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAdicionarCondicao(); } }}
                    />
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={novaCondicaoObrigatoria} 
                        onChange={e => setNovaCondicaoObrigatoria(e.target.checked)} 
                      />
                      Obrigatória
                    </label>
                    <button type="button" onClick={handleAdicionarCondicao} className="btn btn-secondary btn-sm">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setModalAberto(false)} className="btn btn-ghost">
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={enviandoProposta || meusServicos.length === 0}
                >
                  {enviandoProposta ? 'Enviando...' : 'Enviar Proposta Formal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
