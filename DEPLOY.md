# Loyihani Internetga Yuklash va Serverda Ishga Tushirish Qo'llanmasi

Ushbu qo'llanma orqali siz yaratilgan premium veb-sayt va Telegram botni serverga qanday yuklashni batafsil o'rganasiz. Bot va sayt doimiy (24/7) ishlab turishi uchun noutbukingizni yoqib qo'yishingiz shart emas. Buning uchun uni bulutli hosting xizmatlariga yoki shaxsiy VPS serverga joylashtiramiz.

---

## 1-Usul: Render.com orqali Bepul va Oson Yuklash (Tavsiya etiladi)

**Render.com** — bu Node.js dasturlarini bepul va avtomatik ravishda internetga chiqarib beradigan eng mashhur platformalardan biri.

### Bosqichlar:
1. **GitHub-ga yuklash**:
   - Avval loyihangizni o'zingizning GitHub akkauntingizga yuklang (repozitoriy ochib).
   - *.env* fayli GitHub-ga chiqib ketmasligiga ishonch hosil qiling (loyihada `.gitignore` fayliga `.env` yozilgan bo'lishi kerak, chunki unda maxfiy ma'lumotlar bor).

2. **Render.com-da ro'yxatdan o'tish**:
   - [Render.com](https://render.com) saytiga kiring va GitHub akkauntingiz orqali ro'yxatdan o'ting.

3. **Yangi Web Service yaratish**:
   - Render dashboardida **"New +"** tugmasini bosing va **"Web Service"** ni tanlang.
   - GitHub repozitoriyingizni Render loyihasiga bog'lang.

4. **Sozlamalarni kiritish**:
   - **Name**: Loyiha nomi (masalan: `premium-shop`).
   - **Language**: `Node` deb tanlang.
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free` (bepul reja).

5. **Environment Variables (Atrof-muhit o'zgaruvchilari)**:
   - Pastroqdagi **"Advanced"** tugmasini bosing va **"Add Environment Variable"** orqali quyidagi o'zgaruvchilarni kiriting:
     - `BOT_TOKEN` = `8974377421:AAFlzYsTAQd8mGYUNjtIxm5p4RBpNpcsCes`
     - `ADMIN_ID` = `6115902116`
     - `ADMIN_PASSWORD` = `admin1234` (buni o'zingiz xohlagan boshqa parolga o'zgartirishingiz mumkin)
     - `PORT` = `10000` (Render bepul rejasida odatda avtomatik sozlanadi, lekin belgilab qo'ygan yaxshi)

6. **Deploy**:
   - **"Create Web Service"** tugmasini bosing. Loyihangiz 2-3 daqiqa ichida internetga yuklanadi va sizga `https://premium-shop.onrender.com` kabi bepul maxsus domen (havola) beriladi.
   - Bot avtomatik ishga tushadi. Veb-sayt ham dunyoning istalgan joyidan shu havola orqali ochiladi.

---

## 2-Usul: Shaxsiy VPS Serverga Joylashtirish (Ubuntu)

Agar sizda shaxsiy VPS server bo'lsa (masalan: DigitalOcean, Hetzner, Vultr yoki AWS), loyihani u yerda doimiy ishlaydigan qilish uchun quyidagi amallarni bajarasiz.

### 1-qadam: VPS-ga ulanish va kerakli dasturlarni o'rnatish
Terminal orqali serveringizga kiring (SSH):
```bash
ssh root@server_ip_manzili
```

Tizimni yangilang va Node.js hamda Git o'rnating:
```bash
sudo apt update
sudo apt install -y curl git
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### 2-qadam: Loyihani serverga yuklash
Loyihani serverga klon qiling va papkaga kiring:
```bash
git clone https://github.com/username/premium-shop-bot.git
cd premium-shop-bot
```

Kutubxonalarni o'rnating:
```bash
npm install
```

`.env` faylini yarating va ichiga sozlamalarni yozing:
```bash
nano .env
```
Fayl ichiga quyidagilarni yozib, saqlang (Ctrl+O, Enter, Ctrl+X):
```env
PORT=3000
BOT_TOKEN=8974377421:AAFlzYsTAQd8mGYUNjtIxm5p4RBpNpcsCes
ADMIN_ID=6115902116
ADMIN_PASSWORD=admin1234
```

### 3-qadam: PM2 orqali Bot va Serverni Doimiy Ishga Tushirish
**PM2** — Node.js dasturlarini orqa fonda (background) boshqaradigan va server o'chib yonsa ham avtomatik qayta ishga tushiradigan professional menejerdir.

PM2 dasturini global o'rnating:
```bash
sudo npm install -y pm2 -g
```

Loyihani ishga tushiring:
```bash
pm2 start server.js --name "premium-shop"
```

Server o'chib yonganda avtomatik yonishi uchun PM2 xizmatini yoqing:
```bash
pm2 startup
pm2 save
```

Hozir bot va server orqa fonda 24/7 rejimida ishlamoqda. Holatni ko'rish uchun:
```bash
pm2 status
pm2 logs premium-shop
```

### 4-qadam: Nginx orqali Veb-saytni Domenga ulash
Mijozlar saytni `http://localhost:3000` emas, balki `http://sizningdomen.uz` shaklida ko'rishi uchun Nginx o'rnatamiz.

```bash
sudo apt install nginx -y
```

Nginx konfiguratsiyasini oching:
```bash
sudo nano /etc/nginx/sites-available/default
```

Fayl ichini quyidagicha o'zgartiring (3000 portdagi saytni 80 portga yo'naltirish):
```nginx
server {
    listen 80;
    server_name sizningdomen.uz www.sizningdomen.uz;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Nginx-ni qayta ishga tushiring:
```bash
sudo systemctl restart nginx
```

Endi siz brauzerda o'z domeningizni terganingizda veb-sayt va tahlillar paneli ochiladi. Bot esa orqa fonda Telegram buyurtmalarini qabul qilishda davom etadi.
