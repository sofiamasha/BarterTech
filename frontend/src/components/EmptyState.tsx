import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  titulo: string;
  descricao: string;
  acaoLabel?: string;
  onAcao?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  titulo,
  descricao,
  acaoLabel,
  onAcao,
}) => {
  return (
    <div style={{
      textAlign: 'center',
      padding: '4rem 1.5rem',
      backgroundColor: 'var(--bg-surface)',
      border: '1px dashed var(--border-hover)',
      borderRadius: 'var(--radius-lg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      maxWidth: '540px',
      margin: '2rem auto'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-card)',
        padding: '1rem',
        borderRadius: 'var(--radius-full)',
        marginBottom: '1.25rem',
        color: 'var(--color-primary)'
      }}>
        <Icon size={32} />
      </div>
      <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>{titulo}</h3>
      <p style={{ marginBottom: '1.5rem', maxWidth: '400px' }}>{descricao}</p>
      {acaoLabel && onAcao && (
        <button onClick={onAcao} className="btn btn-primary">
          {acaoLabel}
        </button>
      )}
    </div>
  );
};
