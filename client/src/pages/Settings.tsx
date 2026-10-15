import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  History,
  UserPlus,
  Lock,
  User as UserIcon,
  X,
} from 'lucide-react';
import { usersApi, auditApi, authApi } from '../services/api';
import { User, AuditLog, UserRole } from '../types';
import { formatDateBR } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Settings: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'team' | 'audit' | 'profile'>('team');

  // Team state
  const [users, setUsers] = useState<User[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('MARKETING');

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Profile password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await usersApi.getAll();
      setUsers(res.data);
    } catch (err: any) {
      addToast('Erro ao carregar lista de usuários', 'error');
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await auditApi.getLogs();
      setAuditLogs(res.data);
    } catch (err: any) {
      addToast('Erro ao carregar logs de auditoria', 'error');
    }
  };

  useEffect(() => {
    if (activeTab === 'team') fetchUsers();
    if (activeTab === 'audit') fetchAuditLogs();
  }, [activeTab]);

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    try {
      await usersApi.invite({
        name: inviteName.trim(),
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      addToast(`Convite enviado com sucesso para ${inviteEmail}!`, 'success');
      setIsInviteModalOpen(false);
      setInviteName('');
      setInviteEmail('');
      fetchUsers();
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Erro ao convidar usuário', 'error');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;

    try {
      await authApi.changePassword({
        currentPassword,
        newPassword,
      });
      addToast('Senha atualizada com sucesso!', 'success');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Erro ao alterar senha', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span>Configurações & Governança</span>
            <Shield className="w-5 h-5 text-cyan-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Gestão de membros da equipe, permissões de acesso RBAC, auditoria e segurança
          </p>
        </div>

        {activeTab === 'team' && (
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center space-x-1.5 bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-cyan-600/20 transition-all shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Convidar Membro</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/60 rounded-xl px-4 text-xs font-medium">
        <button
          onClick={() => setActiveTab('team')}
          className={`py-3 px-4 border-b-2 flex items-center space-x-2 transition-all ${
            activeTab === 'team'
              ? 'border-cyan-500 text-cyan-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Equipe & Permissões ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`py-3 px-4 border-b-2 flex items-center space-x-2 transition-all ${
            activeTab === 'audit'
              ? 'border-cyan-500 text-cyan-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Logs de Auditoria</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`py-3 px-4 border-b-2 flex items-center space-x-2 transition-all ${
            activeTab === 'profile'
              ? 'border-cyan-500 text-cyan-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Meu Perfil & Senha</span>
        </button>
      </div>

      {/* Tab 1: Team & RBAC */}
      {activeTab === 'team' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Nome / Membro</th>
                  <th className="py-3 px-4">E-mail</th>
                  <th className="py-3 px-4">Nível de Acesso (RBAC)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Membro Desde</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-normal">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-100 flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 font-bold text-xs">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        u.role === 'ADMIN'
                          ? 'bg-amber-950 text-amber-400 border-amber-800'
                          : u.role === 'MARKETING'
                          ? 'bg-cyan-950 text-cyan-400 border-cyan-800'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {u.role === 'ADMIN' ? '👑 Administrador' : u.role === 'MARKETING' ? '⚡ Marketing / CRM' : '👁️ Somente Leitura'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        u.status === 'ACTIVE'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : 'bg-amber-950 text-amber-400 border-amber-800'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{formatDateBR(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Ação / Evento</th>
                  <th className="py-3 px-4">Usuário</th>
                  <th className="py-3 px-4">Entidade</th>
                  <th className="py-3 px-4">Data & Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-normal">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500">Nenhum registro de auditoria.</td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-200">{log.action}</td>
                      <td className="py-3 px-4 text-cyan-400">{log.user?.name || log.userId || 'Sistema'}</td>
                      <td className="py-3 px-4 text-slate-400">{log.entityType} ({log.entityId?.slice(0, 8)}...)</td>
                      <td className="py-3 px-4 text-slate-500">{formatDateBR(log.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Profile & Password */}
      {activeTab === 'profile' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-lg space-y-5">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center space-x-3 text-xs">
            <div className="w-8 h-8 rounded-full bg-cyan-600/20 text-cyan-400 font-bold flex items-center justify-center">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="font-semibold text-slate-100">{currentUser?.name}</div>
              <div className="text-slate-400 text-[11px]">{currentUser?.email} ({currentUser?.role})</div>
            </div>
          </div>

          <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            <span>Alterar Senha de Acesso</span>
          </h2>

          <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Senha Atual:</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Nova Senha (mínimo 8 caracteres):</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg shadow-lg shadow-cyan-600/20"
            >
              Atualizar Minha Senha
            </button>
          </form>
        </div>
      )}

      {/* Modal: Invite User */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-1.5">
                <UserPlus className="w-4 h-4 text-cyan-400" />
                <span>Convidar Membro para a Equipe</span>
              </h3>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-slate-400 hover:text-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInviteUser} className="p-6 space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Gabriela Santos"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">E-mail Corporativo *</label>
                <input
                  type="email"
                  required
                  placeholder="gabriela@roboledpartner.com.br"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Função / Permissão (RBAC)</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-cyan-500"
                >
                  <option value="MARKETING">Marketing & CRM (Criar leads, campanhas e posts)</option>
                  <option value="ADMIN">Administrador Geral (Acesso total e configurações)</option>
                  <option value="READONLY">Somente Leitura (Visualizar dashboards e relatórios)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg shadow-lg shadow-cyan-600/20"
                >
                  Enviar Convite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
