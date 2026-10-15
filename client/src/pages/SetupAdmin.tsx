import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Mail, Key, ArrowRight, CheckCircle2 } from 'lucide-react';
import { authApi } from '../services/api';
import { useToast } from '../context/ToastContext';

export const SetupAdmin: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [setupKey, setSetupKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password || !setupKey) {
      addToast('Todos os campos são obrigatórios!', 'error');
      return;
    }

    try {
      setLoading(true);
      await authApi.setupAdmin({
        name: name.trim(),
        email: email.trim(),
        password,
        setupKey: setupKey.trim(),
      });
      setSuccess(true);
      addToast('Administrador configurado com sucesso!', 'success');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Erro ao inicializar administrador', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 relative z-10 space-y-6">
        <div className="text-center space-y-3">
          <div className="relative inline-block">
            <img
              src="/logo.png"
              alt="Robô LED Partner"
              className="w-20 h-20 mx-auto object-contain rounded-xl drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">Setup Inicial de Administrador</h1>
            <p className="text-xs text-slate-400 mt-1">
              Configure o primeiro usuário com permissão de Admin Geral do sistema.
            </p>
          </div>
        </div>

        {success ? (
          <div className="p-6 bg-emerald-950/50 border border-emerald-900 rounded-xl text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-100">Configuração Concluída!</h3>
            <p className="text-xs text-slate-400">Redirecionando para a tela de login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Chave de Instalação (SETUP_ADMIN_KEY)
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Chave definida no .env"
                  value={setupKey}
                  onChange={(e) => setSetupKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Nome Completo</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Luan Chaves"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">E-mail do Administrador</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="admin@roboledpartner.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Senha Segura</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-lg shadow-amber-600/25 flex items-center justify-center space-x-2 transition-all mt-2"
            >
              {loading ? (
                <span>Criando Administrador...</span>
              ) : (
                <>
                  <span>Criar Conta de Administrador</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
