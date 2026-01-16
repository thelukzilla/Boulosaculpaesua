import React from 'react';
import { Property } from '../types';

interface ScatterChartProps {
  properties: Property[];
}

const ScatterChart: React.FC<ScatterChartProps> = ({ properties }) => {
  if (properties.length < 2) return null;

  // Encontrar limites para escalar o gráfico
  const rents = properties.map(p => p.rentTotal);
  const minRent = Math.min(...rents) * 0.9;
  const maxRent = Math.max(...rents) * 1.1;

  // Nota média combinada (Ideal + Momento + Segurança)
  const getScore = (p: Property) => (p.idealRating + p.currentMomentRating + p.neighborhoodSecurity) / 3;
  
  const scores = properties.map(getScore);
  const minScore = Math.min(1, ...scores);
  const maxScore = 10;

  // Normalizar posições (0 a 100%)
  const getX = (rent: number) => ((rent - minRent) / (maxRent - minRent)) * 100;
  const getY = (score: number) => ((score - minScore) / (maxScore - minScore)) * 100;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
      <h3 className="text-lg font-bold text-gray-800 mb-2">Mapa de Oportunidades</h3>
      <p className="text-sm text-gray-500 mb-6">
        Quanto mais <strong>alto</strong> (Melhor Nota) e mais à <strong>esquerda</strong> (Menor Preço), melhor o imóvel.
      </p>

      <div className="relative w-full h-64 border-l border-b border-gray-300 bg-gray-50/50">
        
        {/* Eixo Y Label */}
        <div className="absolute -left-8 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-semibold text-gray-400 whitespace-nowrap">
          Qualidade (Notas + Seg)
        </div>
        
        {/* Eixo X Label */}
        <div className="absolute left-1/2 bottom-[-25px] -translate-x-1/2 text-xs font-semibold text-gray-400">
          Preço do Aluguel (R$)
        </div>

        {/* Grid Lines Opcionais */}
        <div className="absolute top-1/2 w-full h-px bg-gray-200 border-t border-dashed border-gray-300"></div>
        <div className="absolute left-1/2 h-full w-px bg-gray-200 border-l border-dashed border-gray-300"></div>

        {/* Pontos */}
        {properties.map((p) => {
          const x = getX(p.rentTotal);
          const y = getY(getScore(p));
          
          return (
            <div
              key={p.id}
              className="absolute transform -translate-x-1/2 translate-y-1/2 group transition-all duration-300 hover:z-50 hover:scale-110 cursor-pointer"
              style={{
                left: `${x}%`,
                bottom: `${y}%`,
              }}
            >
              <div className={`w-4 h-4 rounded-full border-2 border-white shadow-md ${
                p.idealRating >= 8 ? 'bg-green-500' : p.idealRating >= 5 ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              
              {/* Tooltip Personalizado */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-50">
                <div className="font-bold">{p.name}</div>
                <div>R$ {p.rentTotal} • Nota {p.idealRating}</div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="flex justify-between text-xs text-gray-400 mt-2 font-mono">
        <span>R$ {Math.round(minRent)}</span>
        <span>R$ {Math.round(maxRent)}</span>
      </div>
    </div>
  );
};

export default ScatterChart;