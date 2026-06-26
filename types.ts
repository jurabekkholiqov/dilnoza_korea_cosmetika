export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  brand: string;
  image: string;
  description: string;
  isNew?: boolean;
  isTop?: boolean;
  tag?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface BotSettings {
  botToken: string;
  adminTelegramId: string;
  webhookUrl: string;
  autoWelcome: boolean;
  productSearch: boolean;
  notifyNewOrder: boolean;
  notifyNewUser: boolean;
  notifyError: boolean;
  botUsername?: string;
  adminPassword?: string;
  adminUsername?: string;
}

export interface LogEntry {
  id: string;
  time: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

export type ActiveTab = 'home' | 'catalog' | 'admin' | 'bot';
