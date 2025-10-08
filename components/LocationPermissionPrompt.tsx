import React from 'react';
import { MapPinIcon } from './IconComponents';

interface LocationPermissionPromptProps {
  error: string | null;
  onRetry: () => void;
}

const LocationPermissionPrompt: React.FC<LocationPermissionPromptProps> = ({ error, onRetry }) => {
  return (
    <div className="bg-slate-100 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/60 backdrop-blur-sm border border-gray-200/80 rounded-2xl p-8 max-w-lg text-center shadow-2xl animate-fade-in">
        <div className="mx-auto bg-blue-100 p-4 rounded-full w-fit mb-6">
          <MapPinIcon className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Ative a localização para continuar</h2>
        <p className="mt-2 text-gray-600">
          Precisamos da sua localização para encontrar os melhores preços nos supermercados mais próximos de você. Sua privacidade é importante para nós e sua localização só será usada para esta finalidade.
        </p>
        
        {error && (
            <div className="mt-4 text-left text-red-700 bg-red-100/50 p-3 rounded-lg border border-red-200 text-sm">
                <strong>Acesso Negado:</strong> {error}
            </div>
        )}

        <button
          onClick={onRetry}
          className="mt-6 w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
        >
          Tentar Novamente
        </button>
      </div>
    </div>
  );
};

export default LocationPermissionPrompt;