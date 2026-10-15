import React from 'react';
import { ShieldCheck, Code2, Cpu, GitBranch } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2.5rem',
          marginBottom: '2.5rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontWeight: 800, fontSize: '1.2rem' }}>
              <span style={{ color: 'var(--color-primary)' }}>Barter</span>Tech
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              Plataforma profissional de escambo de serviços e economia colaborativa. 
              Conectando habilidades complementares com matching bilateral e integridade contratual verificável.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', color: 'var(--text-muted)' }}>
              <span className="badge badge-primary" style={{ textTransform: 'none' }}>Java 17</span>
              <span className="badge badge-primary" style={{ textTransform: 'none' }}>Spring Boot 3</span>
              <span className="badge badge-primary" style={{ textTransform: 'none' }}>React + TS</span>
            </div>
          </div>

          <div>
            <h4 style={{ marginBottom: '1rem', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
              Segurança & Arquitetura
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={16} color="var(--color-success)" />
                Integridade criptográfica SHA-256
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Cpu size={16} color="var(--color-primary)" />
                Matching bilateral O(M) explicável
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Code2 size={16} color="var(--color-info)" />
                Clean Architecture & Ports & Adapters
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <GitBranch size={16} color="var(--color-warning)" />
                Flyway versionamento de schema
              </li>
            </ul>
          </div>

          <div>
            <h4 style={{ marginBottom: '1rem', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
              Acesso Técnico
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
              <a href="/swagger-ui.html" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Code2 size={16} /> Documentação OpenAPI / Swagger UI
              </a>
              <a href="/v3/api-docs" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Cpu size={16} /> Especificação JSON do Contrato REST
              </a>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                Ambiente com persistência relacional e suíte de testes unitários + integração.
              </span>
            </div>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            &copy; 2026 BarterTech Platform. Desenvolvido para portfólio de engenharia de software e arquitetura de sistemas.
          </div>
          <div>
            Status: <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>Operacional (SHA-256 Verified)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
