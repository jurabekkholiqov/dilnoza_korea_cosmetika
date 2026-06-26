import { useState, useMemo, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomeTab } from './components/HomeTab';
import { CatalogTab } from './components/CatalogTab';
import { AdminTab } from './components/AdminTab';
import { BotSettingsTab } from './components/BotSettingsTab';
import { INITIAL_PRODUCTS, INITIAL_BOT_SETTINGS, INITIAL_LOGS } from './data';
import { ActiveTab, Product, CartItem, BotSettings, LogEntry } from './types';
import { Heart, Globe, Sparkles } from 'lucide-react';

// Premium Admin Login View
function AdminLogin({ theme, onLogin }: { theme: 'light' | 'dark', onLogin: (pass: string) => Promise<boolean> }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const isDark = theme === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onLogin(password);
    if (success) {
      setError(false);
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="py-12 flex flex-col items-center justify-center min-h-[500px] w-full">
      <div
        className={`max-w-md w-full p-8 rounded-3xl border shadow-2xl space-y-6 ${
          isDark ? 'bg-[#181512] border-[#d4af37]/20 text-white' : 'bg-white border-stone-200 text-stone-800'
        }`}
      >
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-full bg-[#d4af37]/10 text-[#d4af37] mb-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="font-serif text-2xl font-bold">Admin Tizimiga Kirish</h3>
          <p className="text-xs text-stone-400 font-light">Ushbu sahifalar faqat do'kon ma'muri uchun ochiq</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">Parol yoki Admin Telegram ID</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full px-3.5 py-3 rounded-xl border text-sm font-mono transition-all outline-none text-center ${
                isDark ? 'bg-[#1e1b15] border-stone-800 focus:border-[#d4af37] text-white' : 'bg-stone-50 border-stone-200 focus:border-stone-500 text-stone-900'
              }`}
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs text-center font-semibold">Parol noto'g'ri! Qaytadan urinib ko'ring.</p>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl text-xs font-bold uppercase bg-[#d4af37] hover:bg-[#bfa032] text-[#14120f] transition-all duration-300 flex items-center justify-center gap-1.5 shadow-lg shadow-[#d4af37]/10 font-extrabold cursor-pointer"
          >
            Tizimga Kirish
          </button>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  // Global States
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [botSettings, setBotSettings] = useState<BotSettings>(INITIAL_BOT_SETTINGS);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Barchasi');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isAdminAuth') === 'true';
  });
  const [adminPassword, setAdminPassword] = useState<string>(() => {
    return localStorage.getItem('adminPassword') || '';
  });

  // Public Configuration (loaded dynamically from server)
  const [publicConfig, setPublicConfig] = useState<{ adminTelegramId: string; botUsername: string; adminUsername: string }>({
    adminTelegramId: '6115902116',
    botUsername: 'dilnoza_koreya_bot',
    adminUsername: ''
  });

  // Bot Stats
  const [botUsersCount, setBotUsersCount] = useState(0);
  const [messagesSentToday, setMessagesSentToday] = useState(0);
  const [botOrdersCount, setBotOrdersCount] = useState(0);

  // Verification helper for login (checks directly against the server API)
  const handleAdminLogin = async (password: string) => {
    try {
      const headers = { 'Authorization': `Bearer ${password}` };
      const response = await fetch('/api/bot-settings', { headers });
      if (response.ok) {
        setIsAdminAuthenticated(true);
        setAdminPassword(password);
        localStorage.setItem('isAdminAuth', 'true');
        localStorage.setItem('adminPassword', password);
        const settings = await response.json();
        setBotSettings(settings);
        return true;
      }
    } catch (err) {
      console.error("Login verification failed:", err);
    }
    return false;
  };

  // Helper to refresh all data from server
  const refreshAllData = async () => {
    try {
      const token = adminPassword || localStorage.getItem('adminPassword') || '';
      const isAuth = isAdminAuthenticated || localStorage.getItem('isAdminAuth') === 'true';

      // 1. Fetch public products, stats, and config (always fetched)
      const [resProducts, resStats, resConfig] = await Promise.all([
        fetch('/api/products').then(r => r.json()),
        fetch('/api/stats').then(r => r.json()),
        fetch('/api/config').then(r => r.json()).catch(() => null)
      ]);
      
      setProducts(resProducts);
      setBotUsersCount(resStats.botUsersCount);
      setMessagesSentToday(resStats.messagesSentToday);
      setBotOrdersCount(resStats.botOrdersCount);
      if (resConfig) {
        setPublicConfig(resConfig);
      }

      // 2. Fetch sensitive settings and logs ONLY if the admin is authenticated
      if (isAuth && token) {
        const headers = { 'Authorization': `Bearer ${token}` };
        const [settingsRes, logsRes] = await Promise.all([
          fetch('/api/bot-settings', { headers }),
          fetch('/api/logs', { headers })
        ]);

        // If unauthorized, reset state to stop log spam
        if (settingsRes.status === 401 || logsRes.status === 401) {
          setIsAdminAuthenticated(false);
          setAdminPassword('');
          localStorage.removeItem('isAdminAuth');
          localStorage.removeItem('adminPassword');
          return;
        }

        const resSettings = await settingsRes.json();
        const resLogs = await logsRes.json();
        setBotSettings(resSettings);
        setLogs(resLogs);
      }
    } catch (err) {
      console.error("Error fetching live data from backend:", err);
    }
  };

  // Fetch initial data and start polling stats/logs
  useEffect(() => {
    refreshAllData();
    const interval = setInterval(refreshAllData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Helper to add activity log (local trigger, triggers refresh)
  const handleAddLog = async (message: string, type: 'success' | 'info' | 'error') => {
    // Just refresh data from server to sync logs
    await refreshAllData();
  };

  // Helper to increment orders (handled server side now)
  const handleIncrementOrders = () => {
    refreshAllData();
  };

  // Switch tabs from Home cards
  const handleNavigateToCatalog = (category?: string) => {
    if (category) {
      setSelectedCategory(category);
    } else {
      setSelectedCategory('Barchasi');
    }
    setActiveTab('catalog');
  };

  // Top/Featured products list
  const topProducts = useMemo(() => {
    return products.filter((p) => p.isTop || p.tag === 'TOP MAHSULOT').slice(0, 3);
  }, [products]);

  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      isDark ? 'bg-[#0f0e0c] text-stone-100' : 'bg-stone-50 text-stone-800'
    }`}>
      
      {/* Premium Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cartTotalCount}
        onCartClick={() => setIsCartOpen(true)}
        theme={theme}
        setTheme={setTheme}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {activeTab === 'home' && (
          <HomeTab
            theme={theme}
            onNavigateToCatalog={handleNavigateToCatalog}
            topProducts={topProducts}
            onAddToCart={(product) => {
              setCart((prev) => {
                const existing = prev.find((item) => item.product.id === product.id);
                if (existing) {
                  return prev.map((item) => 
                    item.product.id === product.id 
                      ? { ...item, quantity: item.quantity + 1 } 
                      : item
                  );
                }
                return [...prev, { product, quantity: 1 }];
              });
              handleAddLog(`Savatga qo'shildi: ${product.name} (1 dona)`, 'info');
              setIsCartOpen(true);
            }}
          />
        )}

        {activeTab === 'catalog' && (
          <CatalogTab
            theme={theme}
            products={products}
            cart={cart}
            setCart={setCart}
            isCartOpen={isCartOpen}
            setIsCartOpen={setIsCartOpen}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onAddLog={handleAddLog}
            onIncrementOrders={handleIncrementOrders}
            botUsername={publicConfig.botUsername}
            adminTelegramId={publicConfig.adminTelegramId}
            adminUsername={publicConfig.adminUsername}
          />
        )}

        {activeTab === 'admin' && (
          isAdminAuthenticated ? (
            <div className="space-y-4">
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => {
                    setIsAdminAuthenticated(false);
                    setAdminPassword('');
                    localStorage.removeItem('isAdminAuth');
                    localStorage.removeItem('adminPassword');
                  }}
                  className="px-4 py-2 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold uppercase transition-all duration-300 cursor-pointer shadow-md"
                >
                  🔒 Tizimni Qulflash (Chiqish)
                </button>
              </div>
              <AdminTab
                theme={theme}
                products={products}
                setProducts={setProducts}
                onAddLog={handleAddLog}
                botUsersCount={botUsersCount}
              />
            </div>
          ) : (
            <AdminLogin theme={theme} onLogin={handleAdminLogin} />
          )
        )}

        {activeTab === 'bot' && (
          isAdminAuthenticated ? (
            <div className="space-y-4">
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => {
                    setIsAdminAuthenticated(false);
                    setAdminPassword('');
                    localStorage.removeItem('isAdminAuth');
                    localStorage.removeItem('adminPassword');
                  }}
                  className="px-4 py-2 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold uppercase transition-all duration-300 cursor-pointer shadow-md"
                >
                  🔒 Tizimni Qulflash (Chiqish)
                </button>
              </div>
              <BotSettingsTab
                theme={theme}
                botSettings={botSettings}
                setBotSettings={setBotSettings}
                logs={logs}
                setLogs={setLogs}
                onAddLog={handleAddLog}
                botUsersCount={botUsersCount}
                messagesSentToday={messagesSentToday}
                botOrdersCount={botOrdersCount}
                onChangePassword={(pass) => {
                  setAdminPassword(pass);
                  localStorage.setItem('adminPassword', pass);
                }}
              />
            </div>
          ) : (
            <AdminLogin theme={theme} onLogin={handleAdminLogin} />
          )
        )}
      </main>

      {/* Elegant Premium Footer */}
      <footer className={`py-12 border-t mt-16 transition-colors duration-300 ${
        isDark 
          ? 'bg-[#12100d] border-[#d4af37]/10 text-[#faf8f5]/60' 
          : 'bg-stone-100 border-stone-200 text-stone-500'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Left Brand Area */}
            <div className="md:col-span-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className={`font-serif text-lg font-bold uppercase tracking-widest ${isDark ? 'text-[#d4af37]' : 'text-stone-900'}`}>
                  Dilnoza Koreya
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-[#d4af37]/15 text-[#d4af37]">PRO</span>
              </div>
              <p className="text-xs font-light max-w-sm">
                Janubiy Koreyadan keltirilgan 100% original va premium kosmetika vositalari. Teringiz uchun eng sara parvarish sirlari.
              </p>
            </div>

            {/* Middle Nav Links */}
            <div className="md:col-span-5 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold uppercase tracking-wider">
              <button onClick={() => setActiveTab('home')} className="hover:text-[#d4af37] transition-colors">Asosiy</button>
              <button onClick={() => setActiveTab('catalog')} className="hover:text-[#d4af37] transition-colors">Katalog</button>
              <button onClick={() => setActiveTab('admin')} className="hover:text-[#d4af37] transition-colors">Boshqaruv</button>
              <button onClick={() => setActiveTab('bot')} className="hover:text-[#d4af37] transition-colors">Telegram Bot</button>
            </div>

            {/* Right Copyright */}
            <div className="md:col-span-3 text-left md:text-right text-xs space-y-1">
              <div className="flex items-center md:justify-end gap-1 text-[11px] font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Go'zallik va Sifat Uyg'unligi</span>
              </div>
              <p className="font-light">© {new Date().getFullYear()} Dilnoza Koreya. Barcha huquqlar himoyalangan.</p>
            </div>

          </div>
        </div>
      </footer>

    </div>
  );
}
