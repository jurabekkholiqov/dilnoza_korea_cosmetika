import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Key, User, Globe, Save, HelpCircle, Check, Copy, RefreshCw, Eye, EyeOff, Activity, Bell, HelpCircle as HelpIcon, Trash2, Send } from 'lucide-react';
import { BotSettings, LogEntry } from '../types';

interface BotSettingsTabProps {
  theme: 'light' | 'dark';
  botSettings: BotSettings;
  setBotSettings: React.Dispatch<React.SetStateAction<BotSettings>>;
  logs: LogEntry[];
  setLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>;
  onAddLog: (message: string, type: 'success' | 'info' | 'error') => void;
  botUsersCount: number;
  messagesSentToday: number;
  botOrdersCount: number;
  onChangePassword?: (newPass: string) => void;
}

export const BotSettingsTab: React.FC<BotSettingsTabProps> = ({
  theme,
  botSettings,
  setBotSettings,
  logs,
  setLogs,
  onAddLog,
  botUsersCount,
  messagesSentToday,
  botOrdersCount,
  onChangePassword,
}) => {
  const isDark = theme === 'dark';

  // State
  const [botToken, setBotToken] = useState(botSettings.botToken);
  const [adminId, setAdminId] = useState(botSettings.adminTelegramId);
  const [adminPasswordVal, setAdminPasswordVal] = useState(botSettings.adminPassword || 'dilnoza2026');
  const [adminUsernameVal, setAdminUsernameVal] = useState(botSettings.adminUsername || '');
  const [showToken, setShowToken] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Toggle Switches Handler with API integration
  const handleToggle = async (key: keyof BotSettings) => {
    const updatedValue = !botSettings[key];
    const featureName = getFeatureName(key);
    
    // Optimistically update frontend state
    setBotSettings((prev) => ({
      ...prev,
      [key]: updatedValue
    }));

    try {
      const response = await fetch('/api/bot-settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminPassword') || ''}`
        },
        body: JSON.stringify({ [key]: updatedValue })
      });
      if (response.ok) {
        onAddLog(`Bot sozlamasi o'zgartirildi: "${featureName}" -> [${updatedValue ? 'YOQILDI' : 'O\'CHIRILDI'}]`, 'info');
      } else {
        // Rollback on failure
        setBotSettings((prev) => ({ ...prev, [key]: !updatedValue }));
        onAddLog('Sozlamani yangilashda xatolik yuz berdi', 'error');
      }
    } catch (err) {
      console.error(err);
      setBotSettings((prev) => ({ ...prev, [key]: !updatedValue }));
      onAddLog('Aloqa xatoligi tufayli sozlama saqlanmadi', 'error');
    }
  };

  const getFeatureName = (key: keyof BotSettings): string => {
    switch (key) {
      case 'autoWelcome': return 'Mijozlarni kutib olish xabari';
      case 'productSearch': return 'Bot orqali mahsulot qidirish';
      case 'notifyNewOrder': return 'Yangi buyurtma bildirishnomalari';
      case 'notifyNewUser': return 'Yangi foydalanuvchilar bildirishnomalari';
      case 'notifyError': return 'Xatoliklar bildirishnomalari';
      default: return 'Bot funksiyasi';
    }
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(botSettings.webhookUrl || `https://api.telegram.org/bot${botSettings.botToken}/getUpdates`);
    setCopied(true);
    onAddLog('Webhook / Polling URL muvaffaqiyatli xotiraga nusxalandi', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch('/api/bot-settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminPassword') || ''}`
        },
        body: JSON.stringify({
          botToken,
          adminTelegramId: adminId,
          adminPassword: adminPasswordVal,
          adminUsername: adminUsernameVal
        })
      });
      if (response.ok) {
        const updated = await response.json();
        setBotSettings(updated);
        setSaveSuccess(true);
        if (onChangePassword && adminPasswordVal) {
          onChangePassword(adminPasswordVal);
        }
        onAddLog('Telegram Bot ulanish sozlamalari muvaffaqiyatli saqlandi va yangilandi', 'success');
      } else {
        onAddLog('Sozlamalarni saqlashda xatolik', 'error');
      }
    } catch (err) {
      console.error(err);
      onAddLog('Tarmoq xatoligi sababli sozlamalar saqlanmadi', 'error');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleClearLogs = async () => {
    try {
      const response = await fetch('/api/logs', { 
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('adminPassword') || ''}`
        }
      });
      if (response.ok) {
        setLogs([]);
        onAddLog('Faollik jurnali (Logs) muvaffaqiyatli tozalandi', 'info');
      }
    } catch (err) {
      console.error(err);
      onAddLog('Loglarni tozalashda xatolik yuz berdi', 'error');
    }
  };

  const handleSimulateRandomLog = () => {
    const simulationPool: { msg: string; type: 'success' | 'info' | 'error' }[] = [
      { msg: 'Foydalanuvchi @nodira_skincare mahsulot qidirish botini ishga tushirdi', type: 'info' },
      { msg: 'Yuborilgan xabar: #34091 raqamli buyurtma holati "Kuryerda" deb o\'zgartirildi', type: 'success' },
      { msg: 'Telegram API so\'rovi xatosi (400): Chat not found', type: 'error' },
      { msg: 'Foydalanuvchi @kamola_88 botga obuna bo\'ldi', type: 'info' },
      { msg: 'Webhook javob vaqti: 125ms (Sog\'lom holatda)', type: 'success' }
    ];
    const item = simulationPool[Math.floor(Math.random() * simulationPool.length)];
    onAddLog(item.msg, item.type);
  };

  return (
    <div className="py-6 pb-20 space-y-10">
      
      {/* Bot Key statistics rows */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Card 1 */}
        <div className={`p-6 rounded-2xl border ${
          isDark ? 'bg-[#181512] border-[#d4af37]/15 text-white' : 'bg-white border-stone-200 text-stone-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Obunachilar</span>
            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500/15 text-emerald-500 font-mono">AKTIV</span>
          </div>
          <h3 className="font-serif text-3xl font-extrabold text-[#d4af37] mt-3">
            {botUsersCount.toLocaleString('ru-RU')} ta
          </h3>
          <p className="text-[10px] text-stone-400 font-light mt-1">Bot orqali muloqot qilgan jami profillar</p>
        </div>

        {/* Card 2 */}
        <div className={`p-6 rounded-2xl border ${
          isDark ? 'bg-[#181512] border-[#d4af37]/15 text-white' : 'bg-white border-stone-200 text-stone-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Bugun Yuborilgan Xabarlar</span>
            <span className="text-[9px] font-mono text-stone-400 flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin" /> Bugun
            </span>
          </div>
          <h3 className="font-serif text-3xl font-extrabold text-[#d4af37] mt-3">
            {messagesSentToday.toLocaleString('ru-RU')} ta
          </h3>
          <p className="text-[10px] text-stone-400 font-light mt-1">Avtomatik va admin bildirishnomalari soni</p>
        </div>

        {/* Card 3 */}
        <div className={`p-6 rounded-2xl border ${
          isDark ? 'bg-[#181512] border-[#d4af37]/15 text-white' : 'bg-white border-stone-200 text-stone-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Buyurtmalar</span>
            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-[#d4af37]/15 text-[#d4af37] font-mono">DILNOZA BOT</span>
          </div>
          <h3 className="font-serif text-3xl font-extrabold text-[#d4af37] mt-3">
            {botOrdersCount.toLocaleString('ru-RU')} ta
          </h3>
          <p className="text-[10px] text-stone-400 font-light mt-1">Bot orqali kelgan jami savdo so'rovlari</p>
        </div>

      </section>

      {/* Main Bot Settings Forms Split Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Credentials Form & Settings toggles - Left */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Credentials Container */}
          <div className={`p-6 sm:p-8 rounded-2xl border ${
            isDark ? 'bg-[#181512] border-[#d4af37]/15 text-[#faf8f5]' : 'bg-white border-stone-200 text-stone-800'
          }`}>
            <div className="flex items-center gap-2 mb-6">
              <Bot className="w-5 h-5 text-[#d4af37]" />
              <h3 className="font-serif text-xl font-bold">Bot Integratsiya Sozlamalari</h3>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              
              <AnimatePresence>
                {saveSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Ulanish ma'lumotlari muvaffaqiyatli yangilandi!</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bot Token input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37] flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-[#d4af37]/70" /> HTTP API Bot Token *
                </label>
                <div className="relative">
                  <input
                    id="bot-token-input"
                    type={showToken ? 'text' : 'password'}
                    required
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border text-xs font-mono transition-all outline-none ${
                      isDark ? 'bg-[#1e1b15] border-stone-800 focus:border-[#d4af37] text-white' : 'bg-stone-50 border-stone-200 focus:border-stone-500 text-stone-900'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[9px] text-stone-400">Telegram @BotFather orqali olingan maxfiy API kalitingiz</p>
              </div>

              {/* Primary Admin Telegram ID */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37] flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-[#d4af37]/70" /> Asosiy Admin Telegram ID *
                </label>
                <input
                  id="admin-telegram-id-input"
                  type="text"
                  required
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono transition-all outline-none ${
                    isDark ? 'bg-[#1e1b15] border-stone-800 focus:border-[#d4af37] text-white' : 'bg-stone-50 border-stone-200 focus:border-stone-500 text-stone-900'
                  }`}
                />
                <p className="text-[9px] text-stone-400">Buyurtmalar va xatoliklar haqida tezkor xabarlar ushbu ID egasiga yuboriladi</p>
              </div>

              {/* Admin Telegram Username */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37] flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-[#d4af37]/70" /> Admin Telegram Username (@sizning_usernamingiz)
                </label>
                <input
                  id="admin-telegram-username-input"
                  type="text"
                  value={adminUsernameVal}
                  onChange={(e) => setAdminUsernameVal(e.target.value)}
                  placeholder="Masalan: dilnoza_admin"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono transition-all outline-none ${
                    isDark ? 'bg-[#1e1b15] border-[#d4af37]/20 focus:border-[#d4af37] text-white' : 'bg-stone-50 border-stone-200 focus:border-stone-500 text-stone-900'
                  }`}
                />
                <p className="text-[9px] text-stone-400">Kiritilsa, mijozlar t.me/username orqali lichkangizga osongina o'tishadi</p>
              </div>

              {/* Admin Password input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37] flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-[#d4af37]/70" /> Admin Panel Paroli *
                </label>
                <div className="relative">
                  <input
                    id="admin-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={adminPasswordVal}
                    onChange={(e) => setAdminPasswordVal(e.target.value)}
                    className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl border text-xs font-mono transition-all outline-none ${
                      isDark ? 'bg-[#1e1b15] border-stone-800 focus:border-[#d4af37] text-white' : 'bg-stone-50 border-stone-200 focus:border-stone-500 text-stone-900'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[9px] text-stone-400">Admin boshqaruv paneliga kirish uchun yangi maxfiy parol kiriting</p>
              </div>

              {/* Webhook URL read-only with copy */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#d4af37] flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-[#d4af37]/70" /> Webhook Bog'lanish URL (Read-only)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={botSettings.webhookUrl}
                    className={`w-full pl-3.5 pr-16 py-2.5 rounded-xl border text-xs font-mono text-stone-400 outline-none select-all ${
                      isDark ? 'bg-[#1e1b15] border-stone-800' : 'bg-stone-50 border-stone-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleCopyWebhook}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded bg-[#d4af37] hover:bg-[#bfa032] text-stone-950 font-bold text-[9px] flex items-center gap-1 uppercase transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Nusxa'}
                  </button>
                </div>
              </div>

              <button
                id="bot-save-btn"
                type="submit"
                disabled={isSaving}
                className={`w-full py-3 rounded-xl text-xs font-bold uppercase transition-colors flex items-center justify-center gap-1.5 ${
                  isSaving ? 'bg-stone-800 text-stone-500' : 'bg-[#d4af37] hover:bg-[#bfa032] text-stone-950 shadow-md'
                }`}
              >
                {isSaving ? 'Saqlanmoqda...' : 'Sozlamalarni Saqlash'}
              </button>

            </form>
          </div>

          {/* Behavior Switch toggles */}
          <div className={`p-6 sm:p-8 rounded-2xl border space-y-5 ${
            isDark ? 'bg-[#181512] border-[#d4af37]/15 text-[#faf8f5]' : 'bg-white border-stone-200 text-stone-800'
          }`}>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#d4af37]" />
              <h3 className="font-serif text-lg font-bold">Bot Xatti-harakatlari & Bildirishnomalar</h3>
            </div>

            <div className="h-px bg-stone-200/10" />

            {/* Toggle 1 */}
            <div className="flex items-center justify-between gap-4 py-1.5">
              <div className="space-y-1">
                <h5 className="text-xs font-bold">Avtomatik Kutib Olish</h5>
                <p className="text-[10px] text-stone-400">Yangi mijozlar botga kirganda "Assalomu Alaykum! Dilnoza Koreya guruhiga xush kelibsiz" xabarini yuborish</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('autoWelcome')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  botSettings.autoWelcome ? 'bg-[#d4af37]' : 'bg-stone-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-stone-950 shadow ring-0 transition duration-200 ease-in-out ${
                    botSettings.autoWelcome ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2 */}
            <div className="flex items-center justify-between gap-4 py-1.5 border-t border-stone-200/10">
              <div className="space-y-1">
                <h5 className="text-xs font-bold">Kalit so'z orqali Qidiruv</h5>
                <p className="text-[10px] text-stone-400">Mijozlar botga mahsulot nomini yozganda avtomatik katalogdan izlash va kartochkasini chiqarish</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('productSearch')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  botSettings.productSearch ? 'bg-[#d4af37]' : 'bg-stone-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-stone-950 shadow ring-0 transition duration-200 ease-in-out ${
                    botSettings.productSearch ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 3 */}
            <div className="flex items-center justify-between gap-4 py-1.5 border-t border-stone-200/10">
              <div className="space-y-1">
                <h5 className="text-xs font-bold">Yangi buyurtma bildirishnomasi</h5>
                <p className="text-[10px] text-stone-400">Mijoz sayt orqali buyurtma berishi bilanoq, admin guruhiga buyurtma tafsilotlarini jo'natish</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('notifyNewOrder')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  botSettings.notifyNewOrder ? 'bg-[#d4af37]' : 'bg-stone-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-stone-950 shadow ring-0 transition duration-200 ease-in-out ${
                    botSettings.notifyNewOrder ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 4 */}
            <div className="flex items-center justify-between gap-4 py-1.5 border-t border-stone-200/10">
              <div className="space-y-1">
                <h5 className="text-xs font-bold">Mijozlar ulanishi haqida xabar</h5>
                <p className="text-[10px] text-stone-400">Botga har qanday yangi yuz parvarishi qiziquvchisi qo'shilganda bildirishnoma kelishi</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('notifyNewUser')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  botSettings.notifyNewUser ? 'bg-[#d4af37]' : 'bg-stone-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-stone-950 shadow ring-0 transition duration-200 ease-in-out ${
                    botSettings.notifyNewUser ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 5 */}
            <div className="flex items-center justify-between gap-4 py-1.5 border-t border-stone-200/10">
              <div className="space-y-1">
                <h5 className="text-xs font-bold">Tizimli xatoliklarni xabar qilish</h5>
                <p className="text-[10px] text-stone-400">Bot ulanishi, API limitlari yoki Webhook uzilishlarida admin guruhiga signal yuborish</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('notifyError')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  botSettings.notifyError ? 'bg-[#d4af37]' : 'bg-stone-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-stone-950 shadow ring-0 transition duration-200 ease-in-out ${
                    botSettings.notifyError ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

          </div>

        </div>

        {/* Dynamic Activity Logs Widget - Right */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#d4af37]" />
              <h3 className={`font-serif text-lg font-bold ${isDark ? 'text-white' : 'text-stone-800'}`}>
                Bot Faollik Jurnali (Logs)
              </h3>
            </div>
            
            {/* Quick action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSimulateRandomLog}
                className={`p-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all flex items-center gap-1 ${
                  isDark 
                    ? 'border-stone-800 hover:border-[#d4af37]/35 text-stone-400 hover:text-[#d4af37] bg-[#1a1714]' 
                    : 'border-stone-200 hover:border-stone-400 text-stone-600 hover:text-stone-900 bg-white'
                }`}
                title="Tizimli faoliyatni simulyatsiya qilish"
              >
                <Send className="w-3 h-3" /> Simulyatsiya
              </button>
              <button
                onClick={handleClearLogs}
                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-400 transition-colors"
                title="Loglarni tozalash"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Timeline Container */}
          <div className={`rounded-2xl border p-5 max-h-[580px] overflow-y-auto space-y-4 font-mono text-xs ${
            isDark ? 'bg-[#181512] border-[#d4af37]/15' : 'bg-white border-stone-200'
          }`}>
            <AnimatePresence initial={false}>
              {logs.map((log) => {
                const borderClass = 
                  log.type === 'success' ? 'border-l-4 border-l-emerald-500 bg-emerald-500/5' :
                  log.type === 'error' ? 'border-l-4 border-l-red-500 bg-red-500/5' :
                  'border-l-4 border-l-[#d4af37] bg-[#d4af37]/5';
                
                const badgeClass =
                  log.type === 'success' ? 'text-emerald-400 bg-emerald-500/15' :
                  log.type === 'error' ? 'text-red-400 bg-red-500/15' :
                  'text-[#d4af37] bg-[#d4af37]/15';

                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10, y: -5 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`p-3 rounded-lg border border-stone-800/20 flex flex-col gap-1.5 ${borderClass}`}
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className={`px-1.5 py-0.2 rounded font-extrabold text-[9px] uppercase tracking-wider ${badgeClass}`}>
                        {log.type}
                      </span>
                      <span className="text-stone-400 font-light">{log.time}</span>
                    </div>
                    <p className={`text-[11px] leading-relaxed ${isDark ? 'text-stone-200' : 'text-stone-700'}`}>
                      {log.message}
                    </p>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {logs.length === 0 && (
              <div className="text-center py-16 space-y-2 text-stone-500">
                <Activity className="w-8 h-8 text-stone-400 mx-auto opacity-30 animate-pulse" />
                <p>Hozircha faollik mavjud emas</p>
                <p className="text-[10px]">Tizimda harakat qilishingiz bilan barcha jurnallar shu yerda aks etadi</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
