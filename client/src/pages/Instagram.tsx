import React, { useState, useEffect } from 'react';
import {
  Instagram as InstagramIcon,
  Image as ImageIcon,
  Video,
  Plus,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  FolderOpen,
} from 'lucide-react';
import { instagramApi } from '../services/api';
import { MediaItem } from '../types';
import { formatDateBR } from '../utils/formatters';
import { useToast } from '../context/ToastContext';
import { AIAssistantModal } from '../components/ai/AIAssistantModal';

const ATTRACTION_CATEGORIES = [
  'TODOS',
  'Robô Megatron LED',
  'Robô Bumblebee LED',
  'Tequileiros com LED',
  'Espelho Mágico Interativo',
  'Tambores de LED',
  'Personagens Vivos',
  'Efeitos Especiais (CO2/Laser)',
];

export const Instagram: React.FC = () => {
  const { addToast } = useToast();

  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('TODOS');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Media Form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Robô Megatron LED');
  const [type, setType] = useState<'IMAGE' | 'VIDEO' | 'REEL' | 'STORY'>('VIDEO');
  const [fileUrl, setFileUrl] = useState('');
  const [tags, setTags] = useState('');

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await instagramApi.getMedia();
      setMediaList(res.data);
    } catch (err: any) {
      addToast('Erro ao carregar galeria de mídia', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleSaveMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !fileUrl.trim()) return;

    try {
      await instagramApi.createMedia({
        title,
        category,
        type,
        fileUrl,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      addToast('Mídia adicionada ao acervo com sucesso!', 'success');
      setIsUploadModalOpen(false);
      setTitle('');
      setFileUrl('');
      setTags('');
      fetchMedia();
    } catch (err: any) {
      addToast('Erro ao cadastrar mídia', 'error');
    }
  };

  const handleDeleteMedia = async (id: string) => {
    if (!confirm('Deseja excluir esta mídia do acervo?')) return;
    try {
      await instagramApi.deleteMedia(id);
      addToast('Mídia removida com sucesso!', 'success');
      fetchMedia();
    } catch (err: any) {
      addToast('Erro ao remover mídia', 'error');
    }
  };

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    addToast('Link da mídia copiado!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredMedia = selectedCategory === 'TODOS'
    ? mediaList
    : mediaList.filter((m) => m.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span>Instagram & Acervo de Conteúdo</span>
            <InstagramIcon className="w-5 h-5 text-pink-500" />
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Biblioteca organizada de fotos, vídeos em alta resolução e Reels das atrações
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAIModalOpen(true)}
            className="flex items-center space-x-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-cyan-400 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Gerar Legenda com IA</span>
          </button>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center space-x-1.5 bg-pink-600 hover:bg-pink-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-pink-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Mídia</span>
          </button>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-medium">
        {ATTRACTION_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap border transition-all ${
              selectedCategory === cat
                ? 'bg-pink-600 text-white border-pink-500 shadow-md shadow-pink-600/20 font-semibold'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
          <FolderOpen className="w-10 h-10 text-pink-500 mx-auto opacity-70" />
          <p className="font-semibold text-slate-200 text-sm">Nenhuma mídia cadastrada nesta categoria.</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Cadastre fotos e vídeos das festas e shows para facilitar a criação de posts e campanhas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredMedia.map((media) => (
            <div
              key={media.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col group hover:border-pink-500/40 transition-all"
            >
              {/* Media Preview Box */}
              <div className="h-44 bg-slate-950 relative flex items-center justify-center overflow-hidden">
                {media.fileUrl.match(/\.(jpg|jpeg|png|webp|gif)/i) ? (
                  <img
                    src={media.fileUrl}
                    alt={media.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex flex-col items-center text-slate-500 space-y-1">
                    {media.type === 'VIDEO' || media.type === 'REEL' ? (
                      <Video className="w-10 h-10 text-pink-400" />
                    ) : (
                      <ImageIcon className="w-10 h-10 text-cyan-400" />
                    )}
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                      {media.type}
                    </span>
                  </div>
                )}

                <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-pink-400 border border-pink-500/30 px-2 py-0.5 rounded-full">
                  {media.category}
                </div>
              </div>

              {/* Media Info */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-100 group-hover:text-pink-400 transition-colors line-clamp-1">
                    {media.title}
                  </h3>
                  {media.tags && media.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {media.tags.map((t, idx) => (
                        <span key={idx} className="text-[10px] text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="text-[11px]">{formatDateBR(media.createdAt)}</span>
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleCopyUrl(media.id, media.fileUrl)}
                      title="Copiar link"
                      className="p-1.5 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors"
                    >
                      {copiedId === media.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <a
                      href={media.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      title="Abrir arquivo"
                      className="p-1.5 hover:text-pink-400 hover:bg-slate-800 rounded transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => handleDeleteMedia(media.id)}
                      title="Excluir"
                      className="p-1.5 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add Media */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-1.5">
                <ImageIcon className="w-4 h-4 text-pink-500" />
                <span>Cadastrar Mídia no Acervo</span>
              </h3>
            </div>

            <form onSubmit={handleSaveMedia} className="p-6 space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Título / Descrição da Mídia *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Entrada Megatron Casamento Gabriela & Lucas"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Atração / Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-pink-500"
                  >
                    <option value="Robô Megatron LED">Robô Megatron LED</option>
                    <option value="Robô Bumblebee LED">Robô Bumblebee LED</option>
                    <option value="Tequileiros com LED">Tequileiros com LED</option>
                    <option value="Espelho Mágico Interativo">Espelho Mágico Interativo</option>
                    <option value="Tambores de LED">Tambores de LED</option>
                    <option value="Personagens Vivos">Personagens Vivos</option>
                    <option value="Efeitos Especiais (CO2/Laser)">Efeitos Especiais</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Tipo de Mídia</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-pink-500"
                  >
                    <option value="VIDEO">Vídeo / Show</option>
                    <option value="REEL">Reel / Vertical</option>
                    <option value="IMAGE">Foto / Imagem</option>
                    <option value="STORY">Story</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Link / URL do Arquivo (CDN ou Drive) *</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Tags (separadas por vírgula)</label>
                <input
                  type="text"
                  placeholder="casamento, megatron, pista_lotada, balada"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-pink-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white font-semibold rounded-lg shadow-lg shadow-pink-600/20"
                >
                  Salvar Mídia
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
