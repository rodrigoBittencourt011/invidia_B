
import React from 'react';
import { ShoppingListItem } from '../types';
import { ImageIcon, TrashIcon, CheckIcon } from './IconComponents';

interface ShoppingListProps {
  items: ShoppingListItem[];
  onRemove: (id: number) => void;
  onToggle: (id: number) => void;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ items, onRemove, onToggle }) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <ImageIcon className="h-20 w-20 mx-auto text-gray-400" />
        <p className="mt-4 text-gray-600 font-medium">Sua lista está vazia.</p>
        <p className="text-gray-500">Adicione um item para começar!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`relative group bg-white rounded-xl shadow-sm border transition-all duration-300 animate-fade-in-slide-up ${
            item.completed 
              ? 'border-green-300' 
              : 'border-slate-200 hover:shadow-md hover:border-blue-300'
          }`}
          style={{ animationDelay: `${index * 50}ms`, opacity: 0 }}
        >
          {/* Completed Overlay */}
          {item.completed && (
            <div className="absolute inset-0 bg-green-500/20 rounded-xl z-10 flex items-center justify-center">
              <div className="bg-white/80 p-3 rounded-full shadow-lg">
                <CheckIcon className="h-8 w-8 text-green-600" />
              </div>
            </div>
          )}
          
          <button
            onClick={() => onRemove(item.id)}
            className="absolute top-2 right-2 z-20 text-gray-400 bg-white/50 backdrop-blur-sm hover:text-red-500 p-1.5 rounded-full hover:bg-red-100 transition-colors opacity-0 group-hover:opacity-100"
            aria-label={`Remover ${item.name}`}
          >
            <TrashIcon className="h-5 w-5" />
          </button>
          
          <div 
            className={`p-3 cursor-pointer flex flex-col h-full transition-opacity ${item.completed ? 'opacity-40' : ''}`}
            onClick={() => onToggle(item.id)}
          >
            <div className="w-full h-28 bg-slate-100 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="h-10 w-10 text-gray-400" />
              )}
            </div>
            <div className="flex-grow">
              <p className="font-bold text-gray-800 text-sm leading-tight">
                {item.name}
              </p>
            </div>
            <p className="mt-2 text-xs text-gray-500 font-medium bg-slate-100 px-2 py-1 rounded-full w-fit">
              Qtd: {item.quantity}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShoppingList;
