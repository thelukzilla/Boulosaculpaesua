import React, { useState, useEffect } from 'react';
import { Property, UFMGAccess, initialProperty } from '../types';
import { X, Sparkles, Loader2, Save } from 'lucide-react';
import { parsePropertyDescription } from '../services/geminiService';

interface PropertyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (property: Property) => void;
  initialData?: Property | null;
}

const PropertyForm: React.FC<PropertyFormProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Omit<Property, 'id'>>(initialProperty);
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiInput, setShowAiInput] = useState(false);

  useEffect(() => {
    if (initialData) {
      const { id, ...rest } = initialData;
      setFormData(rest);
    } else {
      setFormData(initialProperty);
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;

    if (type === 'number') {
      finalValue = parseFloat(value) || 0;
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleAiFill = async () => {
    if (!aiInput.trim()) return;
    setIsAiLoading(true);
    try {
      const parsedData = await parsePropertyDescription(aiInput);
      setFormData(prev => ({
        ...prev,
        ...parsedData
      }));
      setShowAiInput(false);
    } catch (error) {
      alert("Erro ao processar texto com IA. Verifique se a chave de API está configurada.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialData?.id || crypto.randomUUID(),
      ...formData
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">
            {initialData ? 'Editar Imóvel' : 'Novo Imóvel'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* AI Feature Section */}
          {!initialData && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 text-indigo-700 font-semibold">
                  <Sparkles size={18} />
                  <span>Preenchimento Mágico (IA)</span>
                </div>
                <button 
                  onClick={() => setShowAiInput(!showAiInput)}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800 underline"
                >
                  {showAiInput ? 'Cancelar' : 'Usar IA'}
                </button>
              </div>
              
              {showAiInput && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <textarea
                    className="w-full p-3 text-sm border border-indigo-200 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                    rows={3}
                    placeholder="Cole aqui a descrição do WhatsApp, site ou suas anotações bagunçadas..."
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                  />
                  <button
                    onClick={handleAiFill}
                    disabled={isAiLoading || !aiInput.trim()}
                    className="w-full py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center gap-2 transition-colors"
                  >
                    {isAiLoading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                    {isAiLoading ? 'Analisando...' : 'Preencher Formulário Automaticamente'}
                  </button>
                </div>
              )}
            </div>
          )}

          <form id="propertyForm" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Basic Info */}
            <div className="col-span-1 md:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Básico</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apelido / Nome</label>
                  <input
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ex: Apê da Savassi"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link do Anúncio</label>
                  <input
                    type="url"
                    name="link"
                    value={formData.link}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Qualidade de Vida</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Segurança do Bairro (1-10)
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  name="neighborhoodSecurity"
                  value={formData.neighborhoodSecurity}
                  onChange={handleChange}
                  className="w-full accent-brand-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-right text-xs text-gray-500 font-mono">{formData.neighborhoodSecurity}/10</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lazer (1-6)
                </label>
                <input
                  type="range"
                  min="1"
                  max="6"
                  name="leisure"
                  value={formData.leisure}
                  onChange={handleChange}
                  className="w-full accent-purple-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-right text-xs text-gray-500 font-mono">{formData.leisure}/6</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Acesso ao Centro (1-6)
                </label>
                <input
                  type="range"
                  min="1"
                  max="6"
                  name="centerAccess"
                  value={formData.centerAccess}
                  onChange={handleChange}
                  className="w-full accent-blue-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-right text-xs text-gray-500 font-mono">{formData.centerAccess}/6</div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Logística & UFMG</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Acesso UFMG Direito</label>
                <select
                  name="ufmgAccess"
                  value={formData.ufmgAccess}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                >
                  {Object.values(UFMGAccess).map((acc) => (
                    <option key={acc} value={acc}>{acc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ônibus (Qtd/Desc)</label>
                <input
                  name="busQuantity"
                  value={formData.busQuantity}
                  onChange={handleChange}
                  placeholder="Ex: 2 linhas diretas"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Financeiro</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Aluguel Total (R$)</label>
                  <input
                    type="number"
                    name="rentTotal"
                    value={formData.rentTotal}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Uber Dia (R$)</label>
                  <input
                    type="number"
                    name="uberPriceDay"
                    value={formData.uberPriceDay}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Uber Noite (R$)</label>
                  <input
                    type="number"
                    name="uberPriceNight"
                    value={formData.uberPriceNight}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Veredito Pessoal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    É o meu lugar ideal? (1-10)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    name="idealRating"
                    value={formData.idealRating}
                    onChange={handleChange}
                    className="w-full accent-yellow-500 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                   <div className="text-right text-lg font-bold text-yellow-600">{formData.idealRating}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Para o momento atual? (1-10)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    name="currentMomentRating"
                    value={formData.currentMomentRating}
                    onChange={handleChange}
                    className="w-full accent-green-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-right text-lg font-bold text-green-700">{formData.currentMomentRating}</div>
                </div>
              </div>
            </div>

          </form>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-md transition-colors">
            Cancelar
          </button>
          <button form="propertyForm" type="submit" className="px-6 py-2 bg-brand-600 text-white font-medium rounded-md hover:bg-brand-700 shadow-md flex items-center gap-2 transition-all">
            <Save size={18} />
            Salvar Imóvel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyForm;