import React, { useEffect, useState } from 'react';
import { api, Contrato, VerificacaoIntegridade } from '../services/api';
import { 
  FileCheck2, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  Check, 
  Lock, 
  ArrowLeftRight, 
  Info 
} from 'lucide-react';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';

interface ContratosPageProps {
  contratoDestaqueId?: string;
  navegarPara: (rota: string, params?: any) => void;
}

export const ContratosPage: React.FC<ContratosPageProps> = ({ contratoDestaqueId, navegarPara }) => {
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [contratoSelecionado, setContratoSelecionado] = useState<Contrato | null>(null);
  const [verificacao, setVerificacao] = useState<VerificacaoIntegridade | null>(null);
  const [verificando, setVerificando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    carregarContratos();
  }, []);

  const carregarContratos = async () => {
    try {
      setCarregando(true);
      const res = await api.contratos.listarMeus();
      setContratos(res);

      if (contratoDestaqueId) {
        const achado = res.find(c => c.id === contratoDestaqueId);
        if (achado) setContratoSelecionado(achado);
        else if (res.length > 0) setContratoSelecionado(res[0]);
      } else if (res.length > 0) {
        setContratoSelecionado(res[0]);
      }
    } catch (err) {
      console.error('Erro ao listar contratos:', err);
    } finally {
      setCarregando(false);
    }
  };

  const handleVerificarIntegridade = async (id: string) => {
    try {
      setVerificando(true);
      const res = await api.contratos.verificarIntegridade(id);
      setVerificacao(res);
    } catch (err) {
      console.error('Erro ao verificar integridade:', err);
    } finally {
      setVerificando(false);
    }
  };

  const copiarHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  if (carregando) {
    return <LoadingSpinner mensagem="Carregando documentos contratuais e registros de hash..." />;
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 4rem' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <ShieldCheck size={20} color="var(--color-info)" />
          <span style={{ fontSize: '0.85rem', color: 'var(--color-info)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Auditoria Criptográfica de Contratos
          </span>
        </div>
        <h2>Contratos de Escambo Formalizados</h2>
        <p>Documentos emitidos com conteúdo canônico e hash SHA-256 para verificação determinística de integridade.</p>
      </div>

      {contratos.length === 0 ? (
        <EmptyState 
          icon={FileCheck2}
          titulo="Nenhum contrato formalizado ainda"
          descricao="Os contratos são gerados automaticamente quando uma proposta é aceita e todas as condições acordadas são concluídas com sucesso."
          acaoLabel="Ver Minhas Propostas"
          onAcao={() => navegarPara('propostas')}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 340px) 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* Coluna Lateral: Lista de Contratos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Documentos Emitidos ({contratos.length})
            </span>
            {contratos.map(c => {
              const ativo = contratoSelecionado?.id === c.id;
              return (
                <div 
                  key={c.id} 
                  onClick={() => { setContratoSelecionado(c); setVerificacao(null); }}
                  className="card"
                  style={{
                    padding: '1.25rem',
                    cursor: 'pointer',
                    borderColor: ativo ? 'var(--color-primary)' : 'var(--border-subtle)',
                    backgroundColor: ativo ? 'var(--bg-surface)' : 'var(--bg-card)',
                    boxShadow: ativo ? 'var(--shadow-md)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(c.geradoEm).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                      Ativo
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.35rem' }}>
                    {c.proposta.solicitante.nome} ⇄ {c.proposta.destinatario.nome}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {c.proposta.servicoOferecido.titulo} por {c.proposta.servicoSolicitado.titulo}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Coluna Principal: Visualizador do Contrato Oficial */}
          {contratoSelecionado && (
            <div className="card" style={{ padding: '2.5rem', backgroundColor: '#0d1322', border: '1px solid var(--border-hover)' }}>
              {/* Cabeçalho do Documento */}
              <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', fontWeight: 800, fontSize: '1rem', marginBottom: '0.35rem' }}>
                    <Lock size={16} /> INSTRUMENTO PARTICULAR DE ESCAMBO DE SERVIÇOS
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    ID do Registro: {contratoSelecionado.id}
                  </span>
                </div>

                <button 
                  onClick={() => handleVerificarIntegridade(contratoSelecionado.id)}
                  className="btn btn-secondary btn-sm"
                  disabled={verificando}
                  style={{ borderColor: 'var(--color-info)', color: 'var(--color-info)' }}
                >
                  <ShieldCheck size={16} /> {verificando ? 'Auditando...' : 'Verificar Integridade SHA-256'}
                </button>
              </div>

              {/* Resultado da Auditoria Criptográfica */}
              {verificacao && (
                <div style={{
                  backgroundColor: verificacao.integro ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                  border: `1px solid ${verificacao.integro ? 'rgba(16, 185, 129, 0.4)' : 'var(--color-danger)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  marginBottom: '2rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: verificacao.integro ? 'var(--color-success)' : 'var(--color-danger)', marginBottom: '0.5rem' }}>
                    {verificacao.integro ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                    {verificacao.integro ? 'INTEGRIDADE CRIPTOGRÁFICA 100% CONFIRMADA' : 'VIOLAÇÃO DETECTADA'}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                    {verificacao.mensagemExplicativa}
                  </p>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div>Hash Gravado: <span style={{ color: 'var(--color-info)' }}>{verificacao.hashRegistrado}</span></div>
                    <div>Hash Recalculado: <span style={{ color: 'var(--color-success)' }}>{verificacao.hashCalculado}</span></div>
                  </div>
                </div>
              )}

              {/* Corpo do Contrato */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                <div>
                  <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>CLÁUSULA 1ª — DAS PARTES</h4>
                  <p>
                    O presente instrumento vincula de forma bilateral e recíproca as seguintes partes cadastradas e autenticadas na plataforma BarterTech:
                  </p>
                  <ul style={{ listStyle: 'none', marginTop: '0.5rem', paddingLeft: '0.75rem' }}>
                    <li><strong>Proponente:</strong> {contratoSelecionado.proposta.solicitante.nome} ({contratoSelecionado.proposta.solicitante.email})</li>
                    <li><strong>Contraparte:</strong> {contratoSelecionado.proposta.destinatario.nome} ({contratoSelecionado.proposta.destinatario.email})</li>
                  </ul>
                </div>

                <div>
                  <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>CLÁUSULA 2ª — DO OBJETO DO ESCAMBO</h4>
                  <p>
                    As partes acordam na execução mútua de serviços profissionais sem contraprestação financeira:
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '0.75rem' }}>
                    <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                      <strong style={{ color: 'var(--color-primary)', display: 'block', marginBottom: '0.25rem' }}>Entregue pelo Proponente:</strong>
                      {contratoSelecionado.proposta.servicoOferecido.titulo} ({contratoSelecionado.proposta.servicoOferecido.tipo})
                    </div>
                    <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                      <strong style={{ color: 'var(--color-success)', display: 'block', marginBottom: '0.25rem' }}>Entregue pela Contraparte:</strong>
                      {contratoSelecionado.proposta.servicoSolicitado.titulo} ({contratoSelecionado.proposta.servicoSolicitado.tipo})
                    </div>
                  </div>
                </div>

                <div>
                  <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>CLÁUSULA 3ª — DAS CONDIÇÕES OBRIGATÓRIAS E ATENDIDAS</h4>
                  <p>
                    Todas as condições e prazos acordados foram integralmente marcados como cumpridos antes da emissão deste documento:
                  </p>
                  <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {contratoSelecionado.proposta.condicoes.map(cond => (
                      <div key={cond.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                        <CheckCircle2 size={16} color="var(--color-success)" />
                        <span>{cond.descricao}</span>
                        {cond.obrigatoria && <span className="badge badge-warning" style={{ fontSize: '0.6rem' }}>Obrigatória</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hash Criptográfico e Canônico */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem', marginTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Hash SHA-256 de Integridade do Conteúdo Canônico:
                    </span>
                    <button 
                      onClick={() => copiarHash(contratoSelecionado.hashIntegridade)}
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    >
                      {copiado ? <Check size={14} color="var(--color-success)" /> : <Copy size={14} />}
                      {copiado ? 'Copiado!' : 'Copiar Hash'}
                    </button>
                  </div>
                  <div className="crypto-hash">
                    {contratoSelecionado.hashIntegridade}
                  </div>
                </div>

                {/* Aviso Legal de Engenharia */}
                <div style={{
                  display: 'flex',
                  gap: '0.65rem',
                  backgroundColor: 'var(--bg-surface)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <Info size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Nota de Transparência Técnica:</strong> O hash SHA-256 acima permite detectar com rigor matemático qualquer adulteração no conteúdo textual canônico armazenado. Isso atesta integridade de registro na base de dados, mas não equivale a assinatura digital com chave privada (ICP-Brasil/X.509) nem substitui formalização com fé pública cartorial.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
