import React, { ReactNode } from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center bg-[#111827]/40 border border-dashed border-slate-800 rounded-2xl my-4">
      <div className="p-4 rounded-2xl bg-slate-800/60 text-slate-400 mb-4 border border-slate-700/50">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mt-1 mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} icon={actionIcon} variant="outline" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
