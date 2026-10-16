import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertTriangle, Download } from 'lucide-react';
import { leadsApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/formatters';

interface LeadImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

export const LeadImportModal: React.FC<LeadImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const { addToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    totalProcessed: number;
    importedCount: number;
    duplicateCount: number;
    errors: { row: number; error: string }[];
  } | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await leadsApi.importCsv(formData);
      setResult(res.data);
      addToast(`Importação finalizada! ${res.data.importedCount} leads importados.`, 'success');
      onImportSuccess();
    } catch (err: any) {
      addToast(getErrorMessage(err, 'Erro ao importar CSV'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSample = () => {
    const csvContent = 'name,phone,email,eventType,eventDate,eventCity,attractionInterest,estimatedValue,sourceChannel\n' +
      'Mariana Silva,11987654321,mariana@email.com,WEDDING,2026-11-20,São Paulo,Robô Megatron LED,2800,META_ADS\n' +
      'Carlos Eduardo,11976543210,carlos@email.com,DEBUTANTE_15,2026-12-15,Campinas,Robô Bumblebee LED,2500,WHATSAPP_DIRECT\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'modelo_importacao_leads.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Upload className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100">Importação de Leads em Massa (CSV)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-300">
            <div>
              <p className="font-semibold text-slate-200">Precisa do modelo de arquivo?</p>
              <p className="text-slate-400 mt-0.5">Baixe a planilha modelo pré-formatada para preenchimento.</p>
            </div>
            <button
              onClick={handleDownloadSample}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-medium px-3 py-1.5 rounded-lg border border-slate-700 transition-colors shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar Modelo</span>
            </button>
          </div>

          {/* File Upload Box */}
          <div className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-xl p-6 text-center transition-colors bg-slate-950/40">
            <input
              type="file"
              id="csv-file-input"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="csv-file-input" className="cursor-pointer space-y-2 block">
              <FileText className="w-8 h-8 text-cyan-400 mx-auto" />
              <div className="text-xs text-slate-300">
                {file ? (
                  <span className="font-semibold text-cyan-400">{file.name}</span>
                ) : (
                  <span>Clique para selecionar ou arraste seu arquivo .CSV aqui</span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">Formato aceito: CSV com separador vírgula ou ponto-e-vírgula.</p>
            </label>
          </div>

          {/* Results Summary */}
          {result && (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 text-xs">
              <h3 className="font-bold text-slate-200 flex items-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-1.5" />
                Relatório de Processamento
              </h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase">Processados</div>
                  <div className="text-sm font-bold text-slate-100">{result.totalProcessed}</div>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-emerald-400 text-[10px] uppercase">Importados</div>
                  <div className="text-sm font-bold text-emerald-400">{result.importedCount}</div>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-amber-400 text-[10px] uppercase">Duplicados</div>
                  <div className="text-sm font-bold text-amber-400">{result.duplicateCount}</div>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="mt-3 p-3 bg-rose-950/40 border border-rose-900/60 rounded-lg max-h-32 overflow-y-auto space-y-1 text-[11px]">
                  <div className="font-semibold text-rose-400 flex items-center">
                    <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                    {result.errors.length} linha(s) com erros:
                  </div>
                  {result.errors.map((err, i) => (
                    <div key={i} className="text-rose-300">
                      Linha {err.row}: {err.error}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Fechar
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="px-5 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 rounded-lg shadow-lg shadow-cyan-600/20 transition-all flex items-center space-x-1.5"
          >
            {loading ? <span>Importando...</span> : <span>Iniciar Importação</span>}
          </button>
        </div>
      </div>
    </div>
  );
};
