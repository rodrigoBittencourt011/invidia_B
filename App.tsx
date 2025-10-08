
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ShoppingListItem, PriceComparisonResult, PurchaseRecord } from './types';
import Header from './components/Header';
import AddItemForm from './components/AddItemForm';
import ShoppingList from './components/ShoppingList';
import PriceComparisonView from './components/PriceComparisonView';
import HistoryView from './components/HistoryView';
import { fetchPriceComparison } from './services/geminiService';
import { AnalyticsIcon, ListIcon, SparklesIcon, MapPinIcon, HistoryIcon, CheckIcon } from './components/IconComponents';
import { STATES_CITIES } from './data/brazil-states-cities';

type ActiveTab = 'list' | 'history';
type SelectionMethod = 'manual' | 'location';

interface AppProps {
  user: { name: string };
  onLogout: () => void;
}

const App: React.FC<AppProps> = ({ user, onLogout }) => {
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([
    { id: 1, name: 'Leite Integral 1L', quantity: 2, completed: false, imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b450?q=80&w=800&auto=format&fit=crop' },
    { id: 2, name: 'Pão de Forma', quantity: 1, completed: false, imageUrl: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?q=80&w=800&auto=format&fit=crop' },
    { id: 3, name: 'Maçãs (kg)', quantity: 1, completed: true, imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b69665?q=80&w=800&auto=format&fit=crop' },
    { id: 4, name: 'Peito de Frango (kg)', quantity: 0.5, completed: false, imageUrl: 'https://images.unsplash.com/photo-1604503468828-1c4486aa2c13?q=80&w=800&auto=format&fit=crop' },
  ]);
  const [priceResult, setPriceResult] = useState<PriceComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [citySearch, setCitySearch] = useState('');
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [isCityListVisible, setIsCityListVisible] = useState(false);
  const cityInputRef = useRef<HTMLDivElement>(null);

  const [selectionMethod, setSelectionMethod] = useState<SelectionMethod>('manual');

  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseRecord[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('list');
  
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cityInputRef.current && !cityInputRef.current.contains(event.target as Node)) {
        setIsCityListVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddItem = (item: { name: string; quantity: number; imageUrl: string | null }) => {
    setShoppingList(prevList => [
      ...prevList,
      { ...item, id: Date.now(), completed: false },
    ]);
  };

  const handleRemoveItem = (id: number) => {
    setShoppingList(prevList => prevList.filter(item => item.id !== id));
  };

  const handleToggleItem = (id: number) => {
    setShoppingList(prevList =>
      prevList.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleRequestLocation = () => {
    setIsLocating(true);
    setLocation(null);
    setLocationError(null);
    setSelectionMethod('location');
    setSelectedState('');
    setSelectedCity('');
    setCitySearch('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setIsLocating(false);
      },
      (error) => {
        let message = "Ocorreu um erro ao obter a localização.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Permissão de localização negada. Habilite no seu navegador.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Informações de localização não estão disponíveis.";
            break;
          case error.TIMEOUT:
            message = "A requisição de localização demorou muito.";
            break;
        }
        setLocationError(message);
        setIsLocating(false);
        setSelectionMethod('manual'); // Revert on error
      }
    );
  };
  
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const state = e.target.value;
    setSelectedState(state);
    setSelectedCity('');
    setCitySearch('');
    setFilteredCities([]);
    setSelectionMethod('manual');
    setLocation(null);
    setLocationError(null);
  };

  const handleCitySearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setCitySearch(query);
    setSelectedCity('');

    if (query && selectedState && STATES_CITIES[selectedState]) {
      const cities = STATES_CITIES[selectedState].filter(city =>
        city.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCities(cities);
    } else {
      setFilteredCities([]);
    }
    setIsCityListVisible(true);
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setCitySearch(city);
    setIsCityListVisible(false);
  };

  const handleComparePrices = useCallback(async () => {
    const activeItems = shoppingList.filter(i => !i.completed);
    if (activeItems.length === 0) {
      setError("Adicione itens à lista ou desmarque alguns antes de comparar preços.");
      return;
    }
    
    const isManualSelectionValid = selectionMethod === 'manual' && selectedCity && selectedState;
    const isLocationSelectionValid = selectionMethod === 'location' && location;

    if (!isManualSelectionValid && !isLocationSelectionValid) {
        setError("Por favor, selecione um estado e cidade, ou use sua localização.");
        return;
    }

    setError(null);
    setPriceResult(null);
    setIsLoading(true);

    try {
      const locationParam = isLocationSelectionValid ? location : `${selectedCity}, ${selectedState}`;
      const result = await fetchPriceComparison(activeItems, locationParam);
      setPriceResult(result);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [shoppingList, selectedState, selectedCity, location, selectionMethod]);
  
  const handleReuseItem = (item: { name: string; quantity: number }) => {
    handleAddItem({ ...item, imageUrl: null });
    setActiveTab('list');
  };

  const handleCompletePurchase = () => {
    const itemsToArchive = shoppingList;
    if (itemsToArchive.length === 0) {
      setError("Sua lista de compras está vazia.");
      return;
    }

    const newRecord: PurchaseRecord = {
      date: new Date().toISOString(),
      items: itemsToArchive.map(({ id, name, quantity }) => ({ id, name, quantity })),
    };

    setPurchaseHistory(prevHistory => [newRecord, ...prevHistory]);
    setShoppingList([]);
    setPriceResult(null);
    setError(null);
  };

  const getButtonText = () => {
    if (isLoading) return 'Analisando Preços...';
    return 'Comparar Preços Agora';
  }
  
  const isCompareDisabled = () => {
      if (isLoading) return true;
      if (selectionMethod === 'manual') {
          return !selectedState || !selectedCity;
      }
      if (selectionMethod === 'location') {
          return isLocating || !location;
      }
      return true;
  }

  return (
    <div 
      className="min-h-screen text-gray-800 bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1608686207856-001b95cf60ca?q=80&w=2940&auto=format&fit=crop')" }}
    >
      <Header user={user} onLogout={onLogout} />
      <main className="container mx-auto p-4 md:p-8 pt-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-12">
          {/* Coluna da Lista de Compras */}
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200/50 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-2 rounded-full">
                  <ListIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Minha Lista</h2>
            </div>
            
             <div className="flex gap-2 mb-4 border-b border-slate-200">
                <button 
                    onClick={() => setActiveTab('list')}
                    className={`flex items-center gap-2 font-semibold px-4 py-2 rounded-t-lg transition-colors ${activeTab === 'list' ? 'bg-white border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:bg-slate-100'}`}
                >
                    <ListIcon className="h-5 w-5" />
                    Lista Atual
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex items-center gap-2 font-semibold px-4 py-2 rounded-t-lg transition-colors ${activeTab === 'history' ? 'bg-white border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:bg-slate-100'}`}
                >
                    <HistoryIcon className="h-5 w-5" />
                    Histórico
                </button>
            </div>

            {activeTab === 'list' && (
                <>
                    <AddItemForm onAddItem={handleAddItem} />
                    <ShoppingList
                      items={shoppingList}
                      onRemove={handleRemoveItem}
                      onToggle={handleToggleItem}
                    />
                </>
            )}

            {activeTab === 'history' && (
                <HistoryView history={purchaseHistory} onReuseItem={handleReuseItem} />
            )}
            
            {shoppingList.length > 0 && activeTab === 'list' && (
              <div className="mt-auto pt-6 text-center space-y-3">
                 <div className="mb-4 text-left">
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Selecione o local da compra
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                     <select
                      value={selectedState}
                      onChange={handleStateChange}
                      className="w-full appearance-none p-3 bg-slate-100/80 border border-slate-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                     >
                        <option value="" disabled>Estado</option>
                        {Object.keys(STATES_CITIES).sort().map(state => <option key={state} value={state}>{state}</option>)}
                     </select>
                     <div className="relative" ref={cityInputRef}>
                        <input
                            type="text"
                            value={citySearch}
                            onChange={handleCitySearchChange}
                            onFocus={() => setIsCityListVisible(true)}
                            placeholder="Cidade"
                            disabled={!selectedState}
                            className="w-full p-3 bg-slate-100/80 border border-slate-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all shadow-sm disabled:bg-slate-200/50 disabled:cursor-not-allowed"
                        />
                        {isCityListVisible && selectedState && (
                            <ul className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {filteredCities.length > 0 ? (
                                    filteredCities.map(city => (
                                        <li
                                            key={city}
                                            onClick={() => handleCitySelect(city)}
                                            className="px-4 py-2 hover:bg-blue-100 cursor-pointer text-gray-800"
                                        >
                                            {city}
                                        </li>
                                    ))
                                ) : (
                                    <li className="px-4 py-2 text-gray-500">
                                        {citySearch ? "Nenhuma cidade encontrada" : "Digite para buscar..."}
                                    </li>
                                )}
                            </ul>
                        )}
                     </div>
                  </div>
                </div>

                <div className="flex items-center my-4">
                  <div className="flex-grow border-t border-slate-300"></div>
                  <span className="flex-shrink mx-4 text-slate-500 text-xs font-semibold">OU</span>
                  <div className="flex-grow border-t border-slate-300"></div>
                </div>

                <div>
                    <button
                        onClick={handleRequestLocation}
                        className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors shadow-sm ${selectionMethod === 'location' ? 'bg-blue-100 border-blue-300 text-blue-800' : 'bg-slate-100/80 border-slate-300 hover:bg-slate-200/60'}`}
                    >
                        <MapPinIcon className="h-5 w-5" />
                        <span className="font-semibold">Usar localização atual</span>
                    </button>
                    <div className="text-left text-sm h-5 mt-1 px-1">
                        {isLocating && <p className="text-gray-600 animate-pulse">Obtendo localização...</p>}
                        {locationError && <p className="text-red-600 font-medium">{locationError}</p>}
                        {location && selectionMethod === 'location' && <p className="text-green-700 font-medium">✓ Localização obtida com sucesso!</p>}
                    </div>
                </div>

                <button
                  onClick={handleComparePrices}
                  disabled={isCompareDisabled()}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3.5 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-md flex items-center justify-center gap-3"
                >
                  <SparklesIcon className="h-5 w-5"/>
                  {getButtonText()}
                </button>
                 <button
                    onClick={handleCompletePurchase}
                    disabled={shoppingList.length === 0}
                    className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold py-3.5 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-md flex items-center justify-center gap-3"
                >
                    <CheckIcon className="h-5 w-5" />
                    Finalizar Compra
                </button>
              </div>
            )}
          </div>

          {/* Coluna da Comparação de Preços */}
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg mt-8 lg:mt-0 border border-slate-200/50">
             <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-100 p-2 rounded-full">
                  <AnalyticsIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Análise de Preços</h2>
            </div>
            <PriceComparisonView
              result={priceResult}
              isLoading={isLoading}
              error={error}
              hasItems={shoppingList.filter(i => !i.completed).length > 0}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
