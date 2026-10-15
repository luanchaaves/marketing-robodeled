import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B0F17] disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5',
  }[size];

  const variants = {
    primary:
      'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold focus:ring-cyan-400 shadow-md hover:shadow-cyan-500/20',
    glow:
      'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold shadow-lg shadow-cyan-500/25 focus:ring-cyan-400',
    secondary:
      'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/80 focus:ring-slate-400',
    outline:
      'bg-transparent hover:bg-slate-800/80 text-cyan-400 border border-cyan-500/40 hover:border-cyan-400 focus:ring-cyan-400',
    danger:
      'bg-red-600 hover:bg-red-500 text-white font-semibold focus:ring-red-500 shadow-md hover:shadow-red-500/20',
    ghost:
      'bg-transparent hover:bg-slate-800 text-slate-300 hover:text-white focus:ring-slate-400',
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizes} ${variants} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
};
