import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, SlidersHorizontal, ShoppingBag, X, Plus, Minus, Check, ArrowUpDown, ChevronRight, CornerDownRight, Sparkles } from 'lucide-react';
import { Product, CartItem } from '../types';
import { CATEGORIES, BRANDS } from '../data';

interface CatalogTabProps {
  theme: 'light' | 'dark';
  products: Product[];
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onAddLog: (message: string, type: 'success' | 'info' | 'error') => void;
  onIncrementOrders: () => void;
  botUsername?: string;
  adminTelegramId?: string;
  adminUsername?: string;
}

export const CatalogTab: React.FC<CatalogTabProps> = ({
  theme,
  products,
  cart,
  setCart,
  isCartOpen,
  setIsCartOpen,
  selectedCategory,
  setSelectedCategory,
  onAddLog,
  onIncrementOrders,
  botUsername,
  adminTelegramId,
  adminUsername,
}) => {
  const isDark = theme === 'dark';

  // Helper to open Telegram bot links safely inside or outside Telegram WebApp
  const handleBuyProduct = async (productId: string) => {
    const adminId = adminTelegramId || '6115902116'; // Dynamic Admin Telegram ID
    const username = botUsername || 'dilnoza_koreya_bot';
    
    if (!productId) {
      // Just opening the bot itself
      const botUrl = `https://t.me/${username}`;
      const tg = (window as any).Telegram?.WebApp;
      if (tg && typeof tg.openTelegramLink === 'function') {
        tg.openTelegramLink(botUrl);
      } else {
        window.open(botUrl, '_blank', 'noopener,noreferrer');
      }
      return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) return;

    try {
      // 1. Send order to backend database and notify admin via Telegram API
      const response = await fetch('/api/web-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      });
      
      let orderId = `web_ord_${Date.now()}`;
      if (response.ok) {
        const data = await response.json();
        orderId = data.orderId || orderId;
      }

      // 2. Pre-format and copy the checkout message template to clipboard
      const copyText = `Salom, men saytdan mahsulot tanladim: ${product.name} (${product.price.toLocaleString('ru-RU')} so'm). Buyurtma ID: ${orderId}`;
      try {
        await navigator.clipboard.writeText(copyText);
        // Show a brief native webapp alert to guide the user
        const tg = (window as any).Telegram?.WebApp;
        if (tg && typeof tg.showAlert === 'function') {
          tg.showAlert("Xarid ma'lumotlari avtomatik nusxalandi! Admin lichkasiga o'tgach, shunchaki 'Вставить' (Paste) tugmasini bosing va xabarni yuboring.");
        } else {
          alert("Xarid ma'lumotlari nusxalandi! Admin lichkasiga o'tib, xabarni joylang (Paste).");
        }
      } catch (clipErr) {
        console.error("Clipboard copy error:", clipErr);
      }

      // 3. Open Admin's direct personal chat (Lichka)
      const adminUrl = adminUsername ? `https://t.me/${adminUsername.replace('@', '')}` : `tg://user?id=${adminId}`;
      const tg = (window as any).Telegram?.WebApp;
      if (tg && typeof tg.openTelegramLink === 'function') {
        tg.openTelegramLink(adminUrl);
      } else {
        window.open(adminUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      console.error("Error creating web order:", err);
    }
  };

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('Barchasi');
  const [sortBy, setSortBy] = useState<'default' | 'cheap' | 'expensive' | 'alphabetical'>('default');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Checkout State
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Filters & Sorting logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              p.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'Barchasi' || p.category.toLowerCase() === selectedCategory.toLowerCase();
        const matchesBrand = selectedBrand === 'Barchasi' || p.brand === selectedBrand;
        return matchesSearch && matchesCategory && matchesBrand;
      })
      .sort((a, b) => {
        if (sortBy === 'cheap') return a.price - b.price;
        if (sortBy === 'expensive') return b.price - a.price;
        if (sortBy === 'alphabetical') return a.name.localeCompare(b.name);
        return 0; // default
      });
  }, [products, searchQuery, selectedCategory, selectedBrand, sortBy]);

  // Cart Functions
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        return prevCart.map((item) => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      }
      return [...prevCart, { product, quantity }];
    });
    onAddLog(`Savatga qo'shildi: ${product.name} (${quantity} dona)`, 'info');
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerAddress) return;

    const totalAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const orderItemsSummary = cart.map(item => `${item.product.name} (${item.quantity}x)`).join(', ');

    // Increment orders on parent dashboard
    onIncrementOrders();

    // Trigger dynamic activity timeline logging
    onAddLog(
      `Yangi buyurtma bot orqali qabul qilindi: ${customerName} (+${customerPhone}). Jami: ${totalAmount.toLocaleString('ru-RU')} so'm [${orderItemsSummary}]`, 
      'success'
    );

    setCheckoutSuccess(true);
    setTimeout(() => {
      setCart([]);
      setIsCheckingOut(false);
      setCheckoutSuccess(false);
      setIsCartOpen(false);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
    }, 4000);
  };

  const totalCartSum = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="py-6 pb-20 space-y-8">
      
      {/* Search and Main Filters Area */}
      <section className={`rounded-2xl p-6 border ${
        isDark ? 'bg-[#181512] border-[#d4af37]/15 text-[#faf8f5]' : 'bg-white border-stone-200 text-stone-800'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Search bar */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-stone-400" />
            <input
              id="product-search-input"
              type="text"
              placeholder="Mahsulot nomi yoki brendni kiriting..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10.5 pr-4 py-3 rounded-xl border text-sm transition-all outline-none ${
                isDark 
                  ? 'bg-[#1e1b15] border-[#d4af37]/20 focus:border-[#d4af37] text-white placeholder-stone-500' 
                  : 'bg-stone-50 border-stone-200 focus:border-stone-500 text-stone-950 placeholder-stone-400'
              }`}
            />
          </div>

          {/* Brand select */}
          <div className="md:col-span-3">
            <select
              id="brand-filter-select"
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className={`w-full px-3.5 py-3 rounded-xl border text-sm transition-all outline-none appearance-none ${
                isDark 
                  ? 'bg-[#1e1b15] border-[#d4af37]/20 focus:border-[#d4af37] text-white' 
                  : 'bg-stone-50 border-stone-200 focus:border-stone-500 text-stone-950'
              }`}
            >
              <option value="Barchasi">Barcha Brendlar</option>
              {BRANDS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Sort selection */}
          <div className="md:col-span-3">
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className={`w-full px-3.5 py-3 rounded-xl border text-sm transition-all outline-none appearance-none ${
                isDark 
                  ? 'bg-[#1e1b15] border-[#d4af37]/20 focus:border-[#d4af37] text-white' 
                  : 'bg-stone-50 border-stone-200 focus:border-stone-500 text-stone-950'
              }`}
            >
              <option value="default">Saralash: Tavsiya etilgan</option>
              <option value="cheap">Narx: Shaxsan o'sish</option>
              <option value="expensive">Narx: Shaxsan kamayish</option>
              <option value="alphabetical">Nomi: A dan Z gacha</option>
            </select>
          </div>

          {/* Counter banner / indicator */}
          <div className="md:col-span-1 text-center font-mono text-xs text-stone-400 font-medium">
            {filteredProducts.length} ta
          </div>

        </div>

        {/* Categories Pills Row */}
        <div className="flex items-center gap-2 overflow-x-auto mt-6 pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('Barchasi')}
            className={`px-4.5 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 shrink-0 ${
              selectedCategory === 'Barchasi'
                ? isDark 
                  ? 'bg-[#d4af37] text-stone-950 shadow-md shadow-[#d4af37]/10' 
                  : 'bg-stone-900 text-white'
                : isDark 
                  ? 'bg-[#1e1b15] text-[#e5dfd3]/80 hover:bg-[#d4af37]/15 hover:text-white' 
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-950'
            }`}
          >
            Barchasi
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4.5 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 shrink-0 ${
                selectedCategory === cat
                  ? isDark 
                    ? 'bg-[#d4af37] text-stone-950 shadow-md shadow-[#d4af37]/10' 
                    : 'bg-stone-900 text-white'
                  : isDark 
                    ? 'bg-[#1e1b15] text-[#e5dfd3]/80 hover:bg-[#d4af37]/15 hover:text-white' 
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-950'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            id={`product-card-${product.id}`}
            className={`group relative flex flex-col rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-xl cursor-pointer ${
              isDark 
                ? 'bg-[#181512] border-[#d4af37]/10 hover:border-[#d4af37]/30 text-white' 
                : 'bg-white border-stone-200 hover:border-stone-400 text-stone-800'
            }`}
            onClick={() => setSelectedProduct(product)}
          >
            {/* Tag badge */}
            {product.tag && (
              <span className="absolute top-4 left-4 z-10 bg-[#d4af37] text-stone-950 text-[9px] font-extrabold tracking-widest uppercase py-0.5 px-2 rounded-md">
                {product.tag}
              </span>
            )}
            
            <div className="relative aspect-square overflow-hidden bg-stone-100">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-extrabold tracking-wider text-[#d4af37] uppercase">
                  <span>{product.brand}</span>
                  <span className="opacity-70">{product.category}</span>
                </div>
                <h4 className="font-serif font-bold text-base leading-snug group-hover:text-[#d4af37] transition-colors line-clamp-1">
                  {product.name}
                </h4>
                <p className={`text-xs line-clamp-2 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                  {product.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="font-serif font-extrabold text-sm sm:text-base text-[#d4af37]">
                  {product.price.toLocaleString('ru-RU')} so'm
                </span>
                <button
                  id={`add-to-cart-${product.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBuyProduct(product.id);
                  }}
                  className="py-1.5 px-3 rounded-full text-[11px] font-bold uppercase bg-[#d4af37] hover:bg-[#bfa032] text-stone-950 transition-colors text-center inline-block cursor-pointer font-extrabold"
                >
                  Sotib olish
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* No results placeholder */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-16 space-y-4">
          <ShoppingBag className="w-12 h-12 text-stone-400 mx-auto opacity-40 animate-bounce" />
          <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-stone-800'}`}>
            Hech qanday mahsulot topilmadi
          </h4>
          <p className="text-stone-500 text-sm">Boshqa kalit so'z yoki brendni tanlab ko'ring</p>
        </div>
      )}

      {/* Product Details Dialog Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-black"
            />

            {/* Content container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`relative max-w-2xl w-full rounded-2xl overflow-hidden shadow-2xl z-10 border ${
                isDark ? 'bg-[#181512] border-[#d4af37]/20 text-white' : 'bg-white border-stone-200 text-stone-800'
              }`}
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="relative aspect-square md:aspect-auto md:h-full min-h-[240px] bg-stone-100">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                
                <div className="p-6 sm:p-8 space-y-5 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-bold tracking-widest text-[#d4af37] uppercase">
                      <span>{selectedProduct.brand}</span>
                      <span>{selectedProduct.category}</span>
                    </div>
                    
                    <h3 className="font-serif text-xl sm:text-2xl font-bold leading-tight">
                      {selectedProduct.name}
                    </h3>
                    
                    <span className="inline-block text-xl font-serif font-extrabold text-[#d4af37]">
                      {selectedProduct.price.toLocaleString('ru-RU')} so'm
                    </span>

                    <div className="h-px bg-stone-200/20 my-2" />

                    <div className="space-y-1">
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#d4af37] flex items-center gap-1">
                        <ChevronRight className="w-3.5 h-3.5" /> Batafsil Ma'lumot
                      </p>
                      <p className={`text-xs leading-relaxed ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
                        {selectedProduct.description}
                      </p>
                    </div>

                    <div className="space-y-1 pt-2">
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#d4af37] flex items-center gap-1">
                        <CornerDownRight className="w-3.5 h-3.5" /> Qo'llanilishi (Guide)
                      </p>
                      <p className={`text-[11px] leading-relaxed italic ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                        Kerarli miqdorni olib, yuzingiz terisiga engil urish harakatlari bilan surting. To'liq so'rilguncha qoldiring. Ertalab va kechqurun foydalanish tavsiya etiladi.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      onClick={() => {
                        handleBuyProduct(selectedProduct.id);
                        setSelectedProduct(null);
                      }}
                      className="flex-1 py-3 rounded-xl text-xs font-bold uppercase bg-[#d4af37] hover:bg-[#bfa032] text-stone-950 transition-colors flex items-center justify-center gap-2 shadow-md text-center cursor-pointer font-extrabold"
                    >
                      Telegram Botda Sotib Olish
                    </button>
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className={`px-4.5 py-3 rounded-xl text-xs font-bold uppercase border transition-colors ${
                        isDark 
                          ? 'border-stone-700 hover:bg-stone-800 text-white' 
                          : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      Yopish
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Slide-over Cart Panel */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-black"
            />

            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                className={`w-screen max-w-md h-full flex flex-col shadow-2xl border-l ${
                  isDark ? 'bg-[#14120f] border-[#d4af37]/20 text-white' : 'bg-[#faf8f5] border-stone-200 text-stone-800'
                }`}
              >
                {/* Cart Header */}
                <div className={`px-6 py-5 border-b flex items-center justify-between ${
                  isDark ? 'border-[#d4af37]/15' : 'border-stone-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-[#d4af37]" />
                    <h3 className="font-serif text-lg font-bold">Xarid Savatingiz</h3>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="p-1.5 rounded-full hover:bg-stone-800/10 dark:hover:bg-white/10 text-stone-400 hover:text-stone-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Cart Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {checkoutSuccess ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/30">
                        <Check className="w-8 h-8" />
                      </div>
                      <h4 className="font-serif text-xl font-bold text-emerald-500">Buyurtma Qabul Qilindi!</h4>
                      <p className="text-sm text-stone-400 px-4">
                        Tashakkur! Sizning buyurtmangiz muvaffaqiyatli qabul qilindi. <b>Telegram boti</b> orqali ma'lumotlar yuborildi. Tez orada parvarish ekspertimiz siz bilan bog'lanadi.
                      </p>
                      <p className="text-xs font-mono text-[#d4af37] animate-pulse">Avtomatik yopilmoqda...</p>
                    </div>
                  ) : isCheckingOut ? (
                    /* Checkout Form */
                    <form onSubmit={handleCheckoutSubmit} className="space-y-4 py-2">
                      <div className="space-y-1">
                        <h4 className="font-serif text-lg font-bold">Buyurtmani rasmiylashtirish</h4>
                        <p className="text-stone-400 text-xs font-light">Telegram bot orqali bog'lanish uchun ma'lumotlarni kiriting</p>
                      </div>

                      <div className="h-px bg-stone-200/10 my-2" />

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase text-[#d4af37]">Ism va Familiya</label>
                        <input
                          id="checkout-name-input"
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Masalan: Anora Karimova"
                          className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-all outline-none ${
                            isDark ? 'bg-[#1e1b15] border-stone-800 text-white' : 'bg-white border-stone-200 text-stone-900'
                          }`}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase text-[#d4af37]">Telefon raqami</label>
                        <input
                          id="checkout-phone-input"
                          type="text"
                          required
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="Masalan: +998 (90) 123-45-67"
                          className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-all outline-none ${
                            isDark ? 'bg-[#1e1b15] border-stone-800 text-white' : 'bg-white border-stone-200 text-stone-900'
                          }`}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase text-[#d4af37]">Yetkazib berish manzili</label>
                        <textarea
                          id="checkout-address-input"
                          required
                          rows={3}
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          placeholder="Masalan: Toshkent sh., Chilonzor tumani, 9-kvartal, 12-uy"
                          className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-all outline-none resize-none ${
                            isDark ? 'bg-[#1e1b15] border-stone-800 text-white' : 'bg-white border-stone-200 text-stone-900'
                          }`}
                        />
                      </div>

                      <div className={`p-4 rounded-xl space-y-2 text-xs border ${
                        isDark ? 'bg-[#1e1b15] border-stone-800' : 'bg-stone-50 border-stone-200'
                      }`}>
                        <div className="flex justify-between">
                          <span>Mahsulotlar soni:</span>
                          <span className="font-bold">{cart.reduce((sum, item) => sum + item.quantity, 0)} dona</span>
                        </div>
                        <div className="flex justify-between text-base font-bold text-[#d4af37]">
                          <span>Umumiy summa:</span>
                          <span>{totalCartSum.toLocaleString('ru-RU')} so\'m</span>
                        </div>
                      </div>

                      <div className="pt-4 flex gap-3">
                        <button
                          type="submit"
                          className="flex-1 py-3 rounded-xl text-xs font-bold uppercase bg-emerald-500 hover:bg-emerald-600 text-white transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-4 h-4" /> Tasdiqlash
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsCheckingOut(false)}
                          className={`px-4.5 py-3 rounded-xl text-xs font-bold uppercase border transition-colors ${
                            isDark ? 'border-stone-700 hover:bg-stone-800 text-white' : 'border-stone-200 text-stone-600'
                          }`}
                        >
                          Orqaga
                        </button>
                      </div>
                    </form>
                  ) : cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                      <ShoppingBag className="w-12 h-12 text-stone-400 opacity-30" />
                      <div>
                        <h4 className="font-bold">Hozircha savat bo'sh</h4>
                        <p className="text-stone-500 text-xs mt-1">Katalogimizga qaytib, o'zingizga yoqqan mahsulotlarni qo'shing</p>
                      </div>
                    </div>
                  ) : (
                    /* Items list */
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div
                          key={item.product.id}
                          className={`flex items-center gap-4 p-3 rounded-xl border ${
                            isDark ? 'bg-[#1e1b15] border-stone-800/60' : 'bg-white border-stone-200'
                          }`}
                        >
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-14 h-14 rounded-lg object-cover bg-stone-100"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-xs truncate">{item.product.name}</h5>
                            <p className="text-[10px] text-stone-400 font-bold uppercase mt-0.5">{item.product.brand}</p>
                            <span className="text-xs text-[#d4af37] font-bold block mt-1">
                              {item.product.price.toLocaleString('ru-RU')} so'm
                            </span>
                          </div>

                          <div className="flex items-center gap-2 border border-stone-800/40 rounded-full px-1.5 py-0.5">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id, -1)}
                              className="p-1 rounded-full text-stone-400 hover:text-white"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold font-mono min-w-4 text-center">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id, 1)}
                              className="p-1 rounded-full text-stone-400 hover:text-white"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cart Footer */}
                {!isCheckingOut && cart.length > 0 && !checkoutSuccess && (
                  <div className={`p-6 border-t space-y-4 ${
                    isDark ? 'border-[#d4af37]/15 bg-[#1a1714]' : 'border-stone-200 bg-stone-50'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Tanlanganlar summasi:</span>
                      <span className="font-serif text-lg font-extrabold text-[#d4af37]">
                        {totalCartSum.toLocaleString('ru-RU')} so'm
                      </span>
                    </div>

                    <div className={`p-3 rounded-xl border text-[11px] leading-relaxed ${
                      isDark ? 'bg-[#181512] border-stone-800 text-stone-400' : 'bg-stone-50 border-stone-200 text-stone-600'
                    }`}>
                      💡 <b>Eslatma:</b> Saytda to'lov va buyurtma rasmiylashtirish mavjud emas. Buyurtmalarni qabul qilish va shaffof to'lovlar faqat Telegram Bot orqali amalga oshiriladi. Bot orqali buyurtma berilgach, admin lichkasiga yo'naltirilasiz.
                    </div>

                    <button
                      onClick={() => handleBuyProduct('')}
                      className="w-full py-3.5 rounded-xl text-xs font-bold uppercase bg-[#d4af37] hover:bg-[#bfa032] text-[#14120f] transition-all duration-300 flex items-center justify-center gap-1.5 shadow-lg shadow-[#d4af37]/10 text-center font-extrabold cursor-pointer"
                    >
                      Telegram Botni Ochish <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
