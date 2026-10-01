import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Erro capturado na renderização:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleClearStorageAndReset = () => {
    try {
      // Limpa dados locais que possam ter corrompido o estado
      const keysToClear = [
        'ambozini_react_portal_state_v1_company_values',
        'ambozini_react_portal_state_v1_announcements',
        'ambozini_react_portal_state_v1_posts',
        'ambozini_react_portal_state_v1_dynamic_cards'
      ];
      keysToClear.forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      console.error(e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f7f5ee] dark:bg-[#161212] text-stone-900 dark:text-stone-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-[#1f191a] border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-4 animate-fade-in">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#7c172e]/10 text-[#7c172e] dark:text-rose-400 flex items-center justify-center font-bold">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-black text-stone-900 dark:text-stone-100">
                Ops! Algo inesperado aconteceu.
              </h2>
              <p className="text-xs text-stone-500 leading-relaxed">
                O portal identificou uma falha de visualização e protegeu a sua sessão para evitar perda de dados.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-stone-100 dark:bg-stone-900 rounded-xl text-left overflow-hidden">
                <p className="text-[11px] font-mono text-stone-600 dark:text-stone-400 truncate">
                  {this.state.error.message || 'Erro de execução'}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#7c172e] hover:bg-[#631023] transition-colors shadow-sm cursor-pointer"
              >
                <RefreshCw size={14} />
                <span>Recarregar Portal</span>
              </button>

              <button
                type="button"
                onClick={this.handleClearStorageAndReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors border border-stone-200 dark:border-stone-700 cursor-pointer"
                title="Limpa caches locais corrompidos e restaura dados padrão"
              >
                <Trash2 size={13} />
                <span>Restaurar Padrão</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

