import React, { useState } from 'react';
import { 
  Send, 
  Search, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'home' | 'submit' | 'check' | 'admin';
  setActiveTab: (tab: 'home' | 'submit' | 'check' | 'admin') => void;
  isAdminLoggedIn: boolean;
  onAdminLogout: () => void;
  onOpenAdminLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isAdminLoggedIn,
  onAdminLogout,
  onOpenAdminLogin
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (tab: 'home' | 'submit' | 'check' | 'admin') => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200">
      {/* Main Header Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Institution Name */}
          <button 
            onClick={() => handleNav('home')} 
            className="text-left focus:outline-none cursor-pointer"
          >
            <div className="text-[11px] sm:text-xs font-bold text-emerald-700 tracking-wider uppercase">
              Toshkent kimyo-texnologiya instituti
            </div>
            <h1 className="text-lg sm:text-2xl font-extrabold text-[#0f3b75] leading-tight">
              Yangiyer filiali
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs font-semibold text-slate-500">
                Murojaatlar portali
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                Rasmiy
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => handleNav('home')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-blue-50 text-[#0f3b75]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Bosh sahifa
            </button>

            <button
              onClick={() => handleNav('submit')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'submit'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Murojaat yuborish</span>
            </button>

            <button
              onClick={() => handleNav('check')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'check'
                  ? 'bg-[#0f3b75] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Holatni tekshirish</span>
            </button>

            <div className="h-6 w-px bg-slate-200 mx-1"></div>

            {/* Admin Button */}
            {isAdminLoggedIn ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleNav('admin')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'admin'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Panel</span>
                </button>
                <button
                  onClick={onAdminLogout}
                  title="Chiqish"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-[#0f3b75] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin kirish</span>
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => handleNav('submit')}
              className="bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Yuborish</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-[#0f3b75] hover:bg-slate-100 rounded-lg cursor-pointer"
              aria-label="Menyu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-slate-200 space-y-1.5 pb-2">
            <button
              onClick={() => handleNav('home')}
              className="w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 flex items-center justify-between"
            >
              <span>Bosh sahifa</span>
            </button>
            <button
              onClick={() => handleNav('submit')}
              className="w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold bg-emerald-50 text-emerald-800 flex items-center gap-2"
            >
              <Send className="w-4 h-4 text-emerald-600" />
              <span>Murojaat yuborish</span>
            </button>
            <button
              onClick={() => handleNav('check')}
              className="w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-blue-600" />
              <span>Murojaat holatini tekshirish</span>
            </button>

            <div className="pt-2 border-t border-slate-100">
              {isAdminLoggedIn ? (
                <div className="space-y-1">
                  <button
                    onClick={() => handleNav('admin')}
                    className="w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-bold bg-amber-500 text-white flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Administrator paneli</span>
                  </button>
                  <button
                    onClick={onAdminLogout}
                    className="w-full text-left px-3.5 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Admin sessiyasini tugatish</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdminLogin();
                  }}
                  className="w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin kirish</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
