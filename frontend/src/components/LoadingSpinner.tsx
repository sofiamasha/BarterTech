import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  mensagem?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ mensagem = 'Carregando informações...' }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem', gap: '1rem' }}>
      <Loader2 style={{ width: '2rem', height: '2rem', color: 'var(--color-primary)', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{mensagem}</p>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
