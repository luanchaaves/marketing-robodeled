import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Sparkles,
  Instagram,
  ChevronLeft,
  ChevronRight,
  List,
  Grid,
  Trash2,
  Edit2,
  X,
} from 'lucide-react';
import { instagramApi } from '../services/api';
import { ContentPost } from '../types';
import { formatDateBR, postStatusLabels, postStatusColors } from '../utils/formatters';
import { useToast } from '../context/ToastContext';
import { AIAssistantModal } from '../components/ai/AIAssistantModal';

export const EditorialCalendar: React.FC = () => {
  const { addToast } = useToast();

  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Post Modal
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState<ContentPost | null>(null);

  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [type, setType] = useState<'REEL' | 'FEED_POST' | 'CAROUSEL' | 'STORY'>('REEL');
  const [status, setStatus] = useState<'DRAFT' | 'PLANNED' | 'APPROVED' | 'PUBLISHED'>('PLANNED');
  const [scheduledAt, setScheduledAt] = useState('');

  const fetchPosts = async () => {
    try {
      const res = await instagramApi.getPosts();
      setPosts(res.data);
    } catch (err: any) {
      addToast('Erro ao carregar calendário editorial', 'error');
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleOpenCreate = (prefillDate?: string) => {
    setPostToEdit(null);
    setTitle('');
    setCaption('');
    setType('REEL');
    setStatus('PLANNED');
    setScheduledAt(prefillDate || new Date().toISOString().slice(0, 16));
    setIsPostModalOpen(true);
  };

  const handleOpenEdit = (p: ContentPost) => {
    setPostToEdit(p);
    setTitle(p.title);
    setCaption(p.caption || '');
    setType(p.type);
    setStatus(p.status);
    setScheduledAt(p.scheduledAt ? p.scheduledAt.slice(0, 16) : '');
    setIsPostModalOpen(true);
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !scheduledAt) return;

    try {
      const payload: any = {
        title,
        caption: caption || undefined,
        type,
        status,
        scheduledAt: new Date(scheduledAt).toISOString(),
      };

      if (postToEdit) {
        await instagramApi.updatePost(postToEdit.id, payload);
        addToast('Post atualizado com sucesso!', 'success');
      } else {
        await instagramApi.createPost(payload);
        addToast('Post agendado no calendário com sucesso!', 'success');
      }

      setIsPostModalOpen(false);
      fetchPosts();
    } catch (err: any) {
      addToast('Erro ao salvar post', 'error');
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Deseja excluir este post do calendário?')) return;
    try {
      await instagramApi.deletePost(id);
      addToast('Post excluído!', 'success');
      fetchPosts();
    } catch (err: any) {
      addToast('Erro ao excluir post', 'error');
    }
  };

  // Calendar Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span>Calendário Editorial & Planejamento</span>
            <CalendarIcon className="w-5 h-5 text-cyan-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cronograma de publicações, roteiros de Reels, carrosséis e aprovação de conteúdo
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-slate-950 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'calendar' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsAIModalOpen(true)}
            className="flex items-center space-x-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-cyan-400 px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ideias com IA</span>
          </button>

          <button
            onClick={() => handleOpenCreate()}
            className="flex items-center space-x-1.5 bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-cyan-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Agendar Post</span>
          </button>
        </div>
      </div>

      {/* Main View: Calendar Grid or List */}
      {viewMode === 'calendar' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {/* Month Navigation */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="text-base font-bold text-slate-100">
              {monthNames[month]} {year}
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-800 rounded-lg transition-colors font-medium"
              >
                Hoje
              </button>
              <button
                onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 bg-slate-950/70 border-b border-slate-800 text-center py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <div>Dom</div>
            <div>Seg</div>
            <div>Ter</div>
            <div>Qua</div>
            <div>Qui</div>
            <div>Sex</div>
            <div>Sáb</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-800/80 bg-slate-900">
            {/* Blank cells for offset */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`blank-${i}`} className="min-h-[100px] bg-slate-950/30 p-2" />
            ))}

            {/* Actual day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayPosts = posts.filter(
                (p) => p.scheduledAt && p.scheduledAt.startsWith(dateStr)
              );

              return (
                <div
                  key={`day-${dayNum}`}
                  onClick={() => handleOpenCreate(`${dateStr}T18:00`)}
                  className="min-h-[100px] p-2 hover:bg-slate-800/30 transition-colors cursor-pointer flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 group-hover:text-cyan-400">
                      {dayNum}
                    </span>
                  </div>

                  <div className="space-y-1 mt-1 flex-1">
                    {dayPosts.map((p) => (
                      <div
                        key={p.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(p);
                        }}
                        className={`p-1 rounded text-[10px] font-medium border truncate ${postStatusColors[p.status]}`}
                      >
                        <span className="font-bold uppercase text-[9px] mr-1">{p.type}</span>
                        {p.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Post / Título</th>
                  <th className="py-3 px-4">Formato</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Data Agendada</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-normal">
                {posts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-100">{p.title}</td>
                    <td className="py-3 px-4 font-bold text-pink-400">{p.type}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${postStatusColors[p.status]}`}>
                        {postStatusLabels[p.status] || p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{formatDateBR(p.scheduledAt)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-slate-400 hover:text-cyan-400 rounded"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePost(p.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create/Edit Post */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <Instagram className="w-4 h-4 text-pink-500" />
                <span>{postToEdit ? 'Editar Publicação' : 'Agendar Nova Publicação'}</span>
              </h3>
              <button onClick={() => setIsPostModalOpen(false)} className="text-slate-400 hover:text-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePost} className="p-6 space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Título do Conteúdo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Reel - Robô Megatron invadindo pista de 15 anos"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Formato</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-cyan-500"
                  >
                    <option value="REEL">Reel (Vídeo Vertical)</option>
                    <option value="FEED_POST">Post Feed (Foto única)</option>
                    <option value="CAROUSEL">Carrossel de Fotos</option>
                    <option value="STORY">Stories / Enquete</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Status de Aprovação</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-cyan-500"
                  >
                    <option value="DRAFT">Rascunho</option>
                    <option value="PLANNED">Planejado</option>
                    <option value="APPROVED">Aprovado</option>
                    <option value="PUBLISHED">Publicado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Data & Hora da Publicação *</label>
                <input
                  type="datetime-local"
                  required
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Legenda / Copy do Post</label>
                <textarea
                  rows={4}
                  placeholder="Escreva a legenda ou use o Assistente de IA..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg shadow-lg shadow-cyan-600/20"
                >
                  Salvar no Calendário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Modal */}
      <AIAssistantModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />
    </div>
  );
};
