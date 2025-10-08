
import React, { useState } from 'react';
import { LogoIcon, MailIcon, LockIcon, UserIcon, GoogleIcon } from './IconComponents';
import { Loader } from './Loader';

interface AuthPageProps {
  onLogin: (user: { name: string; email: string }) => void;
}

type AuthTab = 'login' | 'signup';

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (activeTab === 'signup') {
      if (!name || !email || !password || !confirmPassword) {
        setError('Por favor, preencha todos os campos.');
        return;
      }
      if (password !== confirmPassword) {
        setError('As senhas não coincidem.');
        return;
      }
    } else {
      if (!email || !password) {
        setError('Por favor, preencha o e-mail e a senha.');
        return;
      }
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const userName = activeTab === 'login' ? 'Usuário' : name;
      onLogin({ name: userName, email });
      setIsLoading(false);
    }, 1500);
  };

  const renderLoginForm = () => (
    <>
      <div className="relative mb-4">
        <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          className="w-full p-3 pl-12 bg-slate-100 border border-slate-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
          required
        />
      </div>
      <div className="relative mb-4">
        <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Sua senha"
          className="w-full p-3 pl-12 bg-slate-100 border border-slate-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
          required
        />
      </div>
      <div className="flex justify-between items-center mb-6 text-sm">
        <label className="flex items-center gap-2 text-gray-600">
          <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          Lembrar-me
        </label>
        <a href="#" className="font-medium text-blue-600 hover:text-blue-800">
          Esqueceu a senha?
        </a>
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3.5 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? <Loader /> : 'Entrar'}
      </button>
    </>
  );

  const renderSignupForm = () => (
    <>
      <div className="relative mb-4">
        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Seu nome completo"
          className="w-full p-3 pl-12 bg-slate-100 border border-slate-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
          required
        />
      </div>
      <div className="relative mb-4">
        <MailIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          className="w-full p-3 pl-12 bg-slate-100 border border-slate-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
          required
        />
      </div>
      <div className="relative mb-4">
        <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Crie uma senha forte"
          className="w-full p-3 pl-12 bg-slate-100 border border-slate-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
          required
        />
      </div>
       <div className="relative mb-6">
        <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirme sua senha"
          className="w-full p-3 pl-12 bg-slate-100 border border-slate-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
          required
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3.5 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? <Loader /> : 'Criar Conta'}
      </button>
    </>
  );

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1608686207856-001b95cf60ca?q=80&w=2940&auto=format&fit=crop')" }}
    >
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-slate-200/50 animate-fade-in-slide-up">
        <div className="text-center mb-8">
            <LogoIcon className="h-10 w-10 text-blue-600 mx-auto mb-2" />
            <h1 className="text-3xl font-bold text-gray-900">Bem-vindo(a)!</h1>
            <p className="text-gray-600">Acesse sua conta para começar a economizar.</p>
        </div>

        <div className="mb-6 flex justify-center bg-slate-200/70 rounded-lg p-1">
            <button
                onClick={() => setActiveTab('login')}
                className={`w-1/2 py-2.5 text-sm font-bold rounded-md transition-all ${activeTab === 'login' ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}
            >
                Entrar
            </button>
            <button
                onClick={() => setActiveTab('signup')}
                className={`w-1/2 py-2.5 text-sm font-bold rounded-md transition-all ${activeTab === 'signup' ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}
            >
                Criar Conta
            </button>
        </div>

        {error && (
            <div className="bg-red-100 border border-red-300 text-red-800 text-sm font-medium p-3 rounded-lg mb-4 text-center">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit}>
            {activeTab === 'login' ? renderLoginForm() : renderSignupForm()}
        </form>

        <div className="flex items-center my-6">
            <div className="flex-grow border-t border-slate-300"></div>
            <span className="flex-shrink mx-4 text-slate-500 text-xs font-semibold">OU</span>
            <div className="flex-grow border-t border-slate-300"></div>
        </div>

        <button className="w-full flex items-center justify-center gap-3 p-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-100/50 transition-colors shadow-sm text-gray-700 font-semibold">
            <GoogleIcon className="h-6 w-6" />
            Continuar com Google
        </button>

      </div>
    </div>
  );
};

export default AuthPage;
