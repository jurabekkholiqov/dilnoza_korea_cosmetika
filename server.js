require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Bot global status
let botInstance = null;
let botStatus = "Faol emas";

// Initialize settings in DB if empty
const settings = db.getSettings();
if (!settings.botToken && process.env.BOT_TOKEN) {
  db.updateSettings({
    botToken: process.env.BOT_TOKEN,
    adminId: process.env.ADMIN_ID || "6115902116",
    adminUsername: ""
  });
}

// Start Telegram Bot Function
function startTelegramBot() {
  const currentSettings = db.getSettings();
  const token = currentSettings.botToken;
  const adminId = currentSettings.adminId || process.env.ADMIN_ID || "6115902116";

  if (!token) {
    console.log("⚠️ Telegram Bot Token topilmadi. Admin paneldan sozlang.");
    botStatus = "Token topilmadi";
    return false;
  }

  try {
    if (botInstance) {
      console.log("Eski bot to'xtatilmoqda...");
      try {
        botInstance.stop('RESTART');
      } catch (e) {
        console.error("Eski botni to'xtatishda xatolik:", e.message);
      }
    }

    const { Telegraf, Markup } = require('telegraf');
    const bot = new Telegraf(token);
    botInstance = bot;

    // --- Bot Middlewares & Commands ---

    // Welcome and Register user
    bot.start((ctx) => {
      const from = ctx.from;
      db.registerUser(from.id, from.first_name, from.username);
      
      const currentSettings = db.getSettings();
      const webappUrl = currentSettings.webappUrl || "http://localhost:3000/";
      
      const welcomeMsg = `Assalomu alaykum, *${from.first_name}*! \n\n*Kosmetika Bot* do'koniga xush kelibsiz! ✨\n\nMahsulotlar va kosmetikalar bilan tanishish uchun quyidagi tugmani bosib do'konni oching:`;
      
      ctx.replyWithMarkdownV2(
        welcomeMsg.replace(/[_*[\]()~`>#+-=|{}.!]/g, '\\$&'), // Escape markdown chars
        Markup.keyboard([
          [Markup.button.webApp('🛍️ Do\'konni ochish', webappUrl)],
          ['💬 Admin bilan bog\'lanish']
        ]).resize()
      );
    });

    // Contact Admin Hears
    bot.hears('💬 Admin bilan bog\'lanish', (ctx) => {
      const adminSettings = db.getSettings();
      const adminUrl = adminSettings.adminUsername 
        ? `https://t.me/${adminSettings.adminUsername}` 
        : `tg://user?id=${adminId}`;

      ctx.reply("Savollar, takliflar yoki to'lov masalalarida bevosita adminga yozishingiz mumkin:",
        Markup.inlineKeyboard([
          [Markup.button.url("👤 Admin bilan bog'lanish", adminUrl)]
        ])
      );
    });

    // Catch-all message handler
    bot.on('message', (ctx) => {
      const currentSettings = db.getSettings();
      const webappUrl = currentSettings.webappUrl || "http://localhost:3000/";
      ctx.reply("Iltimos, do'konimizni ochish yoki admin bilan bog'lanish uchun pastdagi tugmalardan foydalaning:",
        Markup.keyboard([
          [Markup.button.webApp('🛍️ Do\'konni ochish', webappUrl)],
          ['💬 Admin bilan bog\'lanish']
        ]).resize()
      );
    });

    bot.launch()
      .then(async () => {
        console.log("🤖 Telegram bot muvaffaqiyatli ishga tushirildi.");
        botStatus = "Faol";
        try {
          const botInfo = await bot.telegram.getMe();
          console.log(`🤖 Bot username: @${botInfo.username}`);
          const currentSettings = db.getSettings();
          db.updateSettings({
            ...currentSettings,
            botUsername: botInfo.username
          });

          // Automatically set WebApp menu button if webappUrl exists
          const webappUrl = currentSettings.webappUrl || "";
          if (webappUrl) {
            await bot.telegram.setChatMenuButton({
              menuButton: {
                type: 'web_app',
                text: '🛍️ Do\'kon',
                web_app: { url: webappUrl }
              }
            });
            console.log("🛍️ Telegram Menu Button WebApp havolasi sozlindi:", webappUrl);
          }
        } catch (e) {
          console.error("Bot ma'lumotlarini yoki Menu Buttonni yuklashda xatolik:", e.message);
        }
      })
      .catch(err => {
        console.error("❌ Botni ishga tushirishda xatolik:", err.message);
        botStatus = `Xatolik: ${err.message}`;
      });

  } catch (err) {
    console.error("❌ Botni ishga tushirish jarayonida xatolik:", err.message);
    botStatus = `Xatolik: ${err.message}`;
    return false;
  }
  return true;
}

// Start the bot initially
startTelegramBot();


// --- API ROUTES ---

// Public Bot Info API
app.get('/api/bot-info', (req, res) => {
  const currentSettings = db.getSettings();
  res.json({
    username: currentSettings.botUsername || "",
    adminId: currentSettings.adminId || process.env.ADMIN_ID || "6115902116",
    adminUsername: currentSettings.adminUsername || "",
    webappUrl: currentSettings.webappUrl || "",
    botStatus
  });
});

// Web App Order Creation (called inside Telegram WebApp)
app.post('/api/web-app/order', (req, res) => {
  const { telegramId, firstName, username, productId } = req.body;
  
  if (!productId) {
    return res.status(400).json({ error: "Mahsulot ID kiritilmadi" });
  }
  
  const product = db.getProduct(productId);
  if (!product) {
    return res.status(404).json({ error: "Mahsulot topilmadi" });
  }
  
  // Register order
  const order = db.addOrder(telegramId, firstName, username, product.id);
  if (!order) {
    return res.status(500).json({ error: "Buyurtma saqlashda xatolik" });
  }
  
  // Register user
  if (telegramId) {
    db.registerUser(telegramId, firstName, username);
  }
  
  const currentSettings = db.getSettings();
  const adminId = currentSettings.adminId || process.env.ADMIN_ID || "6115902116";
  const adminUsername = currentSettings.adminUsername || "";
  
  // Notify Admin via Bot
  if (botInstance) {
    const userTag = username ? `@${username}` : `[Profil](tg://user?id=${telegramId})`;
    const adminNotifyMsg = `🛒 *Yangi Web\\-App Buyurtmasi\\!* (#${order.id})\n\n` +
                           `👤 *Xaridor:* ${firstName} (${userTag})\n` +
                           `🆔 *ID:* \`${telegramId}\`\n\n` +
                           `📦 *Mahsulot:* ${product.title}\n` +
                           `💰 *Narxi:* ${product.price}\n` +
                           `📊 *Holati:* Kutilmoqda`;
                           
    botInstance.telegram.sendMessage(adminId, adminNotifyMsg, { parse_mode: 'MarkdownV2' })
      .catch(err => console.error("Adminni ogohlantirishda xatolik:", err.message));
  }
  
  const adminUrl = adminUsername 
    ? `https://t.me/${adminUsername}` 
    : `tg://user?id=${adminId}`;
    
  res.json({
    success: true,
    orderId: order.id,
    adminUrl
  });
});

// Public Products API
app.get('/api/products', (req, res) => {
  res.json(db.getProducts());
});

app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  db.incrementProductViews(id);
  const product = db.getProduct(id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: "Mahsulot topilmadi" });
  }
});

// Admin Authentication Middleware
const authAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const pass = process.env.ADMIN_PASSWORD || 'admin1234';
  
  if (authHeader && authHeader.split(' ')[1] === pass) {
    next();
  } else {
    res.status(401).json({ error: "Ruxsat berilmagan! Parol noto'g'ri." });
  }
};

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const correctPass = process.env.ADMIN_PASSWORD || 'admin1234';
  
  if (password === correctPass) {
    res.json({ token: correctPass, success: true });
  } else {
    res.status(401).json({ error: "Noto'g'ri parol!", success: false });
  }
});

// Admin Analytics
app.get('/api/admin/analytics', authAdmin, (req, res) => {
  const stats = db.getAnalytics();
  res.json({
    ...stats,
    botStatus
  });
});

// Admin Settings (Bot configurations)
app.get('/api/admin/settings', authAdmin, (req, res) => {
  res.json(db.getSettings());
});

app.post('/api/admin/settings', authAdmin, async (req, res) => {
  const { botToken, adminId, adminUsername, webappUrl } = req.body;
  const currentSettings = db.getSettings();
  
  const updated = db.updateSettings({ botToken, adminId, adminUsername, webappUrl });
  
  // Restart the bot if token is updated
  if (botToken !== currentSettings.botToken) {
    console.log("Bot tokeni o'zgardi. Bot qayta ishga tushirilmoqda...");
    startTelegramBot();
  } else if (webappUrl !== currentSettings.webappUrl && botInstance) {
    // Update Menu Button without full restart
    try {
      if (webappUrl) {
        await botInstance.telegram.setChatMenuButton({
          menuButton: {
            type: 'web_app',
            text: '🛍️ Do\'kon',
            web_app: { url: webappUrl }
          }
        });
        console.log("🛍️ Telegram Menu Button WebApp havolasi yangilandi:", webappUrl);
      }
    } catch (e) {
      console.error("Menu Button sozlashda xatolik:", e.message);
    }
  }
  
  res.json({ success: true, settings: updated, botStatus });
});

// Admin Products CRUD
app.post('/api/admin/products', authAdmin, (req, res) => {
  const product = db.addProduct(req.body);
  res.status(201).json(product);
});

app.put('/api/admin/products/:id', authAdmin, (req, res) => {
  const updated = db.updateProduct(req.params.id, req.body);
  if (updated) {
    res.json(updated);
  } else {
    res.status(404).json({ error: "Mahsulot topilmadi" });
  }
});

app.delete('/api/admin/products/:id', authAdmin, (req, res) => {
  const deleted = db.deleteProduct(req.params.id);
  if (deleted) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Mahsulot topilmadi" });
  }
});

// Admin Orders
app.get('/api/admin/orders', authAdmin, (req, res) => {
  res.json(db.getOrders());
});

app.post('/api/admin/orders/:id/status', authAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'tasdiqlandi' or 'rad etildi' or 'kutilmoqda'
  
  const updatedOrder = db.updateOrderStatus(id, status);
  if (updatedOrder) {
    // Optionally notify the user via Bot about the status update
    if (botInstance) {
      const statusEmoji = status === 'tasdiqlandi' ? '✅' : status === 'rad etildi' ? '❌' : '⏳';
      const userMsg = `🔔 *Buyurtmangiz holati yangilandi\\!* (ID: #${updatedOrder.id})\n\n` +
                     `📦 Mahsulot: ${updatedOrder.productTitle}\n` +
                     `📊 Yangi holat: *${status.toUpperCase()}* ${statusEmoji}`;
      
      botInstance.telegram.sendMessage(updatedOrder.telegramId, userMsg, { parse_mode: 'MarkdownV2' })
        .catch(err => console.error("Foydalanuvchini ogohlantirishda xatolik:", err.message));
    }
    res.json(updatedOrder);
  } else {
    res.status(404).json({ error: "Buyurtma topilmadi" });
  }
});

// Serve frontend routing fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server http://localhost:${PORT} portida ishga tushdi.`);
});
