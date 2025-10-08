
import React, { useState, useEffect, useRef } from 'react';
import { PlusIcon, ImageIcon } from './IconComponents';
import { generateProductImage, fetchProductSuggestions } from '../services/geminiService';
import { Loader } from './Loader';
import { ProductSuggestion } from '../types';

interface AddItemFormProps {
  onAddItem: (item: { name: string; quantity: number; imageUrl: string | null }) => void;
}

const AddItemForm: React.FC<AddItemFormProps> = ({ onAddItem }) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimeout = useRef<number | null>(null);

  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (name.trim().length > 2) {
      debounceTimeout.current = window.setTimeout(async () => {
        setIsLoading(true);
        setSuggestions([]);
        const productNames = await fetchProductSuggestions(name.trim());
        
        if (productNames.length > 0) {
          const suggestionsWithImages = await Promise.all(
            productNames.map(async (productName) => {
              const imageUrl = await generateProductImage(productName);
              return { name: productName, imageUrl };
            })
          );
          setSuggestions(suggestionsWithImages);
        }
        setIsLoading(false);
      }, 750);
    } else {
      setSuggestions([]);
      setIsLoading(false);
    }

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [name]);


  const handleSuggestionClick = (suggestion: ProductSuggestion) => {
    onAddItem({ name: suggestion.name, quantity, imageUrl: suggestion.imageUrl });
    setName('');
    setQuantity(1);
    setSuggestions([]);
  };

  return (
    <div className="mb-6">
      <div className="flex gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Digite o nome de um produto..."
          className="flex-grow p-3 bg-slate-100 border border-slate-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
          aria-label="Nome do item"
        />
        <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
            min="1"
            step="1"
            className="w-24 p-3 bg-slate-100 border border-slate-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
            aria-label="Quantidade"
        />
      </div>

       {isLoading && (
            <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center min-h-[120px]">
              <div className="text-center">
                <Loader />
                <p className="text-sm text-gray-500 mt-2">Buscando produtos...</p>
              </div>
            </div>
        )}

        {suggestions.length > 0 && !isLoading && (
            <div className="mt-4 animate-fade-in-slide-up" style={{ animationDuration: '0.4s' }}>
                <p className="text-sm font-semibold text-gray-600 mb-2">Selecione um produto:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {suggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="bg-white p-2.5 rounded-xl border border-slate-200/80 hover:border-blue-500 hover:shadow-lg transition-all text-left flex flex-col items-center group"
                        >
                            <div className="w-full h-24 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden mb-2 transition-transform group-hover:scale-105">
                                {suggestion.imageUrl ? (
                                    <img src={suggestion.imageUrl} alt={suggestion.name} className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon className="h-8 w-8 text-gray-400" />
                                )}
                            </div>
                            <p className="text-xs font-bold text-gray-800 text-center leading-tight">
                                {suggestion.name}
                            </p>
                        </button>
                    ))}
                </div>
            </div>
        )}

    </div>
  );
};

export default AddItemForm;
