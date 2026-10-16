import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (messageOrObj: string | Omit<ToastItem, 'id'>, type?: ToastType) => void;
  removeToast: (id: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (messageOrObj: any, type: ToastType = 'info') => {
      const id = Math.random().toString(36).substring(2, 9);
      let toastItem: ToastItem;

      if (typeof messageOrObj === 'string') {
        toastItem = {
          id,
          type,
          message: messageOrObj,
          duration: 4000,
        };
      } else if (messageOrObj && typeof messageOrObj === 'object') {
        let msg = 'Ocorreu um erro.';
        if (typeof messageOrObj.message === 'string') {
          msg = messageOrObj.message;
        } else if (typeof messageOrObj.error === 'string') {
          msg = messageOrObj.error;
        } else if (messageOrObj.error && typeof messageOrObj.error.message === 'string') {
          msg = messageOrObj.error.message;
        } else if (typeof messageOrObj.msg === 'string') {
          msg = messageOrObj.msg;
        }

        toastItem = {
          id,
          type: messageOrObj.type || type || 'info',
          title: typeof messageOrObj.title === 'string' ? messageOrObj.title : undefined,
          message: msg,
          duration: typeof messageOrObj.duration === 'number' ? messageOrObj.duration : 4000,
        };
      } else {
        toastItem = {
          id,
          type,
          message: String(messageOrObj || 'Aviso'),
          duration: 4000,
        };
      }

      setToasts((prev) => [...prev, toastItem]);

      if (toastItem.duration && toastItem.duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, toastItem.duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((message: string, title?: string) => {
    addToast({ type: 'success', message, title: title || 'Sucesso' });
  }, [addToast]);

  const error = useCallback((message: string, title?: string) => {
    addToast({ type: 'error', message, title: title || 'Erro' });
  }, [addToast]);

  const warning = useCallback((message: string, title?: string) => {
    addToast({ type: 'warning', message, title: title || 'Atenção' });
  }, [addToast]);

  const info = useCallback((message: string, title?: string) => {
    addToast({ type: 'info', message, title: title || 'Informação' });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => {
          const typeStyles = {
            success: 'bg-slate-900 border-emerald-500/50 text-slate-100 shadow-emerald-500/10',
            error: 'bg-slate-900 border-rose-500/50 text-slate-100 shadow-rose-500/10',
            warning: 'bg-slate-900 border-amber-500/50 text-slate-100 shadow-amber-500/10',
            info: 'bg-slate-900 border-cyan-500/50 text-slate-100 shadow-cyan-500/10',
          }[toast.type];

          const IconComponent = {
            success: CheckCircle2,
            error: AlertCircle,
            warning: AlertTriangle,
            info: Info,
          }[toast.type];

          const iconColor = {
            success: 'text-emerald-400',
            error: 'text-rose-400',
            warning: 'text-amber-400',
            info: 'text-cyan-400',
          }[toast.type];

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto p-4 rounded-xl border shadow-xl flex items-start gap-3 backdrop-blur-md animate-slide-up ${typeStyles}`}
            >
              <IconComponent className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 space-y-0.5">
                {toast.title && <div className="text-xs font-bold text-slate-100">{toast.title}</div>}
                <div className="text-xs text-slate-300 leading-relaxed">{toast.message}</div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-200 transition-colors p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
