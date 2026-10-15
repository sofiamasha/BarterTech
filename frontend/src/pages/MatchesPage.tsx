import React, { useEffect, useState } from 'react';
import { api, MatchExplicado, Servico } from '../services/api';
import { 
  Sparkles, 
  ArrowLeftRight, 
  SendHorizontal, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  User, 
  HelpCircle 
} from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';

interface MatchesPageProps {
  navegarPara: (rota: string, params?: any) => void;
}

export const MatchesPage: React.FC<MatchesPageProps> = ({ navegarPara }) => {
  const [matches, setMatches] = useState<MatchExplicado[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Estados do Modal de Proposta Rápida a partir do Match
  const [modalMatch, setModalMatch] = useState<MatchExplicado | null>(null);
  const [diasValidade, setDiasValidade] = useState(7);
  const [mensagem, setMensagem] = useState('');
  const [condicoes, setCondicoes] = useState<{ descricao: string; obrigatoria: boolean }[]>([
    { descricao: 'Alinhar escopo e detalhes por videoconferência inicial', obrigatoria: true }
  ]);
  const [novaCondicaoDesc, setNovaCondicaoDesc] = useState('');
  const [novaCondicaoObrigatoria, setNovaCondicaoObrigatoria] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    carregarMatches();
  }, []);

  const carregarMatches = async () => {
    try {
      setCarregando(true);
      const res = await api.matches.obterMeus();
      setMatches(res);
    } catch (err) {
      console.error('Erro ao carregar matches:', err);
    } finally {
      setCarregando(false);
    }
  };

  const handleAbrirPropostaMatch = (m: MatchExplicado) => {
    setModalMatch(m);
    setMensagem(`Olá ${m.parceiroNome.split(' ')[0]}! O sistema identificou uma compatibilidade perfeita entre o meu serviço "${m.meuServicoTitulo}" e o seu serviço "${m.servicoParceiroTitulo}". Gostaria de formalizar uma proposta de escambo!`);
    setErro(null);
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
    if (!modalMatch) return;
    setErro(null);
    setEnviando(true);

    try {
      const expiraEm = new Date(Date.now() + diasValidade * 24 * 60 * 60 * 1000).toISOString();
      await api.propostas.criar({
        destinatarioId: modalMatch.parceiroId,
        servicoSolicitadoId: modalMatch.servicoParceiroId,
        servicoOferecidoId: modalMatch.meuServicoId,
        expiraEm,
        mensagem,
        condicoes,
      });
      setModalMatch(null);
      navegarPara('propostas');
    } catch (err: any) {
      setErro(err.message || 'Erro ao enviar proposta de match.');
    } finally {
      setEnviando(false);
    }
  };

  if (carregando) {
    return <LoadingSpinner mensagem="Calculando paridades recíprocas e analisando catálogo..." />;
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 4rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <Sparkles size={20} color="var(--color-success)" />
          <span style={{ fontSize: '0.85rem', color: 'var(--color-success)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Motor de Reciprocidade
          </span>
        </div>
        <h2>Central de Matches Recíprocos</h2>
        <p>Abaixo estão os profissionais cujas habilidades ofertadas atendem aos seus interesses, e que simultaneamente buscam as competências que você oferece.</p>
      </div>

      {matches.length === 0 ? (
        <EmptyState 
          icon={Sparkles}
          titulo="Nenhum match recíproco disponível no momento"
          descricao="O algoritmo só recomenda matches quando há simetria perfeita de interesses e ofertas mútuas. Cadastre novos interesses ou publique mais habilidades para ampliar suas combinações."
          acaoLabel="Editar Meus Interesses no Perfil"
          onAcao={() => navegarPara('perfil')}
        />
      ) : (
        <div className="grid-cols-1" style={{ gap: '2rem' }}>
          {matches.map((m, idx) => (
            <div key={idx} className="card" style={{ padding: '2rem', border: '1px solid var(--border-hover)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {m.parceiroAvatarUrl ? (
                    <img src={m.parceiroAvatarUrl} alt={m.parceiroNome} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.3rem' }}>
                      {m.parceiroNome[0]}
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{m.parceiroNome}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{m.parceiroLocalizacao || 'Profissional Remoto'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="badge badge-success" style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem' }}>
                    Score de Afinidade: {m.scoreCompatibilidade}%
                  </span>
                  {m.propostaEmAndamento && (
                    <span className="badge badge-warning">Proposta Pendente</span>
                  )}
                </div>
              </div>

              {/* Caixa Comparativa de Troca */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1.25rem',
                backgroundColor: 'var(--bg-surface)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
                border: '1px solid var(--border-subtle)'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Sua Oferta na Negociação
                  </span>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-primary)', marginTop: '0.2rem' }}>
                    {m.meuServicoTitulo}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Tag: #{m.meuServicoTipo}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ backgroundColor: 'var(--bg-card)', padding: '0.6rem', borderRadius: 'var(--radius-full)', color: 'var(--color-success)' }}>
                    <ArrowLeftRight size={20} />
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Oferta que Você Recebe em Troca
                  </span>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-success)', marginTop: '0.2rem' }}>
                    {m.servicoParceiroTitulo}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Tag: #{m.servicoParceiroTipo}
                  </span>
                </div>
              </div>

              {/* Explicação do Algoritmo */}
              <div style={{
                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                borderLeft: '4px solid var(--color-success)',
                padding: '0.85rem 1rem',
                borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                marginBottom: '1.5rem',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)'
              }}>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.2rem' }}>
                  Por que esta combinação é recíproca?
                </strong>
                {m.motivoMatch}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button 
                  onClick={() => handleAbrirPropostaMatch(m)}
                  className="btn btn-primary"
                  disabled={m.propostaEmAndamento}
                >
                  <SendHorizontal size={16} /> 
                  {m.propostaEmAndamento ? 'Proposta Já em Andamento' : 'Enviar Proposta a partir do Match'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Envio a partir do Match */}
      {modalMatch && (
        <div className="modal-overlay" onClick={() => setModalMatch(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Formalizar Proposta para {modalMatch.parceiroNome}</h3>
              <button onClick={() => setModalMatch(null)} className="btn btn-ghost btn-sm">✕</button>
            </div>

            <form onSubmit={handleEnviarProposta}>
              <div className="modal-body">
                {erro && (
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
                    <span>{erro}</span>
                  </div>
                )}

                <div style={{ backgroundColor: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
                  <div style={{ marginBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Você entrega:</span> <strong>{modalMatch.meuServicoTitulo}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Você recebe:</span> <strong>{modalMatch.servicoParceiroTitulo}</strong>
                  </div>
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
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Mensagem de Apresentação</label>
                  <textarea 
                    className="form-textarea" 
                    rows={3}
                    value={mensagem}
                    onChange={e => setMensagem(e.target.value)}
                  />
                </div>

                {/* Condições Contratuais */}
                <div className="form-group">
                  <label className="form-label">Condições do Escambo</label>
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
                      placeholder="Adicionar condição..."
                      value={novaCondicaoDesc}
                      onChange={e => setNovaCondicaoDesc(e.target.value)}
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
                <button type="button" onClick={() => setModalMatch(null)} className="btn btn-ghost">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={enviando}>
                  {enviando ? 'Enviando...' : 'Confirmar e Enviar Proposta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
