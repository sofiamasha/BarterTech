import React from 'react';

interface BadgeProps {
  status: string;
  label?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, label }) => {
  const formatado = label || status.replace('_', ' ');
  return <span className={`badge badge-${status}`}>{formatado}</span>;
};
