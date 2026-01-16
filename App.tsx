import React, { useState, useEffect, useMemo } from 'react';
import { Property, UFMGAccess } from './types';
import PropertyForm from './components/PropertyForm';
import { 
  Plus, 
  Search, 
  MapPin, 
  ExternalLink, 
  Bus, 
  ShieldCheck, 
  Moon, 
  Sun, 
  Trophy, 
  Trash2, 
  Edit2, 
  TrendingUp, 
  Building2,
  DollarSign
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'ufmg-imoveis-data-v1';

const App: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Property; direction: 'asc' | 'desc' } | null>(null);

  // Load data on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        setProperties(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load data", e);
      }
    }
  }, []);

  // Save data on change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(properties));
  }, [properties]);

  const handleSaveProperty = (property: Property) => {
    setProperties(prev => {
      const exists = prev.find(p => p.id === property.id);
      if (exists) {
        return prev.map(p => p.id === property.id ? property : p);
      }
      return [...prev, property];
    });
    setEditingProperty(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este imóvel?')) {
      setProperties(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setIsFormOpen(true);
  };

  const handleSort = (key: keyof Property) => {
    let direction: 'asc' | 'desc' = 'desc'; // Default to high-to-low for ratings
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredProperties = useMemo(() => {
    let filtered = properties.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.ufmgAccess.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig) {
      filtered.sort((a, b) => {
        // @ts-ignore
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        // @ts-ignore
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [properties, searchTerm, sortConfig]);

  // Statistics
  const stats = useMemo(() => {
    if (properties.length === 0) return { avgRent: 0, topPick: null, count: 0 };
    const totalRent = properties.reduce((acc, curr) => acc + curr.rentTotal, 0);
    const topPick = [...properties].sort((a, b) => b.idealRating - a.idealRating)[0];
    return {
      avgRent: totalRent / properties.length,
      topPick,
      count: properties.length
    };
  }, [properties]);

  const getRatingColor = (val: number, max: number) => {
    const percentage = val / max;
    if (percentage >= 0.8) return 'text-green-600 bg-green-50 border-green-200';
    if (percentage >= 0.5) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getAccessColor = (access: UFMGAccess) => {
    switch(access) {
      case UFMGAccess.FACIL: return 'bg-green-100 text-green-800';
      case UFMGAccess.ACEITAVEL: return 'bg-blue-100 text-blue-800';
      case UFMGAccess.COMPLEXO: return 'bg-orange-100 text-orange-800';
      case UFMGAccess.RUIM: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="text-brand-600" size={28} />
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              Imóvel<span className="text-brand-600">Tracker</span> UFMG
            </h1>
          </div>
          <button 
            onClick={() => { setEditingProperty(null); setIsFormOpen(true); }}
            className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-all active:scale-95"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Novo Imóvel</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
              <Building2 size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Imóveis Listados</p>
              <p className="text-2xl font-bold">{stats.count}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-full">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Média de Aluguel</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.avgRent)}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-full">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Melhor "Ideal"</p>
              <p className="text-lg font-bold truncate max-w-[150px]">
                {stats.topPick ? stats.topPick.name : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text"
              placeholder="Buscar por nome, acesso..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        {/* Content Area */}
        {properties.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <Building2 className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Nenhum imóvel cadastrado</h3>
            <p className="mt-1 text-sm text-gray-500">Comece adicionando imóveis para comparar.</p>
            <button 
              onClick={() => setIsFormOpen(true)}
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Adicionar Primeiro Imóvel
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Imóvel</th>
                    <th scope="col" onClick={() => handleSort('rentTotal')} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">R$ Aluguel</th>
                    <th scope="col" onClick={() => handleSort('ufmgAccess')} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">UFMG</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Uber (Méd)</th>
                    <th scope="col" onClick={() => handleSort('idealRating')} className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">Ideal (1-10)</th>
                    <th scope="col" onClick={() => handleSort('currentMomentRating')} className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">Momento (1-10)</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedAndFilteredProperties.map((property) => {
                    const avgUber = (property.uberPriceDay + property.uberPriceNight) / 2;
                    
                    return (
                      <tr key={property.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white group-hover:bg-gray-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-bold text-gray-900">{property.name}</div>
                              <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <ShieldCheck size={12} className="text-gray-400"/>
                                <span title="Segurança do Bairro">Seg: {property.neighborhoodSecurity}/10</span>
                                <span className="mx-1">•</span>
                                <span title="Acesso ao Centro">Centro: {property.centerAccess}/6</span>
                              </div>
                              {property.link && (
                                <a href={property.link} target="_blank" rel="noreferrer" className="text-xs text-brand-600 hover:underline flex items-center gap-1 mt-1">
                                  Ver Anúncio <ExternalLink size={10} />
                                </a>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">{formatCurrency(property.rentTotal)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getAccessColor(property.ufmgAccess)}`}>
                            {property.ufmgAccess}
                          </span>
                          <div className="text-xs text-gray-500 mt-1 flex items-center gap-1" title={property.busQuantity}>
                            <Bus size={10} />
                            <span className="truncate max-w-[100px]">{property.busQuantity || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">{formatCurrency(avgUber)}</div>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                            <span className="flex items-center gap-0.5"><Sun size={10}/> {property.uberPriceDay}</span>
                            <span className="flex items-center gap-0.5"><Moon size={10}/> {property.uberPriceNight}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-sm font-bold border ${getRatingColor(property.idealRating, 10)}`}>
                            {property.idealRating}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-sm font-bold border ${getRatingColor(property.currentMomentRating, 10)}`}>
                            {property.currentMomentRating}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleEdit(property)} className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(property.id)} className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <PropertyForm 
        isOpen={isFormOpen} 
        onClose={() => { setIsFormOpen(false); setEditingProperty(null); }} 
        onSave={handleSaveProperty}
        initialData={editingProperty}
      />
    </div>
  );
};

export default App;