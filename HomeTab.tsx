import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Star, Award, Heart, CheckCircle2 } from 'lucide-react';
import { Product } from '../types';

interface HomeTabProps {
  theme: 'light' | 'dark';
  onNavigateToCatalog: (category?: string) => void;
  topProducts: Product[];
  onAddToCart: (product: Product) => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  theme,
  onNavigateToCatalog,
  topProducts,
  onAddToCart,
}) => {
  const isDark = theme === 'dark';

  return (
    <div className="space-y-16 py-6 pb-20">
      
      {/* Hero Banner Section */}
      <section className="relative rounded-3xl overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-transparent z-10" />
        <img 
          src="https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=1600" 
          alt="Premium Korean Skincare Banner" 
          className="w-full h-[380px] sm:h-[480px] md:h-[540px] object-cover object-center animate-pulse-slow"
          referrerPolicy="no-referrer"
        />
        
        <div className="absolute inset-0 z-20 flex flex-col justify-center px-6 sm:px-12 md:px-16 max-w-2xl text-white space-y-4 sm:space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37]"
          >
            <Sparkles className="w-3.5 h-3.5" /> 100% Original Koreya Kosmetikasi
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none"
          >
            Sizning teringiz uchun <br />
            <span className="text-[#d4af37] italic">yagona parvarish</span> siri
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-stone-200 text-sm sm:text-base md:text-lg font-light max-w-lg leading-relaxed"
          >
            Premium brendlar va bevosita Seuldan keltirilgan, teringizni chuqur oziqlantiruvchi va tabiiy go'zalligingizni tiklovchi eng sara kosmetika vositalari.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-wrap gap-4 pt-2"
          >
            <button 
              id="hero-shop-now"
              onClick={() => onNavigateToCatalog()}
              className="px-6 py-3.5 rounded-full text-sm font-bold tracking-wider uppercase bg-[#d4af37] hover:bg-[#bfa032] text-stone-950 transition-all duration-300 flex items-center gap-2 shadow-lg shadow-[#d4af37]/20 hover:scale-105"
            >
              Katalogga o'tish
              <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              id="hero-bestsellers"
              onClick={() => onNavigateToCatalog('Zardoblar')}
              className="px-6 py-3.5 rounded-full text-sm font-bold tracking-wider uppercase bg-white/10 hover:bg-white/20 text-white border border-white/25 transition-all duration-300 backdrop-blur-sm"
            >
              Sara Zardoblar
            </button>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className={`grid grid-cols-1 sm:grid-cols-3 gap-6 p-8 rounded-2xl border ${
        isDark ? 'bg-[#181512] border-[#d4af37]/10 text-[#faf8f5]' : 'bg-white border-stone-200 text-stone-800'
      }`}>
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-[#d4af37]/10 text-[#d4af37]">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-base">Kafolatlangan Sifat</h4>
            <p className="text-xs text-stone-400 mt-1">Barcha mahsulotlarimiz Janubiy Koreyadan to'g'ridan-to'g'ri import qilinadi va 100% original hisoblanadi.</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-[#d4af37]/10 text-[#d4af37]">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-base">Ekspert Tavsiyasi</h4>
            <p className="text-xs text-stone-400 mt-1">Har bir teriga mos keluvchi professional parvarish tizimini bepul maslahat yordamida tanlab beramiz.</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-[#d4af37]/10 text-[#d4af37]">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-base">Mijozlar Sevgisi</h4>
            <p className="text-xs text-stone-400 mt-1">Minglab mamnun mijozlarimiz va ularning go'zal, sog'lom teri sirlari bizning eng katta yutug'imizdir.</p>
          </div>
        </div>
      </section>

      {/* Categories Bento Grid */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-widest text-[#d4af37] uppercase">Yo'nalishlar</p>
            <h3 className={`font-serif text-2xl sm:text-3xl font-bold mt-1 ${isDark ? 'text-white' : 'text-stone-900'}`}>
              Kategoriyalar Bo'yicha Saralash
            </h3>
          </div>
          <button 
            onClick={() => onNavigateToCatalog()}
            className="text-sm font-semibold text-[#d4af37] hover:text-[#bfa032] flex items-center gap-1.5 transition-colors"
          >
            Barcha kategoriyalarni ko'rish <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Bento Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Bento item 1 */}
          <div 
            onClick={() => onNavigateToCatalog('Yuz parvarishi')}
            className="group relative md:col-span-7 h-72 rounded-2xl overflow-hidden cursor-pointer shadow-md border border-stone-200/50 dark:border-none"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 transition-opacity duration-300 group-hover:opacity-90" />
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBcR32bw54OfkiP5oI7KDeyitEWIwKpX2c1nmab9wOhlRNETWctEmQqfJpkFgag234ueaMs-u6FanZgZ6KwaTx_p8Yxpzx_NnEcuN_CM3zYTu4hx1A31ONDe9IMiMaSfXKDJcTsn2rYZIIliu2BwoZE0EkBbs8Xt01iN2_rvfroq5a7WhxXYIIt1Z0Pd3_D8xJ99zpeYqqlNBDOiAp2yY2MgXdpAN_exZ2Zw5JJXX_h05iVCDS0AXkyxdMl6lwBsRALmWz1EZnUqHI" 
              alt="Yuz Parvarishi" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-6 left-6 z-20 text-white">
              <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold bg-[#d4af37]/10 px-2.5 py-1 rounded-md">YUZ PARVARISHI</span>
              <h4 className="font-serif text-xl sm:text-2xl font-bold mt-2">Premium Krem va Gellar</h4>
              <p className="text-xs text-stone-200 font-light mt-1 opacity-90">Teringizni intensiv tiklovchi va quyoshdan saqlovchi formulalar</p>
            </div>
          </div>

          {/* Bento item 2 */}
          <div 
            onClick={() => onNavigateToCatalog('Makiyaj')}
            className="group relative md:col-span-5 h-72 rounded-2xl overflow-hidden cursor-pointer shadow-md border border-stone-200/50 dark:border-none"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 transition-opacity duration-300 group-hover:opacity-90" />
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBscWdi3_5PDT_oofXHLdh9RDvXCIbb7wPwEfmU_93ucJgEv1pVBKMqweoABO941B2PG-5aCM1tbmS4QepQz63bAEE4l8RCTwbsk2Zsn-fedAW6q3JgvpO9RaXFEQ2T0_EpXeujJ9unioPtCaHmCrsOVQo2Em8rO3Bhvr3mNLXQzkysJZ6-GHQIEk4TwYdznuKRx-jpS8LvYNicT5t1xGnCKmLRrAdQqM_0PpzV30ApWC5fGm2lLnVh5oBAu5VlbYXzEnzQGvQ_5zs" 
              alt="Makiyaj" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-6 left-6 z-20 text-white">
              <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold bg-[#d4af37]/10 px-2.5 py-1 rounded-md">MAKIYAJ</span>
              <h4 className="font-serif text-xl sm:text-2xl font-bold mt-2">Dekorativ Kosmetika</h4>
              <p className="text-xs text-stone-200 font-light mt-1 opacity-90">Tabiiy go'zallikni namoyish qiluvchi koreys uslubi</p>
            </div>
          </div>

          {/* Bento item 3 */}
          <div 
            onClick={() => onNavigateToCatalog('Sochlar')}
            className="group relative md:col-span-5 h-72 rounded-2xl overflow-hidden cursor-pointer shadow-md border border-stone-200/50 dark:border-none"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 transition-opacity duration-300 group-hover:opacity-90" />
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuARIXeHz3x0pcLJiPpb30ScJ_Cg3opuRfCReWlFwaTfywu0gjsFDR2nQ7GTHp3CaOvmBQ3PIhlhagSsd3oqYqf91_KclVJ6Oc6qaiZ01Y_ow3yvqFhT3pxVYehIlcJBgOb2HyJn_ZoUkVAZqS6bZS4nolGDLkkqq0-bNvyGhD50nIIAyfudKgTLcEZ_-0fzBRgS7vl5WUGzx4BIXKt38OSw7ZLBmD-q-FVGuZBq40Ynx08NEVkuf0magU_zliIRruxcdWh18z07nfI" 
              alt="Soch Parvarishi" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-6 left-6 z-20 text-white">
              <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold bg-[#d4af37]/10 px-2.5 py-1 rounded-md">SOCHLAR</span>
              <h4 className="font-serif text-xl sm:text-2xl font-bold mt-2">Ipakdek Mayin Sochlar</h4>
              <p className="text-xs text-stone-200 font-light mt-1 opacity-90">Kollagen va keratin bilan to'yingan eliksirlar</p>
            </div>
          </div>

          {/* Bento item 4 */}
          <div 
            onClick={() => onNavigateToCatalog('Aksessuarlar')}
            className="group relative md:col-span-7 h-72 rounded-2xl overflow-hidden cursor-pointer shadow-md border border-stone-200/50 dark:border-none"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 transition-opacity duration-300 group-hover:opacity-90" />
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHGtRJ0GD89pW9q39pNwvdNkjjIGu2pcGptI7uPQbsCThjnxiQ-H2OUrxiSGIfhL65eyTOOoOJHxsxp9PCxC1Vn7ESKcV8zb0XjXkw5h0vRPW_34fZy6xlC3WxwRBKe5KITGBzJfJuv4_2eJJQjcbKS2brXdx3VXwwWJ9HQjJhyaIHQIQNsJNGw5aG8wqcGFHmviC51Wjyhr-C5oSmTnPJXYWtMGNz8jsttOmQRWD0imcW0QhJluOHTuWqOJgByH_3WQY_f0LtJOA" 
              alt="Aksessuarlar" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-6 left-6 z-20 text-white">
              <span className="text-xs uppercase tracking-widest text-[#d4af37] font-semibold bg-[#d4af37]/10 px-2.5 py-1 rounded-md">AKSESSUARLAR</span>
              <h4 className="font-serif text-xl sm:text-2xl font-bold mt-2">Guasha va Massajorlar</h4>
              <p className="text-xs text-stone-200 font-light mt-1 opacity-90">Tabiiy nefrit va kvars toshidan yuz konturi parvarishi</p>
            </div>
          </div>
        </div>
      </section>

      {/* Elite / Best Sellers List */}
      <section className="space-y-6">
        <div className="text-center max-w-lg mx-auto space-y-2">
          <span className="text-xs font-bold tracking-widest text-[#d4af37] uppercase">Mashhur Mahsulotlar</span>
          <h3 className={`font-serif text-3xl font-bold ${isDark ? 'text-white' : 'text-stone-900'}`}>
            Mijozlarimiz Tanlovi
          </h3>
          <p className="text-stone-400 text-sm font-light">
            Har kuni yuzlab go'zallik ishqibozlari tomonidan xarid qilinadigan va eng yuqori baholarga ega bo'lgan premium kosmetikalarimiz.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {topProducts.map((product) => (
            <div 
              key={product.id}
              className={`group flex flex-col rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-xl ${
                isDark 
                  ? 'bg-[#181512] border-[#d4af37]/10 hover:border-[#d4af37]/30 text-white' 
                  : 'bg-white border-stone-200 hover:border-stone-400 text-stone-800'
              }`}
            >
              <div className="relative aspect-square overflow-hidden bg-stone-100">
                {product.tag && (
                  <span className="absolute top-4 left-4 z-10 bg-[#d4af37] text-stone-950 text-[10px] font-extrabold tracking-widest uppercase py-1 px-2.5 rounded-md">
                    {product.tag}
                  </span>
                )}
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold tracking-widest text-[#d4af37] uppercase">
                    <span>{product.brand}</span>
                    <span className="opacity-70">{product.category}</span>
                  </div>
                  <h4 className="font-serif font-bold text-lg leading-snug group-hover:text-[#d4af37] transition-colors line-clamp-1">
                    {product.name}
                  </h4>
                  <p className={`text-xs line-clamp-2 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                    {product.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="font-serif font-extrabold text-base sm:text-lg text-[#d4af37]">
                    {product.price.toLocaleString('ru-RU')} so'm
                  </span>
                  <button 
                    onClick={() => onAddToCart(product)}
                    className="py-2 px-4.5 rounded-full text-xs font-bold uppercase bg-[#d4af37] hover:bg-[#bfa032] text-stone-950 transition-colors"
                  >
                    Savatga
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Founder Profile Message / Reviews Section */}
      <section className={`rounded-3xl p-8 sm:p-12 border overflow-hidden relative ${
        isDark 
          ? 'bg-gradient-to-br from-[#1c1914] to-[#12100e] border-[#d4af37]/15 text-[#faf8f5]' 
          : 'bg-stone-100/70 border-stone-200 text-stone-800'
      }`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37]/5 rounded-full blur-3xl" />
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center relative z-10">
          <div className="md:col-span-4 flex justify-center">
            <div className={`relative rounded-2xl overflow-hidden border p-2 w-56 sm:w-64 aspect-[3/4] ${
              isDark ? 'border-[#d4af37]/30 bg-[#181512]' : 'border-stone-300 bg-white'
            }`}>
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpEIlUDMafHz0IQIRdHQW-MBzvlzOq0J4bvlP05CbjVPahB3pjyUcPqXdj_BiBkt-NS4zHe6aULwy5KBiwOW0-1ZUS95STY5I4mSNQicMCEGBvsxI5DE-Luv9LZLRcUoc1L4gNedoSL-2UpDBF_Goa7Bw42FBejiwrHQcXxtyvc03W8pl_OweKokWnyZr6mS036C07_UHK4omEsBG_N7BD06M5OBe5u2QQBulc4cFRvgG3ZehiuDe9FTsOm2LV7ok4ws0s83wQpPU" 
                alt="Dilnoza - Koreya Kosmetikasi Eksperti" 
                className="w-full h-full object-cover rounded-xl"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-stone-900/80 backdrop-blur-md py-2 px-3 rounded-lg border border-white/10 text-center">
                <h5 className="text-white text-xs font-bold uppercase tracking-wider">Dilnoza</h5>
                <p className="text-[#d4af37] text-[9px] uppercase tracking-[0.2em] mt-0.5">Asoschi & Ekspert</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-8 space-y-6">
            <div className="inline-flex p-2 bg-[#d4af37]/10 rounded-xl text-[#d4af37]">
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
            </div>

            <blockquote className="space-y-4">
              <p className="font-serif text-lg sm:text-xl md:text-2xl font-semibold italic leading-relaxed">
                "Assalomu alaykum va xush kelibsiz! Men Dilnoza — Koreya kosmetikasi bo'yicha professional maslahatgichingiz. Har bir mahsulotni mijozlarimizga taqdim etishdan oldin uning tarkibini, kelib chiqish sertifikatlarini va samaradorligini shaxsan o'zim o'rganib chiqaman. Bizning maqsadimiz — shunchaki kosmetika sotish emas, balki sizga chinakam sog'lom teri go'zalligini hadya etishdir."
              </p>
              <footer className="flex items-center gap-3">
                <div className="w-8 h-px bg-[#d4af37]" />
                <span className="font-sans font-bold text-sm tracking-wider uppercase text-[#d4af37]">DILNOZA KOREYA - GO'ZALLIK SADOSI</span>
              </footer>
            </blockquote>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-stone-200/40 dark:border-[#d4af37]/15">
              <div>
                <h6 className="font-serif text-2xl font-bold text-[#d4af37]">5,000+</h6>
                <p className="text-[10px] text-stone-400 uppercase tracking-wider mt-1">Mamnun Mijozlar</p>
              </div>
              <div>
                <h6 className="font-serif text-2xl font-bold text-[#d4af37]">100%</h6>
                <p className="text-[10px] text-stone-400 uppercase tracking-wider mt-1">Asl Kafolatlangan</p>
              </div>
              <div>
                <h6 className="font-serif text-2xl font-bold text-[#d4af37]">24/7</h6>
                <p className="text-[10px] text-stone-400 uppercase tracking-wider mt-1">Telegram Yordam</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
