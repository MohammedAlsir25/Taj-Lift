import React from 'react';

export interface StatusBadgeProps {
  type: 'success' | 'warning' | 'info' | 'neutral';
  text: string;
}

export default function StatusBadge({ type, text }: StatusBadgeProps) {
  let colorClasses = '';

  switch (type) {
    case 'success':
      colorClasses = 'text-emerald-300 bg-emerald-500/20 border-emerald-500/25';
      break;
    case 'warning':
      colorClasses = 'text-amber-300 bg-amber-500/20 border-amber-500/25';
      break;
    case 'info':
      colorClasses = 'text-sky-300 bg-sky-500/20 border-sky-500/25';
      break;
    case 'neutral':
    default:
      colorClasses = 'text-white/70 bg-white/10 border-white/15';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${colorClasses}`}>
      {text}
    </span>
  );
}
