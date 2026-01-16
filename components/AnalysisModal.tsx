import React from 'react';
import { X, Sparkles, Bot } from 'lucide-react';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: string;
  isLoading: boolean;
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose, analysis, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-xl text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
              <Bot size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Consultor IA</h2>
              <p className="text-xs text-indigo-100 opacity-90">Análise baseada nos seus dados</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors text-white">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles size={16} className="text-indigo-600 animate-pulse" />
                </div>
              </div>
              <div>
                <h3 className="text-gray-900 font-medium">Analisando seus imóveis...</h3>
                <p className="text-gray-500 text-sm mt-1">Comparando preços, segurança e acesso à UFMG.</p>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm prose-indigo max-w-none text-gray-700">
              <div className="whitespace-pre-wrap leading-relaxed">
                {analysis.split('\n').map((line, i) => {
                  // Simples renderização de markdown-like headers
                  if (line.startsWith('###') || line.startsWith('**Top') || line.startsWith('**Melhor') || line.startsWith('**Alerta') || line.startsWith('**Veredito')) {
                     return <h3 key={i} className="text-indigo-800 font-bold mt-4 mb-2 text-base">{line.replace(/#/g, '').replace(/\*\*/g, '')}</h3>;
                  }
                  if (line.startsWith('- ')) {
                    return <li key={i} className="ml-4 list-disc">{line.replace('- ', '')}</li>
                  }
                  return <p key={i} className="mb-2">{line.replace(/\*\*/g, '')}</p>
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end">
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
          >
            Fechar Análise
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisModal;