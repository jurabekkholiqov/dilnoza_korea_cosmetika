import React from 'react';
import { ShoppingCart, Moon, Sun, ShieldAlert, Bot, Layers, Home, Sparkles } from 'lucide-react';
import { ActiveTab } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  cartCount: number;
  onCartClick: () => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  onCartClick,
  theme,
  setTheme,
}) => {
  const isDark = theme === 'dark';

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md transition-colors duration-300 border-b ${
      isDark 
        ? 'bg-[#14120f]/80 border-[#d4af37]/15 text-[#f5f1ea]' 
        : 'bg-[#faf8f5]/80 border-stone-200 text-stone-800'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className={`relative flex items-center justify-center w-12 h-12 rounded-full overflow-hidden border ${
              isDark ? 'border-[#d4af37]/40 bg-[#1e1b15]' : 'border-stone-300 bg-white'
            }`}>
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhUqjC-oNgA6OrzAB47TdJSUybX8NNymaZqezZ61qNjj9Pgl8x4GI2mmhupJaS_a-i8bmuhQasK6DPBsi7UYfZFGc_l-ZMWy-9tfsCdbZWpq7AlyiU1oRNT6Xa3KPUnEqy_NMR4Jt6vf91PYsPIig446kGN-X2K8dX0CW_0aQD_ZnwUILgY9tPrs8U17oXhp62qnsURzNmvlbnP8MbGJ7sKLi94miswr_GhJH3SvpaP64EwIQpd59iCE-dtoP2WFsQuppZY6cP6lw" 
                alt="Dilnoza Koreya Logo" 
                className="w-10 h-10 object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className={`font-serif text-lg sm:text-xl font-bold tracking-wider uppercase ${
                  isDark ? 'text-[#d4af37]' : 'text-stone-900'
                }`}>
                  Dilnoza
                </h1>
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium tracking-widest ${
                  isDark ? 'bg-[#d4af37]/10 text-[#d4af37]' : 'bg-stone-200 text-stone-700'
                }`}>
                  KOREYA
                </span>
              </div>
              <p className={`text-[9px] uppercase tracking-[0.2em] font-light ${
                isDark ? 'text-[#e5dfd3]/60' : 'text-stone-500'
              }`}>
                Premium Kosmetika
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            {[
              { id: 'home', label: 'Asosiy', icon: Home },
              { id: 'catalog', label: 'Katalog', icon: Layers },
              { id: 'admin', label: 'Boshqaruv', icon: ShieldAlert },
              { id: 'bot', label: 'Telegram Bot', icon: Bot },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    isActive 
                      ? isDark 
                        ? 'bg-[#d4af37] text-[#14120f] shadow-lg shadow-[#d4af37]/20 font-semibold' 
                        : 'bg-stone-900 text-[#faf8f5] shadow-md'
                      : isDark 
                        ? 'hover:bg-[#d4af37]/10 text-[#e5dfd3]/80 hover:text-white' 
                        : 'hover:bg-stone-100 text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Quick Actions (Cart & Theme Switch & Mobile indicator) */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Theme Toggle Button */}
            <button
              id="theme-toggle-btn"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`p-2 rounded-full border transition-all duration-300 ${
                isDark 
                  ? 'border-[#d4af37]/25 bg-[#1e1b15] text-[#d4af37] hover:bg-[#d4af37]/10' 
                  : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
              }`}
              title={isDark ? "Yorug' mavzu" : "Qorong'i mavzu"}
            >
              {isDark ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

            {/* Cart Button */}
            <button
              id="cart-trigger-btn"
              onClick={onCartClick}
              className={`relative p-2.5 rounded-full border transition-all duration-300 flex items-center gap-1.5 ${
                isDark 
                  ? 'border-[#d4af37]/25 bg-[#1e1b15] text-[#e5dfd3] hover:border-[#d4af37] hover:text-[#d4af37]' 
                  : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400 hover:text-stone-900'
              }`}
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              {cartCount > 0 && (
                <span className={`absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce ${
                  isDark ? 'bg-[#d4af37] text-[#14120f]' : 'bg-red-500 text-white'
                }`}>
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className={`md:hidden flex justify-around items-center py-2.5 border-t ${
        isDark ? 'bg-[#181512] border-[#d4af37]/10' : 'bg-[#f4f2ee] border-stone-200'
      }`}>
        {[
          { id: 'home', label: 'Asosiy', icon: Home },
          { id: 'catalog', label: 'Katalog', icon: Layers },
          { id: 'admin', label: 'Boshqaruv', icon: ShieldAlert },
          { id: 'bot', label: 'Bot', icon: Bot },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-all duration-300 ${
                isActive 
                  ? isDark 
                    ? 'text-[#d4af37]' 
                    : 'text-stone-900 font-semibold'
                  : 'text-stone-400'
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
