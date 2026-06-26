import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlusCircle, UploadCloud, Trash2, Check, Sparkles, AlertCircle, TrendingUp, Layers, Award, BarChart3, Edit, FileImage } from 'lucide-react';
import { Product } from '../types';
import { CATEGORIES, BRANDS } from '../data';

interface AdminTabProps {
  theme: 'light' | 'dark';
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  onAddLog: (message: string, type: 'success' | 'info' | 'error') => void;
  botUsersCount: number;
}

export const AdminTab: React.FC<AdminTabProps> = ({
  theme,
  products,
  setProducts,
  onAddLog,
  botUsersCount,
}) => {
  const isDark = theme === 'dark';

  // State for form
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [brand, setBrand] = useState(BRANDS[0]);
  const [description, setDescription] = useState('');
  const [customTag, setCustomTag] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  // Drag-and-Drop Simulated State
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; previewUrl: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stats calculation
  const totalProductsCount = products.length;
  const categoriesCount = new Set(products.map((p) => p.category)).size;
  const topBrand = useMemoTopBrand(products);

  function useMemoTopBrand(pList: Product[]) {
    const counts: { [key: string]: number } = {};
    pList.forEach((p) => {
      counts[p.brand] = (counts[p.brand] || 0) + 1;
    });
    let maxBrand = 'MEDI-PEEL';
    let maxVal = 0;
    Object.keys(counts).forEach((key) => {
      if (counts[key] > maxVal) {
        maxVal = counts[key];
        maxBrand = key;
      }
    });
    return maxBrand;
  }

  // Handle Drag Events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const kbSize = (file.size / 1024).toFixed(1);
    const mockUrl = URL.createObjectURL(file);
    
    // Set simulated states
    setUploadedFile({
      name: file.name,
      size: `${kbSize} KB`,
      previewUrl: mockUrl
    });

    // Provide default elegant cosmetics placeholder in case they don't upload a real web-safe image file
    // We'll generate a beautiful Unsplash random skincare image URL as a high-quality fallback
    const unsplashCosmeticFallbacks = [
      'https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&q=80&w=600'
    ];
    const randomIndex = Math.floor(Math.random() * unsplashCosmeticFallbacks.length);
    setImageUrl(unsplashCosmeticFallbacks[randomIndex]);
  };

  // Submit new product with API integration
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name || !price || !description) {
      setFormError('Iltimos, barcha majburiy maydonlarni to\'ldiring!');
      return;
    }

    const priceNum = parseFloat(price.replace(/\s/g, ''));
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Narx to\'g\'ri musbat son bo\'lishi kerak!');
      return;
    }

    setIsSubmitting(true);

    try {
      const finalImg = imageUrl || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600';
      const newProduct: Product = {
        id: `p_${Date.now()}`,
        name,
        price: priceNum,
        category,
        brand,
        image: finalImg,
        description,
        isNew: true,
        tag: customTag || undefined
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminPassword') || ''}`
        },
        body: JSON.stringify(newProduct)
      });

      if (response.ok) {
        setProducts((prev) => [newProduct, ...prev]);
        onAddLog(`Yangi mahsulot qo'shildi: ${name} [${brand} - ${priceNum.toLocaleString('ru-RU')} so'm]`, 'success');
        setFormSuccess(true);
        // Clear form
        setName('');
        setPrice('');
        setDescription('');
        setCustomTag('');
        setImageUrl('');
        setUploadedFile(null);
      } else {
        setFormError('Mahsulotni qo\'shishda xatolik yuz berdi.');
      }
    } catch (err) {
      console.error(err);
      setFormError('Tarmoq xatoligi tufayli mahsulot qo\'shilmadi.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setFormSuccess(false), 3500);
    }
  };

  // Delete product with API integration
  const handleDeleteProduct = async (productId: string, prodName: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('adminPassword') || ''}`
        }
      });
      if (response.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        onAddLog(`Mahsulot o'chirildi: ${prodName}`, 'error');
      } else {
        onAddLog('Mahsulotni o\'chirishda xatolik yuz berdi', 'error');
      }
    } catch (err) {
      console.error(err);
      onAddLog('Tarmoq xatoligi tufayli mahsulot o\'chirilmadi', 'error');
    }
  };

  return (
    <div className="py-6 pb-20 space-y-10">
      
      {/* Live Admin Dashboard Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1 */}
        <div className={`p-6 rounded-2xl border flex items-center justify-between ${
          isDark ? 'bg-[#181512] border-[#d4af37]/15 text-[#faf8f5]' : 'bg-white border-stone-200 text-stone-800'
        }`}>
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Jami Mahsulotlar</span>
            <h4 className="font-serif text-3xl font-extrabold text-[#d4af37]">{totalProductsCount} ta</h4>
            <p className="text-[10px] text-stone-400 font-light">Katalogdagi faol mahsulotlar</p>
          </div>
          <div className="p-3 rounded-xl bg-[#d4af37]/10 text-[#d4af37]">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className={`p-6 rounded-2xl border flex items-center justify-between ${
          isDark ? 'bg-[#181512] border-[#d4af37]/15 text-[#faf8f5]' : 'bg-white border-stone-200 text-stone-800'
        }`}>
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Kategoriyalar</span>
            <h4 className="font-serif text-3xl font-extrabold text-[#d4af37]">{categoriesCount} ta</h4>
            <p className="text-[10px] text-stone-400 font-light">Yuz parvarishi, zardob va boshqalar</p>
          </div>
          <div className="p-3 rounded-xl bg-[#d4af37]/10 text-[#d4af37]">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className={`p-6 rounded-2xl border flex items-center justify-between ${
          isDark ? 'bg-[#181512] border-[#d4af37]/15 text-[#faf8f5]' : 'bg-white border-stone-200 text-stone-800'
        }`}>
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Top Brend</span>
            <h4 className="font-serif text-2xl font-extrabold text-[#d4af37] truncate max-w-[150px]">{topBrand}</h4>
            <p className="text-[10px] text-stone-400 font-light">Eng ko'p qo'shilgan brend</p>
          </div>
          <div className="p-3 rounded-xl bg-[#d4af37]/10 text-[#d4af37]">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className={`p-6 rounded-2xl border flex items-center justify-between ${
          isDark ? 'bg-[#181512] border-[#d4af37]/15 text-[#faf8f5]' : 'bg-white border-stone-200 text-stone-800'
        }`}>
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Bot Foydalanuvchilari</span>
            <h4 className="font-serif text-3xl font-extrabold text-[#d4af37]">{botUsersCount.toLocaleString('ru-RU')}</h4>
            <p className="text-[10px] text-stone-400 font-light">Telegram integratsiya foydalanuvchilari</p>
          </div>
          <div className="p-3 rounded-xl bg-[#d4af37]/10 text-[#d4af37]">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>

      </section>

      {/* Main split grid: Add Form & Recent Items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Add Product Form - Left side */}
        <div className={`lg:col-span-5 p-6 sm:p-8 rounded-2xl border ${
          isDark ? 'bg-[#181512] border-[#d4af37]/15 text-[#faf8f5]' : 'bg-white border-stone-200 text-stone-800'
        }`}>
          <div className="flex items-center gap-2 mb-6">
            <PlusCircle className="w-5 h-5 text-[#d4af37]" />
            <h3 className="font-serif text-xl font-bold">Yangi Mahsulot Qo'shish</h3>
          </div>

          <form onSubmit={handleAddProduct} className="space-y-4">
            
            {formError && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{formError}</span>
              </div>
            )}

            <AnimatePresence>
              {formSuccess && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Mahsulot katalogga muvaffaqiyatli qo'shildi!</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Inputs grid */}
            <div className="space-y-3.5">
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">Sarlavha (Nomi) *</label>
                <input
                  id="admin-add-title-input"
                  type="text"
                  required
                  placeholder="Masalan: Hyaluron Collagen Serum"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all outline-none ${
                    isDark ? 'bg-[#1e1b15] border-stone-800 focus:border-[#d4af37]' : 'bg-stone-50 border-stone-200 focus:border-stone-500'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">Brend *</label>
                  <select
                    id="admin-add-brand-select"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all outline-none ${
                      isDark ? 'bg-[#1e1b15] border-stone-800' : 'bg-stone-50 border-stone-200'
                    }`}
                  >
                    {BRANDS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">Kategoriya *</label>
                  <select
                    id="admin-add-category-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all outline-none ${
                      isDark ? 'bg-[#1e1b15] border-stone-800' : 'bg-stone-50 border-stone-200'
                    }`}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">Narxi (so'm) *</label>
                  <input
                    id="admin-add-price-input"
                    type="text"
                    required
                    placeholder="Masalan: 185000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all outline-none ${
                      isDark ? 'bg-[#1e1b15] border-stone-800 focus:border-[#d4af37]' : 'bg-stone-50 border-stone-200 focus:border-stone-500'
                    }`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">Maxsus Nishon (Tag)</label>
                  <input
                    id="admin-add-tag-input"
                    type="text"
                    placeholder="Masalan: TOP, CHEGIRMA"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all outline-none ${
                      isDark ? 'bg-[#1e1b15] border-stone-800 focus:border-[#d4af37]' : 'bg-stone-50 border-stone-200 focus:border-stone-500'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">Batafsil tavsif *</label>
                <textarea
                  id="admin-add-desc-input"
                  required
                  rows={3}
                  placeholder="Mahsulot haqida to'liq ma'lumot va teringizga qanday ta'sir qilishi haqida..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all outline-none resize-none ${
                    isDark ? 'bg-[#1e1b15] border-stone-800 focus:border-[#d4af37]' : 'bg-stone-50 border-stone-200 focus:border-stone-500'
                  }`}
                />
              </div>

              {/* Drag & Drop File Upload Area */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">Rasm Yuklash</label>
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4.5 text-center cursor-pointer transition-all duration-300 ${
                    dragActive 
                      ? 'border-[#d4af37] bg-[#d4af37]/5' 
                      : isDark 
                        ? 'border-stone-800 hover:border-[#d4af37]/40 bg-[#1e1b15]' 
                        : 'border-stone-200 hover:border-stone-400 bg-stone-50'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInputChange}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  {uploadedFile ? (
                    <div className="flex items-center justify-between gap-3 text-left">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-200 border border-stone-700/30 shrink-0">
                          <img 
                            src={uploadedFile.previewUrl} 
                            alt="Preview" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">{uploadedFile.name}</p>
                          <p className="text-[9px] text-stone-400 font-mono">{uploadedFile.size}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1 shrink-0">
                        <Check className="w-3.5 h-3.5" /> Yuklandi
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <UploadCloud className="w-8 h-8 mx-auto text-stone-400 opacity-70" />
                      <p className="text-xs font-semibold">Rasm faylini yuklang yoki shu yerga sudrab tashlang</p>
                      <p className="text-[10px] text-stone-400 font-light">PNG, JPG formatlar (Tavsiya etiladi: 1:1 format)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Optional direct URL input */}
              <div className="space-y-1">
                <p className="text-[9px] text-stone-400 italic text-right">yoki rasm havolasini (URL) to'g'ridan-to'g'ri kiriting</p>
                <input
                  id="admin-add-url-input"
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-lg border text-xs transition-all outline-none ${
                    isDark ? 'bg-[#1e1b15] border-stone-800 focus:border-[#d4af37]' : 'bg-stone-50 border-stone-200 focus:border-stone-500'
                  }`}
                />
              </div>

            </div>

            <button
              id="admin-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-xl text-xs font-bold uppercase transition-colors flex items-center justify-center gap-1.5 shadow-md ${
                isSubmitting 
                  ? 'bg-stone-800 text-stone-500 cursor-not-allowed' 
                  : 'bg-[#d4af37] hover:bg-[#bfa032] text-stone-950'
              }`}
            >
              {isSubmitting ? 'Saqlanmoqda...' : 'Muvaffaqiyatli Qo\'shish'}
            </button>

          </form>
        </div>

        {/* Recently Added List - Right side */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={`font-serif text-lg font-bold ${isDark ? 'text-white' : 'text-stone-800'}`}>
              Oxirgi Qo'shilgan Mahsulotlar ({totalProductsCount})
            </h3>
            <span className="text-[10px] font-mono text-[#d4af37] font-bold">ERP tizimi faol</span>
          </div>

          <div className={`rounded-2xl border overflow-hidden ${
            isDark ? 'bg-[#181512] border-[#d4af37]/15' : 'bg-white border-stone-200'
          }`}>
            <div className={`overflow-x-auto`}>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b text-[10px] font-bold uppercase tracking-wider ${
                    isDark ? 'border-[#d4af37]/15 text-[#e5dfd3]/60 bg-[#1e1b15]/50' : 'border-stone-100 text-stone-500 bg-stone-50'
                  }`}>
                    <th className="py-3 px-4">Mahsulot</th>
                    <th className="py-3 px-4">Kategoriya & Brend</th>
                    <th className="py-3 px-4">Narxi</th>
                    <th className="py-3 px-4 text-right">Amal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200/10 text-xs">
                  {products.map((p) => (
                    <tr 
                      key={p.id}
                      className={`transition-colors ${
                        isDark ? 'hover:bg-[#1e1b15]/40 text-stone-200' : 'hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      {/* Product Name and Pic */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={p.image} 
                            alt={p.name} 
                            className="w-10 h-10 rounded-lg object-cover bg-stone-100"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <p className="font-bold truncate max-w-[150px]">{p.name}</p>
                            {p.tag && (
                              <span className="inline-block mt-0.5 text-[8px] uppercase tracking-wider text-[#d4af37] bg-[#d4af37]/10 px-1.5 py-0.2 rounded font-bold">
                                {p.tag}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Brand and category */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-[10px] text-[#d4af37] uppercase">{p.brand}</p>
                          <p className="text-[10px] text-stone-400">{p.category}</p>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-mono font-bold">
                        {p.price.toLocaleString('ru-RU')} UZS
                      </td>

                      {/* Delete Action button */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-500 transition-colors"
                          title="Mahsulotni o'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty stats placeholder */}
            {products.length === 0 && (
              <div className="text-center py-10 space-y-2">
                <AlertCircle className="w-8 h-8 text-stone-400 mx-auto opacity-30" />
                <h5 className="font-bold text-stone-400 text-xs">Mahsulotlar mavjud emas</h5>
                <p className="text-stone-500 text-[10px]">Chap tomondagi formadan foydalanib yangi mahsulot qo'shing</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
