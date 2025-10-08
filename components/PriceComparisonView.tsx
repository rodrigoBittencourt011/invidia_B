import React from 'react';
import { PriceComparisonResult } from '../types';
import { Loader } from './Loader';
import { MapPinIcon, PriceTagIcon, NewspaperIcon, StoreIcon, TrophyIcon } from './IconComponents';

interface PriceComparisonViewProps {
  result: PriceComparisonResult | null;
  isLoading: boolean;
  error: string | null;
  hasItems: boolean;
}

const PriceComparisonView: React.FC<PriceComparisonViewProps> = ({ result, isLoading, error, hasItems }) => {
  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <Loader />
            <p className="mt-4 text-gray-700 font-medium text-lg">Buscando as melhores ofertas...</p>
            <p className="text-sm text-gray-500">Isso pode levar alguns segundos.</p>
        </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-600 bg-red-100/50 p-4 rounded-lg border border-red-200/80">{error}</div>;
  }
  
  if (!result) {
    return (
        <div className="text-center text-gray-500 flex flex-col items-center justify-center h-full p-4">
            <div className="bg-gradient-to-br from-blue-100/70 to-indigo-100/70 p-5 rounded-full mb-5 shadow-inner">
              <PriceTagIcon className="h-12 w-12 text-blue-600"/>
            </div>
            <h3 className="font-bold text-lg text-gray-800">Pronto para economizar de verdade?</h3>
            <p className="mt-1 max-w-sm text-gray-600">
                {hasItems 
                    ? "Clique em 'Comparar Preços Agora' para ver a mágica acontecer e encontrar a melhor opção de compra."
                    : "Sua lista está vazia. Adicione alguns itens para começar a comparar os preços."}
            </p>
        </div>
    );
  }

  const { supermarkets } = result;
  if (supermarkets.length === 0) {
    return (
      <div className="text-center text-gray-500 p-4">
        <h3 className="font-bold text-lg text-gray-800">Nenhum resultado encontrado</h3>
        <p className="mt-1 max-w-sm mx-auto text-gray-600">
          Não foi possível encontrar comparações para os itens da sua lista no momento. Tente novamente mais tarde.
        </p>
      </div>
    );
  }

  const cheapestSupermarket = supermarkets.reduce((prev, current) => 
    (prev.totalCost < current.totalCost) ? prev : current
  );

  return (
    <div className="space-y-6">
       <div 
        className="bg-gradient-to-br from-blue-500 to-indigo-600 p-5 rounded-xl shadow-lg text-white animate-fade-in-slide-up"
        style={{ opacity: 0 }}
       >
          <div className="flex items-start gap-4">
              <div className="flex-shrink-0 pt-1">
                  <TrophyIcon className="h-8 w-8"/>
              </div>
              <div>
                  <h3 className="font-bold text-lg">Melhor Opção Encontrada!</h3>
                  <p className="text-indigo-100 mt-1">
                      A compra completa mais barata é no <span className="font-bold text-white">{cheapestSupermarket.name}</span>,
                      totalizando <span className="font-extrabold text-xl text-white">R$ {cheapestSupermarket.totalCost.toFixed(2).replace('.', ',')}</span>.
                  </p>
              </div>
          </div>
      </div>

      {supermarkets.map((market, index) => (
        <div 
          key={index} 
          className="border border-slate-200/80 rounded-xl p-4 bg-white/50 animate-fade-in-slide-up"
          style={{ animationDelay: `${100 + index * 100}ms`, opacity: 0 }}
        >
          <div className="flex justify-between items-start mb-4 pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
                <StoreIcon className="h-6 w-6 text-gray-500" />
                {market.name}
              </h3>
              <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1.5 pl-1">
                <MapPinIcon className="h-3.5 w-3.5" />
                {market.address}
              </p>
            </div>

            <p className="text-xl font-bold text-slate-100 flex-shrink-0 ml-2">
                <span className={`px-3 py-1.5 rounded-full text-base font-semibold ${market.name === cheapestSupermarket.name ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-800'}`}>
                    R$ {market.totalCost.toFixed(2).replace('.', ',')}
                </span>
            </p>
          </div>

          {market.flyerUrl && (
            <a
              href={market.flyerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-sm text-indigo-700 font-semibold bg-indigo-100 hover:bg-indigo-200/80 py-2.5 px-3 rounded-lg transition-all mb-4"
            >
              <NewspaperIcon className="h-5 w-5" />
              Ver Encarte de Ofertas
            </a>
          )}
          
          <ul className="space-y-2 text-sm">
            {market.items.map((item, itemIndex) => (
              <li key={itemIndex} className="flex justify-between items-center p-2.5 rounded-lg bg-slate-100">
                <span className="text-gray-600">{item.name}</span>
                <span className="font-semibold text-gray-900">R$ {item.price.toFixed(2).replace('.', ',')}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default PriceComparisonView;