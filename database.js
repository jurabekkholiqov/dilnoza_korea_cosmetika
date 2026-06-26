const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db.json');

class Database {
  constructor() {
    this.init();
  }

  init() {
    if (!fs.existsSync(DB_PATH)) {
      const defaultData = {
        products: [
          {
            id: 1,
            title: "Zenith VPN Premium",
            description: "Dunyoning istalgan nuqtasidan xavfsiz va cheksiz tezlikda internetga ulanish imkoniyati. Shaxsiy ma'lumotlar to'liq shifrlanadi va hech qanday loglar saqlanmaydi.",
            usage: "Geografik cheklovlarni aylanib o'tish, jamoat Wi-Fi tarmoqlarida ma'lumotlarni himoya qilish va internet tezligini optimallashtirish uchun ishlatiladi.",
            price: "120,000 UZS / oy",
            imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80",
            views: 0
          },
          {
            id: 2,
            title: "Aether AI Writer Pro",
            description: "Sun'iy intellektga asoslangan ilg'or matn generatori. SEO-maqolalar, ijtimoiy tarmoqlar uchun postlar va marketing matnlarini soniyalar ichida yozib beradi.",
            usage: "Kopirayterlar, marketologlar va blogerlar uchun kontent yaratish jarayonini 10 barobargacha tezlashtirish uchun foydalaniladi.",
            price: "250,000 UZS / oy",
            imageUrl: "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=600&q=80",
            views: 0
          },
          {
            id: 3,
            title: "Quantum Cloud Storage (1TB)",
            description: "Zero-Knowledge (nol bilish) shifrlash tizimiga ega shaxsiy va xavfsiz bulutli xotira. Ma'lumotlaringizni faqat siz o'qiy olasiz.",
            usage: "Muhim biznes hujjatlari, shaxsiy fotosuratlar va zaxira nusxalarini (backups) to'liq xavfsiz saqlash va ulashish uchun ishlatiladi.",
            price: "85,000 UZS / oy",
            imageUrl: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=600&q=80",
            views: 0
          },
          {
            id: 4,
            title: "Vortex Dev Academy Lifetime",
            description: "Dasturlashni noldan professional darajagacha o'rgatuvchi amaliy kurslar va premium kod shablonlariga umrbod kirish huquqi.",
            usage: "Zamonaviy dasturlash texnologiyalarini o'rganish, tayyor loyihalar yordamida portfolioni boyitish va yangi kasb egallash uchun foydalaniladi.",
            price: "1,200,000 UZS (Umrbod)",
            imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80",
            views: 0
          }
        ],
        users: [],
        orders: [],
        settings: {
          botToken: process.env.BOT_TOKEN || "",
          adminId: process.env.ADMIN_ID || "",
          adminUsername: ""
        }
      };
      this.save(defaultData);
    }
  }

  read() {
    try {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(raw);
    } catch (e) {
      console.error("Ma'lumotlar bazasini o'qishda xatolik:", e);
      return { products: [], users: [], orders: [], settings: {} };
    }
  }

  save(data) {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch (e) {
      console.error("Ma'lumotlar bazasiga yozishda xatolik:", e);
      return false;
    }
  }

  // --- SETTINGS ---
  getSettings() {
    const data = this.read();
    return data.settings || {};
  }

  updateSettings(settings) {
    const data = this.read();
    data.settings = { ...data.settings, ...settings };
    this.save(data);
    return data.settings;
  }

  // --- USERS ---
  getUsers() {
    return this.read().users;
  }

  registerUser(telegramId, firstName, username) {
    const data = this.read();
    const existingUser = data.users.find(u => u.telegramId === telegramId);
    const now = new Date().toISOString();

    if (existingUser) {
      existingUser.firstName = firstName || existingUser.firstName;
      existingUser.username = username || existingUser.username;
      existingUser.lastActive = now;
    } else {
      data.users.push({
        telegramId,
        firstName: firstName || "Foydalanuvchi",
        username: username || "",
        registeredAt: now,
        lastActive: now
      });
    }
    this.save(data);
    return existingUser || data.users[data.users.length - 1];
  }

  // --- PRODUCTS ---
  getProducts() {
    return this.read().products;
  }

  getProduct(id) {
    return this.read().products.find(p => p.id === parseInt(id));
  }

  addProduct(product) {
    const data = this.read();
    const nextId = data.products.length > 0 ? Math.max(...data.products.map(p => p.id)) + 1 : 1;
    const newProduct = {
      id: nextId,
      title: product.title || "Nomsiz Mahsulot",
      description: product.description || "",
      usage: product.usage || "",
      price: product.price || "Kelishilgan narx",
      imageUrl: product.imageUrl || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80",
      views: 0
    };
    data.products.push(newProduct);
    this.save(data);
    return newProduct;
  }

  updateProduct(id, updatedFields) {
    const data = this.read();
    const index = data.products.findIndex(p => p.id === parseInt(id));
    if (index !== -1) {
      data.products[index] = {
        ...data.products[index],
        ...updatedFields,
        id: parseInt(id) // Ensure ID remains unchanged
      };
      this.save(data);
      return data.products[index];
    }
    return null;
  }

  deleteProduct(id) {
    const data = this.read();
    const initialLength = data.products.length;
    data.products = data.products.filter(p => p.id !== parseInt(id));
    this.save(data);
    return data.products.length < initialLength;
  }

  incrementProductViews(id) {
    const data = this.read();
    const product = data.products.find(p => p.id === parseInt(id));
    if (product) {
      product.views = (product.views || 0) + 1;
      this.save(data);
      return product.views;
    }
    return 0;
  }

  // --- ORDERS ---
  getOrders() {
    return this.read().orders;
  }

  addOrder(telegramId, firstName, username, productId) {
    const data = this.read();
    const product = data.products.find(p => p.id === parseInt(productId));
    if (!product) return null;

    const orderId = data.orders.length > 0 ? Math.max(...data.orders.map(o => o.id)) + 1 : 1;
    const newOrder = {
      id: orderId,
      telegramId,
      firstName: firstName || "Noma'lum",
      username: username || "",
      productId: product.id,
      productTitle: product.title,
      price: product.price,
      status: 'kutilmoqda', // pending
      createdAt: new Date().toISOString()
    };
    data.orders.push(newOrder);
    this.save(data);
    return newOrder;
  }

  updateOrderStatus(orderId, status) {
    const data = this.read();
    const order = data.orders.find(o => o.id === parseInt(orderId));
    if (order) {
      order.status = status;
      this.save(data);
      return order;
    }
    return null;
  }

  // --- ANALYTICS ---
  getAnalytics() {
    const data = this.read();
    const users = data.users || [];
    const orders = data.orders || [];
    const products = data.products || [];

    // Calculate user registration by date (last 7 days)
    const registrationsByDay = {};
    const ordersByDay = {};
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const dateStr = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      registrationsByDay[dateStr] = 0;
      ordersByDay[dateStr] = 0;
    }

    users.forEach(u => {
      const day = u.registeredAt.split('T')[0];
      if (registrationsByDay[day] !== undefined) {
        registrationsByDay[day]++;
      }
    });

    orders.forEach(o => {
      const day = o.createdAt.split('T')[0];
      if (ordersByDay[day] !== undefined) {
        ordersByDay[day]++;
      }
    });

    return {
      summary: {
        totalUsers: users.length,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalViews: products.reduce((acc, p) => acc + (p.views || 0), 0)
      },
      charts: {
        dates: Object.keys(registrationsByDay),
        usersGrowth: Object.values(registrationsByDay),
        ordersGrowth: Object.values(ordersByDay)
      },
      popularProducts: [...products].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5)
    };
  }
}

module.exports = new Database();
