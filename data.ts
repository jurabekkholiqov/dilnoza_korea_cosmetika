import { Product, BotSettings, LogEntry } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Hyaluron Collagen Serum',
    price: 185000,
    category: 'Zardoblar',
    brand: 'MEDI-PEEL',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600',
    description: 'Teringizni chuqur namlovchi va elastikligini oshiruvchi premium kollagen zardobi. Ajinlarga qarshi kurashadi va yorqinlik beradi.',
    isTop: true,
    tag: 'TOP MAHSULOT'
  },
  {
    id: 'p2',
    name: 'Low pH Good Morning Cleanser',
    price: 120000,
    category: 'Tozalash',
    brand: 'COSRX',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=600',
    description: 'Teringizning tabiiy pH muvozanatini saqlaydigan, yumshoq va samarali kundalik tozalovchi gel. Barcha teri turlariga mos keladi.'
  },
  {
    id: 'p3',
    name: 'Water Sleeping Mask EX',
    price: 245000,
    category: 'Niqoblar',
    brand: 'LANEIGE',
    image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=600',
    description: 'Tunda teringizni intensiv namlantiruvchi va tiklovchi tungi niqob. Ertalab yangi, tetik va mayin teri bilan uyg\'oning.',
    tag: 'CHEGIRMA'
  },
  {
    id: 'p4',
    name: 'Green Tea Real Squeeze Mask',
    price: 150000,
    category: 'Niqoblar',
    brand: 'INNISFREE',
    image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=600',
    description: 'Yashil choy ekstrakti bilan boyitilgan, terini tinchlantiruvchi va chuqur namlantiruvchi matoli niqob.',
    isNew: true
  },
  {
    id: 'p5',
    name: 'Concentrated Ginseng Eye Cream',
    price: 720000,
    category: 'Yuz parvarishi',
    brand: 'SULWHASOO',
    image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&q=80&w=600',
    description: 'Qizil jenshen ekstrakti bilan boyitilgan, ko\'z atrofidagi terini yoshartiruvchi va ajinlarni silliqlovchi premium krem.'
  },
  {
    id: 'p6',
    name: 'Relief Sun : Rice + Probiotics',
    price: 165000,
    category: 'Yuz parvarishi',
    brand: 'BEAUTY OF JOSEON',
    image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&q=80&w=600',
    description: 'Guruch ekstrakti va probiyotiklar bilan boyitilgan, quyoshdan himoyalovchi engil va namlantiruvchi krem (SPF50+ PA++++).'
  },
  {
    id: 'p7',
    name: 'Moisture Surge Serum',
    price: 320000,
    category: 'Zardoblar',
    brand: 'MEDI-PEEL',
    image: 'https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&q=80&w=600',
    description: 'Terining chuqur qatlamlarigacha namlik yetkazib beruvchi intensiv gidrogel zardob.',
    isNew: true,
    tag: 'YUZ PARVARISHI'
  },
  {
    id: 'p8',
    name: 'Night Repair Balm',
    price: 450000,
    category: 'Yuz parvarishi',
    brand: 'SULWHASOO',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=600',
    description: 'Tungi tiklanish jarayonini tezlashtiruvchi va terini oziqlantiruvchi premium tungi balzam.',
    tag: 'TUNGI'
  },
  {
    id: 'p9',
    name: 'Glow Essence Oil',
    price: 185000,
    category: 'Zardoblar',
    brand: 'COSRX',
    image: 'https://images.unsplash.com/photo-1601049676099-e7ed07d825b0?auto=format&fit=crop&q=80&w=600',
    description: 'Tabiiy efir moylaridan tashkil topgan, teriga tabiiy ipakdek jilo va sog\'lom porlash beruvchi essensiya moyi.',
    tag: 'YUZ PARVARISHI'
  },
  {
    id: 'p10',
    name: 'Vitamin C Mask Set',
    price: 95000,
    category: 'Niqoblar',
    brand: 'INNISFREE',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=600',
    description: 'C vitamini bilan boyitilgan, terini oqartiruvchi va dog\'larni kamaytiruvchi niqoblar to\'plami.',
    tag: 'MASKALAR'
  }
];

export const INITIAL_BOT_SETTINGS: BotSettings = {
  botToken: '6482930415:AAH_k89Lx_n2mR-p8QWz_Example',
  adminTelegramId: '1029384756',
  webhookUrl: 'https://api.dilnozakoreya.uz/bot/webhook',
  autoWelcome: true,
  productSearch: true,
  notifyNewOrder: true,
  notifyNewUser: false,
  notifyError: true
};

export const INITIAL_LOGS: LogEntry[] = [
  {
    id: 'l1',
    time: 'Bugun, 15:45',
    message: 'Yangi foydalanuvchi (@anora_beauty) qo\'shildi',
    type: 'info'
  },
  {
    id: 'l2',
    time: 'Bugun, 14:12',
    message: 'Admin tokeni muvaffaqiyatli yangilandi',
    type: 'success'
  },
  {
    id: 'l3',
    time: 'Bugun, 12:00',
    message: '#29402 raqamli buyurtma bot orqali qabul qilindi',
    type: 'success'
  },
  {
    id: 'l4',
    time: 'Kecha, 23:45',
    message: 'Webhook ulanishida vaqtinchalik xatolik (502)',
    type: 'error'
  },
  {
    id: 'l5',
    time: 'Kecha, 22:30',
    message: 'Yangi foydalanuvchi (@shoxrux_m) qo\'shildi',
    type: 'info'
  }
];

export const CATEGORIES = [
  'Yuz parvarishi',
  'Zardoblar',
  'Niqoblar',
  'Tozalash',
  'Sochlar',
  'Makiyaj',
  'Aksessuarlar'
];

export const BRANDS = [
  'COSRX',
  'MEDI-PEEL',
  'LANEIGE',
  'SULWHASOO',
  'INNISFREE',
  'BEAUTY OF JOSEON'
];
