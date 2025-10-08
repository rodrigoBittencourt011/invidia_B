import React from 'react';
import { PurchaseRecord } from '../types';
import { HistoryIcon, RefreshIcon, ImageIcon } from './IconComponents';

interface HistoryViewProps {
  history: PurchaseRecord[];
  onReuseItem: (item: { name: string; quantity: number }) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onReuseItem }) => {
  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <HistoryIcon className="h-20 w-20 mx-auto text-gray-400" />
        <p className="mt-4 text-gray-600 font-medium">Seu histórico de compras está vazio.</p>
        <p className="text-gray-500">Após finalizar uma compra, ela aparecerá aqui.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
      {history.map((record, index) => (
        <div 
          key={record.date} 
          className="bg-white/70 p-4 rounded-xl border border-slate-200/80 animate-fade-in-slide-up"
          style={{ animationDelay: `${index * 70}ms`, opacity: 0 }}
        >
          <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">
            Compra de {new Date(record.date).toLocaleDateString('pt-BR')}
          </h3>
          <ul className="space-y-2">
            {record.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-100">
                <div className="flex items-center gap-3">
                   <div className="flex-shrink-0 bg-slate-200 rounded-lg h-8 w-8 flex items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-gray-500" />
                    </div>
                    <div>
                        <span className="font-medium text-gray-700">{item.name}</span>
                        <span className="block text-sm text-gray-500">Qtd: {item.quantity}</span>
                    </div>
                </div>
                <button
                  onClick={() => onReuseItem(item)}
                  className="flex items-center gap-1.5 text-sm text-blue-600 font-semibold hover:text-blue-800 bg-blue-100 hover:bg-blue-200/70 py-1.5 px-3 rounded-full transition-all"
                  aria-label={`Reutilizar ${item.name}`}
                >
                  <RefreshIcon className="h-4 w-4" />
                  Reutilizar
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default HistoryView;
