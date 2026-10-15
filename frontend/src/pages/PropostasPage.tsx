import React, { useEffect, useState } from 'react';
import { api, Proposta } from '../services/api';
import { 
  SendHorizontal, 
  Inbox, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileCheck2, 
  AlertCircle, 
  History, 
  CheckSquare, 
  Square 
} from 'lucide-react';
import { Badge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';

interface PropostasPageProps {
  navegarPara: (rota: string, params?: any) => void;
}

export const PropostasPage: React.FC<PropostasPageProps> = ({ navegarPara }) => {
  const [abaAtiva, setAbaAtiva] = useState<'recebidas' | 'enviadas'>('recebidas');
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [processandoId, setProcessandoId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    carregarPropostas();
  }, [abaAtiva]);

  const carregarPropostas = async () => {
    try {
      setCarregando(true);
      setErro(null);
      const res = abaAtiva === 'recebidas' 
        ? await api.propostas.listarRecebidas() 
        : await api.propostas.listarEnviadas();
      setPropostas(res);
    } catch (err: any) {
      setErro(err.message || 'Erro ao carregar propostas.');
    } finally {
      setCarregando(false);
    }
  };

  const handleAceitar = async (id: string) => {
    try {
      setProcessandoId(id);
      await api.propostas.aceitar(id);
      await carregarPropostas();
    } catch (err: any) {
      alert(err.message || 'Erro ao aceitar proposta.');
    } finally {
      setProcessandoId(null);
    }
  };

  const handleRejeitar = async (id: string) => {
    if (!window.confirm('Tem certeza de que deseja recusar esta proposta de escambo?')) return;
    try {
      setProcessandoId(id);
      await api.propostas.rejeitar(id);
      await carregarPropostas();
    } catch (err: any) {
      alert(err.message || 'Erro ao rejeitar proposta.');
    } finally {
      setProcessandoId(null);
    }
  };

  const handleCancelar = async (id: string) => {
    if (!window.confirm('Deseja cancelar esta proposta que você enviou?')) return;
    try {
      setProcessandoId(id);
      await api.propostas.cancelar(id);
      await carregarPropostas();
    } catch (err: any) {
      alert(err.message || 'Erro ao cancelar proposta.');
    } finally {
      setProcessandoId(null);
    }
  };

  const handleAlternarCondicao = async (propostaId: string, condicaoId: string) => {
    try {
      await api.propostas.alternarCondicao(propostaId, condicaoId);
      await carregarPropostas();
    } catch (err: any) {
      alert(err.message || 'Erro ao alternar condição.');
    }
  };

  const handleGerarContrato = async (propostaId: string) => {
    try {
      setProcessandoId(propostaId);
      const contrato = await api.contratos.gerar(propostaId);
      navegarPara('contratos', { contratoDestaqueId: contrato.id });
    } catch (err: any) {
      alert(err.message || 'Erro ao gerar contrato. Verifique se todas as condições obrigatórias foram atendidas.');
    } finally {
      setProcessandoId(null);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 4rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Gestão de Negociações
        </span>
        <h2>Propostas de Troca de Serviços</h2>
        <p>Acompanhe o status das propostas recebidas e enviadas, marque condições cumpridas e formalize contratos.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '2rem' }}>
        <button 
          onClick={() => setAbaAtiva('recebidas')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: abaAtiva === 'recebidas' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: abaAtiva === 'recebidas' ? 'var(--color-primary)' : 'var(--text-secondary)',
            fontWeight: 700,
            padding: '0.75rem 1.25rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.95rem'
          }}
        >
          <Inbox size={18} /> Propostas Recebidas
        </button>

        <button 
          onClick={() => setAbaAtiva('enviadas')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: abaAtiva === 'enviadas' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: abaAtiva === 'enviadas' ? 'var(--color-primary)' : 'var(--text-secondary)',
            fontWeight: 700,
            padding: '0.75rem 1.25rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.95rem'
          }}
        >
          <SendHorizontal size={18} /> Propostas Enviadas
        </button>
      </div>

      {carregando ? (
        <LoadingSpinner mensagem="Carregando propostas e condições acordadas..." />
      ) : propostas.length === 0 ? (
        <EmptyState 
          icon={abaAtiva === 'recebidas' ? Inbox : SendHorizontal}
          titulo={abaAtiva === 'recebidas' ? 'Nenhuma proposta recebida' : 'Você ainda não enviou propostas'}
          descricao={abaAtiva === 'recebidas' 
            ? 'Quando outros profissionais propuserem trocas com seus serviços publicados, elas aparecerão aqui.'
            : 'Encontre habilidades no catálogo ou na central de matches e inicie uma proposta de escambo.'}
          acaoLabel="Explorar Catálogo de Serviços"
          onAcao={() => navegarPara('catalogo')}
        />
      ) : (
        <div className="grid-cols-1" style={{ gap: '2rem' }}>
          {propostas.map(p => (
            <div key={p.id} className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                      {abaAtiva === 'recebidas' ? `Proposta de ${p.solicitante.nome}` : `Proposta para ${p.destinatario.nome}`}
                    </span>
                    <Badge status={p.status} />
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Enviada em {new Date(p.criadaEm).toLocaleDateString('pt-BR')} • Expira em {new Date(p.expiraEm).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                {p.contratoId && (
                  <button 
                    onClick={() => navegarPara('contratos', { contratoDestaqueId: p.contratoId })}
                    className="btn btn-secondary btn-sm"
                    style={{ borderColor: 'var(--color-info)', color: 'var(--color-info)' }}
                  >
                    <FileCheck2 size={16} /> Ver Contrato Emitido
                  </button>
                )}
              </div>

              {/* Grid Comparativo dos Serviços */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
                backgroundColor: 'var(--bg-surface)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
                border: '1px solid var(--border-subtle)'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Serviço Oferecido (pelo solicitante):
                  </span>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-primary)', marginTop: '0.2rem' }}>
                    {p.servicoOferecido.titulo}
                  </div>
                  <p style={{ fontSize: '0.825rem', marginTop: '0.25rem' }}>{p.servicoOferecido.descricao}</p>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Serviço Solicitado (em contrapartida):
                  </span>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-success)', marginTop: '0.2rem' }}>
                    {p.servicoSolicitado.titulo}
                  </div>
                  <p style={{ fontSize: '0.825rem', marginTop: '0.25rem' }}>{p.servicoSolicitado.descricao}</p>
                </div>
              </div>

              {/* Mensagem */}
              {p.mensagem && (
                <div style={{ backgroundColor: 'var(--bg-input)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                  <strong style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Mensagem de Negociação:
                  </strong>
                  "{p.mensagem}"
                </div>
              )}

              {/* Condições Acordadas */}
              {p.condicoes.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.65rem' }}>
                    Condições do Escambo:
                  </strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {p.condicoes.map(c => (
                      <div 
                        key={c.id} 
                        onClick={() => handleAlternarCondicao(p.id, c.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                          padding: '0.6rem 0.85rem',
                          backgroundColor: c.atendida ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-surface)',
                          border: `1px solid ${c.atendida ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)'}`,
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {c.atendida ? (
                          <CheckSquare size={18} color="var(--color-success)" />
                        ) : (
                          <Square size={18} color="var(--text-muted)" />
                        )}
                        <span style={{ textDecoration: c.atendida ? 'line-through' : 'none', color: c.atendida ? 'var(--text-muted)' : 'var(--text-primary)', flex: 1 }}>
                          {c.descricao}
                        </span>
                        {c.obrigatoria && (
                          <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>
                            Obrigatória para Contrato
                          </span>
                        )}
                        <span style={{ fontSize: '0.75rem', color: c.atendida ? 'var(--color-success)' : 'var(--text-muted)' }}>
                          {c.atendida ? 'Atendida' : 'Clique para marcar'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trilha de Histórico */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                  <History size={13} /> Histórico de Transições:
                </span>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {p.historico.map(h => (
                    <span key={h.id}>
                      • <strong>{h.status}</strong>: {h.observacao} ({new Date(h.ocorridoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })})
                    </span>
                  ))}
                </div>
              </div>

              {/* Ações da Proposta */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
                {p.podeRejeitar && (
                  <button 
                    onClick={() => handleRejeitar(p.id)} 
                    className="btn btn-danger btn-sm"
                    disabled={processandoId === p.id}
                  >
                    <XCircle size={15} /> Recusar Proposta
                  </button>
                )}

                {p.podeAceitar && (
                  <button 
                    onClick={() => handleAceitar(p.id)} 
                    className="btn btn-success"
                    disabled={processandoId === p.id}
                  >
                    <CheckCircle2 size={16} /> Aceitar Proposta de Escambo
                  </button>
                )}

                {p.podeCancelar && (
                  <button 
                    onClick={() => handleCancelar(p.id)} 
                    className="btn btn-ghost btn-sm"
                    disabled={processandoId === p.id}
                  >
                    Cancelar Envio
                  </button>
                )}

                {p.podeGerarContrato && (
                  <button 
                    onClick={() => handleGerarContrato(p.id)} 
                    className="btn btn-primary"
                    disabled={processandoId === p.id}
                  >
                    <FileCheck2 size={16} /> Formalizar Contrato com Integridade SHA-256
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
