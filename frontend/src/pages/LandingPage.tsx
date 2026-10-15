import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  ShieldCheck, 
  Sparkles, 
  Layers, 
  FileCheck2, 
  CheckCircle2, 
  Search, 
  Users, 
  ArrowRight 
} from 'lucide-react';

interface LandingPageProps {
  navegarPara: (rota: string, params?: any) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navegarPara }) => {
  // Estado para o simulador interativo de matching
  const [simuladorOferece, setSimuladorOferece] = useState('design');
  const [simuladorProcura, setSimuladorProcura] = useState('ingles');

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        padding: '5rem 0 4rem',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59, 130, 246, 0.15), transparent)'
      }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '850px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            backgroundColor: 'var(--color-primary-subtle)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: 'var(--radius-full)',
            color: 'var(--color-primary)',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1.5rem'
          }}>
            <Sparkles size={16} /> Economia Colaborativa Sem Moeda Fiat
          </div>

          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', lineHeight: 1.15, marginBottom: '1.5rem', fontWeight: 800 }}>
            Troque suas habilidades profissionais por aquilo que você precisa.
          </h1>

          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            O <strong>BarterTech</strong> conecta profissionais em relações de troca bilateral recíproca.
            Você oferece o que domina, encontra quem oferece o que você busca e formaliza contratos de escambo protegidos por integridade criptográfica SHA-256.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navegarPara('cadastro')} className="btn btn-primary btn-lg">
              Começar Agora Gratuitamente <ArrowRight size={18} />
            </button>
            <button onClick={() => navegarPara('catalogo')} className="btn btn-secondary btn-lg">
              <Search size={18} /> Explorar Catálogo de Serviços
            </button>
          </div>
        </div>
      </section>

      {/* Simulador Interativo de Matching */}
      <section style={{ padding: '4.5rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3rem' }}>
            <span className="badge badge-primary" style={{ marginBottom: '0.75rem' }}>Lógica de Algoritmo</span>
            <h2>Veja o Matching Bilateral em Tempo Real</h2>
            <p>Selecione uma habilidade para oferecer e o que gostaria de receber em troca para simular a identificação de reciprocidade.</p>
          </div>

          <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '2.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                  1. O que você oferece?
                </label>
                <select 
                  className="form-select" 
                  value={simuladorOferece} 
                  onChange={(e) => setSimuladorOferece(e.target.value)}
                >
                  <option value="design">Design de UI/UX & Identidade Visual</option>
                  <option value="programacao">Desenvolvimento Backend / APIs</option>
                  <option value="ingles">Aulas de Conversação em Inglês</option>
                  <option value="fotografia">Fotografia Comercial e Retratos</option>
                </select>
              </div>

              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem' }}>
                  2. O que você procura?
                </label>
                <select 
                  className="form-select" 
                  value={simuladorProcura} 
                  onChange={(e) => setSimuladorProcura(e.target.value)}
                >
                  <option value="ingles">Aulas de Conversação em Inglês</option>
                  <option value="design">Design de UI/UX & Identidade Visual</option>
                  <option value="programacao">Desenvolvimento Backend / APIs</option>
                  <option value="fotografia">Fotografia Comercial e Retratos</option>
                </select>
              </div>
            </div>

            {/* Resultado do Match */}
            <div style={{
              backgroundColor: simuladorOferece === simuladorProcura ? 'var(--bg-surface)' : 'rgba(16, 185, 129, 0.08)',
              border: `1px solid ${simuladorOferece === simuladorProcura ? 'var(--border-subtle)' : 'rgba(16, 185, 129, 0.3)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              flexWrap: 'wrap'
            }}>
              <div style={{
                backgroundColor: simuladorOferece === simuladorProcura ? 'var(--bg-card)' : 'var(--color-success)',
                color: '#ffffff',
                padding: '0.75rem',
                borderRadius: 'var(--radius-full)',
                display: 'flex'
              }}>
                <ArrowLeftRight size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: simuladorOferece === simuladorProcura ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                  {simuladorOferece === simuladorProcura 
                    ? 'A troca exige habilidades complementares'
                    : 'Compatibilidade Recíproca Detectada (Score 100%)'}
                </div>
                <p style={{ fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
                  {simuladorOferece === simuladorProcura
                    ? 'Você não pode propor uma troca pela mesma habilidade que está oferecendo.'
                    : `O algoritmo identificou pares compatíveis no sistema: profissionais oferecendo "${simuladorProcura}" que têm interesse ativo em receber "${simuladorOferece}".`}
                </p>
              </div>
              {simuladorOferece !== simuladorProcura && (
                <button onClick={() => navegarPara('catalogo')} className="btn btn-success btn-sm">
                  Ver Ofertas Reais
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Pilares de Engenharia */}
      <section style={{ padding: '4.5rem 0', backgroundColor: 'var(--bg-surface)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3.5rem' }}>
            <span className="badge badge-primary" style={{ marginBottom: '0.75rem' }}>Pilares da Plataforma</span>
            <h2>Como o BarterTech Funciona</h2>
            <p>Do cadastro à formalização, cada etapa foi desenhada com segurança e regras de negócio rígidas.</p>
          </div>

          <div className="grid-cols-4">
            <div className="card">
              <div style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}><Layers size={28} /></div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>1. Catálogo de Habilidades</h3>
              <p style={{ fontSize: '0.875rem' }}>Publique seus serviços com descrição clara, categoria e status de disponibilidade controlável em 1 clique.</p>
            </div>

            <div className="card">
              <div style={{ color: 'var(--color-success)', marginBottom: '1rem' }}><Sparkles size={28} /></div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>2. Matching Explicável</h3>
              <p style={{ fontSize: '0.875rem' }}>Nosso motor de busca analisa seus interesses e sugere apenas combinações com simetria bilateral comprovada.</p>
            </div>

            <div className="card">
              <div style={{ color: 'var(--color-warning)', marginBottom: '1rem' }}><CheckCircle2 size={28} /></div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>3. Condições Acordadas</h3>
              <p style={{ fontSize: '0.875rem' }}>Adicione cláusulas e entregáveis na proposta. Condições obrigatórias precisam ser cumpridas antes da formalização.</p>
            </div>

            <div className="card">
              <div style={{ color: 'var(--color-info)', marginBottom: '1rem' }}><ShieldCheck size={28} /></div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>4. Contrato Criptográfico</h3>
              <p style={{ fontSize: '0.875rem' }}>Ao aceitar, o contrato é gerado em formato canônico com digest SHA-256 auditável para atestar que o texto não foi adulterado.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
