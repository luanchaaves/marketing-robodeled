import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  private toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900/90 border border-red-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            {/* Glow accent */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-wide">
                  Ocorreu um erro na interface
                </h2>
                <p className="text-xs text-slate-400">
                  Robô LED Partner — Painel de Marketing
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              Não foi possível carregar este módulo no momento. Seus dados e a sessão continuam seguros. Você pode recarregar a tela ou retornar à página inicial.
            </p>

            {/* Error Message Box */}
            {this.state.error && (
              <div className="mb-6 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-red-300 break-words">
                {this.state.error.name}: {this.state.error.message}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <button
                onClick={this.handleReload}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-cyan-500/25 active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                Recarregar Tela
              </button>

              <button
                onClick={this.handleGoHome}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm border border-slate-700/60 transition-all active:scale-95"
              >
                <Home className="w-4 h-4" />
                Página Inicial
              </button>
            </div>

            {/* Collapsible Details */}
            {this.state.errorInfo && (
              <div className="mt-4 pt-4 border-t border-slate-800/80">
                <button
                  onClick={this.toggleDetails}
                  className="flex items-center justify-between w-full text-xs text-slate-400 hover:text-slate-300 font-medium"
                >
                  <span>Detalhes técnicos do erro</span>
                  {this.state.showDetails ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {this.state.showDetails && (
                  <pre className="mt-2 p-3 rounded-lg bg-black/60 border border-slate-800 text-[11px] text-slate-400 font-mono overflow-auto max-h-48 whitespace-pre-wrap">
                    {this.state.error?.stack}
                    {'\n'}
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
