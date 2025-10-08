
import React from 'react';
import { LogoIcon, LogoutIcon } from './IconComponents';

interface HeaderProps {
  user: { name: string };
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-slate-900/50 backdrop-blur-xl shadow-lg sticky top-0 z-10 border-b border-slate-200/20">
      <div className="container mx-auto px-4 md:px-8 py-5 relative">
        <div className="flex flex-col items-center text-center">
            <LogoIcon className="h-9 w-9 text-blue-500 mb-1" />
            <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
              Bittencort compara
            </h1>
            <p className="text-sm text-slate-300 font-medium mt-1">Sua economia colaborativa</p>
        </div>
        <div className="absolute top-0 right-4 h-full flex items-center gap-4">
            <span className="text-sm font-medium text-slate-300 hidden sm:block">
                Olá, <span className="font-bold text-white">{user.name}</span>
            </span>
            <button
              onClick={onLogout}
              className="text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/60 p-2.5 rounded-full transition-colors"
              aria-label="Sair"
            >
                <LogoutIcon className="h-5 w-5" />
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
