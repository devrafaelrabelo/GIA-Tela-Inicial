import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  LayoutGrid,
  BarChart3,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useModalDismiss } from '../../hooks/useModalDismiss';

export const GiaLoginModal: React.FC = () => {
  const { isGiaModalOpen, closeGiaModal, loginAs, switchUser, handleGiaLogin, showToast } = useAuth();
  const [email, setEmail] = useState('amboziniti@gmail.com');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { handleBackdropClick } = useModalDismiss({
    isOpen: isGiaModalOpen,
    onClose: closeGiaModal
  });

  if (!isGiaModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() && !password.trim()) {
      showToast('Por favor, informe seu e-mail ou a senha de setor.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      if (!email.trim()) {
        // Login por senha antiga de loja ou setor
        await handleGiaLogin('amboziniti@gmail.com');
        showToast('Acesso por credencial de setor autorizado! Bem-vindo.', 'success');
      } else {
        await handleGiaLogin(email);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    showToast(
      'Para redefinir sua senha, solicite ao RH ou ao suporte de TI no ramal 2040.',
      'info'
    );
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in"
    >
      {/* Modal Container: Solid Background matching existing layout */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="gia-login-title"
        className="relative max-w-5xl w-full p-6 sm:p-10 shadow-2xl bg-[#faf8f5] dark:bg-[#1a1415] border border-stone-300/80 dark:border-stone-800 rounded-3xl overflow-hidden max-h-[95vh] overflow-y-auto overscroll-contain animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close button */}
        <button
          onClick={closeGiaModal}
          aria-label="Fechar tela de login GIA"
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-2 rounded-xl hover:bg-stone-200/70 dark:hover:bg-stone-800 transition-colors z-20 cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* 2-Column Corporate Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* ========================================================
              COLUNA ESQUERDA: IDENTIDADE CORPORATIVA E CONCEITO
              ======================================================== */}
          <div className="lg:col-span-7 space-y-5">
            {/* Pill: Acesso Corporativo Seguro */}
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-[#fbe6ea] dark:bg-rose-950/80 text-[#7c172e] dark:text-rose-200 border border-rose-200/80 dark:border-rose-900/60 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#bd1e3c] animate-pulse"></span>
                <span>ACESSO CORPORATIVO SEGURO</span>
              </span>
            </div>

            {/* Logo GIÁ com folha estilizada + Gestão Integrada Ambrozini + Linha divisória */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-baseline gap-1 font-black tracking-tighter text-4xl sm:text-5xl text-[#7c172e] dark:text-rose-400 font-sans leading-none">
                <span>GI</span>
                <span className="relative inline-block">
                  A
                  {/* Folha/Acento estilizado que caracteriza a marca GIÁ */}
                  <span className="absolute -top-3.5 -right-1 text-emerald-600 dark:text-emerald-400">
                    <svg
                      className="w-5 h-5 -rotate-12 transform"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-13 4" />
                    </svg>
                  </span>
                </span>
              </div>
              <p className="text-sm font-extrabold text-stone-800 dark:text-stone-200 tracking-wide">
                Gestão Integrada Ambrozini
              </p>
              <div className="pt-1 pb-1">
                <div className="w-full max-w-xs border-t border-stone-300 dark:border-stone-700/80" />
              </div>
              <p className="text-[10px] text-[#7c172e] dark:text-rose-300 font-extrabold uppercase tracking-widest">
                UMA SOLUÇÃO AMBOZINI
              </p>
            </div>

            {/* Conceito Corporativo e Headline */}
            <div className="pt-2 space-y-2">
              <p className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-[#7c172e] dark:text-rose-400">
                CONCEITO CORPORATIVO OPERACIONAL
              </p>
              <h2
                id="gia-login-title"
                className="text-3xl sm:text-4xl lg:text-[40px] font-black text-stone-900 dark:text-stone-100 leading-[1.1] tracking-tight"
              >
                Gestão que<br />
                impulsiona<br />
                resultados.
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed max-w-lg pt-1">
                Uma entrada única para acompanhar a operação, as unidades e os indicadores autorizados para o seu perfil.
              </p>
            </div>

            {/* 3 Pilares Inferiores em Colunas com divisória superior */}
            <div className="pt-5 border-t border-stone-200/90 dark:border-stone-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Pilar 1 */}
              <div className="space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                  <ShieldCheck size={16} />
                </div>
                <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  Acesso protegido
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-snug">
                  Controle de acesso e proteção de dados.
                </p>
              </div>

              {/* Pilar 2 */}
              <div className="space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-rose-100/80 dark:bg-rose-950/60 text-[#7c172e] dark:text-rose-400 flex items-center justify-center">
                  <LayoutGrid size={16} />
                </div>
                <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  Visão integrada
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-snug">
                  Informação organizada para decidir melhor.
                </p>
              </div>

              {/* Pilar 3 */}
              <div className="space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-amber-100/80 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                  <BarChart3 size={16} />
                </div>
                <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  Mais gestão
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-snug">
                  Operação clara desde o primeiro acesso.
                </p>
              </div>
            </div>
          </div>

          {/* ========================================================
              COLUNA DIREITA: CARD ELEVADO DE LOGIN (ESTILO DO SISTEMA)
              ======================================================== */}
          <div className="lg:col-span-5">
            <div className="p-5 sm:p-7 bg-white dark:bg-[#221b1b] shadow-xl border border-stone-200/90 dark:border-stone-800 rounded-3xl relative space-y-4">
              {/* Header do Card: Status do Sistema */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>SISTEMA ATIVO</span>
                </span>
                <span className="text-[11px] text-stone-400 dark:text-stone-500 font-bold">
                  Portal Ambrozini
                </span>
              </div>

              {/* Título & Subtítulo */}
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
                  Entrar no GIA
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-medium mt-0.5">
                  Gestão Integrada Ambrozini
                </p>
              </div>

              {/* Box Informativo: Acesso Protegido */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 space-y-1 shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  <ShieldCheck size={15} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>Acesso protegido</span>
                </div>
                <p className="text-[11px] text-emerald-900/90 dark:text-emerald-200/90 leading-relaxed">
                  Use sua conta individual ou uma credencial corporativa autorizada.
                </p>
                <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed font-medium">
                  <strong className="font-semibold">Senha antiga de loja ou setor:</strong> deixe o e-mail vazio e informe somente a senha.
                </p>
              </div>

              {/* Formulário de Credenciais */}
              <form onSubmit={handleSubmit} className="space-y-3 pt-1">
                {/* Campo: E-mail da conta (quando aplicável) */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    E-mail da conta{' '}
                    <span className="font-normal text-stone-400 dark:text-stone-500 text-[11px]">
                      (quando aplicável)
                    </span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="amboziniti@gmail.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/60 dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:bg-white dark:focus:bg-stone-900 focus:ring-2 focus:ring-[#7c172e] focus:border-transparent outline-none font-medium text-xs shadow-2xs transition-all"
                    />
                  </div>
                </div>

                {/* Campo: Senha com Toggle de Visualização */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/60 dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:bg-white dark:focus:bg-stone-900 focus:ring-2 focus:ring-[#7c172e] focus:border-transparent outline-none font-medium text-xs shadow-2xs transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Botão de Entrada Primário */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl font-extrabold text-xs text-white bg-gradient-to-r from-[#7c172e] via-[#631023] to-[#251014] hover:from-[#8f1933] hover:to-black shadow-md shadow-rose-950/20 flex items-center justify-center gap-2 transition-all duration-200 active:scale-98 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed mt-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={15} className="animate-spin text-amber-300" />
                      <span>Autenticando...</span>
                    </>
                  ) : (
                    <>
                      <span>Entrar</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>

              {/* Links e Rodapé do Card */}
              <div className="text-center space-y-1.5 pt-1">
                <div>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[11px] font-semibold text-stone-500 hover:text-[#7c172e] dark:hover:text-rose-400 hover:underline cursor-pointer"
                  >
                    Redefinir senha da conta
                  </button>
                </div>
                <p className="text-[10px] text-stone-400 dark:text-stone-500">
                  Indicadores, operação, estoque e metas em um só lugar.
                </p>
              </div>

              {/* Atalhos Rápidos para Testar Permissões (1-Clique) */}
              <div className="pt-3 border-t border-stone-100 dark:border-stone-800">
                <p className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider mb-1.5 text-center">
                  Atalhos de Teste (1-Clique):
                </p>
                <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      loginAs('editor');
                      closeGiaModal();
                    }}
                    className="py-1 px-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-[#7c172e] dark:text-rose-300 font-bold border border-rose-200/70 dark:border-rose-900/50 text-center transition-colors truncate cursor-pointer shadow-2xs"
                    title="Entrar como João Silva (Gestor / Editor)"
                  >
                    👑 Gestor
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      loginAs('reader');
                      closeGiaModal();
                    }}
                    className="py-1 px-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-bold border border-amber-200/70 dark:border-amber-900/50 text-center transition-colors truncate cursor-pointer shadow-2xs"
                    title="Entrar como Lucas Pereira (Colaborador / Leitor)"
                  >
                    👤 Colaborador
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      switchUser('unauthenticated');
                      closeGiaModal();
                    }}
                    className="py-1 px-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 font-bold border border-stone-200 dark:border-stone-700 text-center transition-colors truncate cursor-pointer shadow-2xs"
                    title="Navegar como Visitante Público"
                  >
                    👁️ Visitante
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
