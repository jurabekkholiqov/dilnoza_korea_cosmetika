document.addEventListener('DOMContentLoaded', () => {
  const productsContainer = document.getElementById('products-container');
  const productModal = document.getElementById('product-modal');
  const closeModalBtn = document.getElementById('close-modal');
  const modalContentBody = document.getElementById('modal-content-body');
  
  const headerBotBtn = document.getElementById('header-bot-btn');
  const heroBotBtn = document.getElementById('hero-bot-btn');

  let botUsername = '';
  let defaultAdminId = '6115902116';

  // Telegram WebApp detection
  const tg = window.Telegram ? window.Telegram.WebApp : null;
  const isWebApp = tg && tg.initData !== "";
  
  if (isWebApp) {
    tg.ready();
    tg.expand();
  }

  // Fetch Bot Settings first to setup Telegram buttons
  async function fetchBotInfo() {
    try {
      const response = await fetch('/api/bot-info');
      const data = await response.json();
      
      // If we have a bot username, set bot buttons to point to the Telegram Bot
      if (data && data.username) {
        botUsername = data.username;
        const botUrl = `https://t.me/${botUsername}`;
        if (headerBotBtn) headerBotBtn.href = botUrl;
        if (heroBotBtn) heroBotBtn.href = botUrl;
      } else {
        // Fallback directly to admin PM if bot not configured yet
        const adminUrl = data.adminUsername 
          ? `https://t.me/${data.adminUsername}` 
          : `tg://user?id=${data.adminId || defaultAdminId}`;
        if (headerBotBtn) headerBotBtn.href = adminUrl;
        if (heroBotBtn) heroBotBtn.href = adminUrl;
      }
    } catch (err) {
      console.error("Bot ma'lumotlarini yuklashda xatolik:", err);
      // Hardcoded fallback
      const fallbackUrl = `tg://user?id=${defaultAdminId}`;
      if (headerBotBtn) headerBotBtn.href = fallbackUrl;
      if (heroBotBtn) heroBotBtn.href = fallbackUrl;
    }
  }

  // Fetch all products
  async function fetchProducts() {
    try {
      const response = await fetch('/api/products');
      const products = await response.json();
      
      renderProducts(products);
    } catch (err) {
      console.error("Mahsulotlarni yuklashda xatolik:", err);
      productsContainer.innerHTML = `
        <div class="error-msg">
          <i class="fa-solid fa-triangle-exclamation"></i> Mahsulotlarni yuklashda xatolik yuz berdi. Iltimos, keyinroq qayta urining.
        </div>
      `;
    }
  }

  // Render products to grid
  function renderProducts(products) {
    if (!products || products.length === 0) {
      productsContainer.innerHTML = `<div class="loading-spinner">Hozircha mahsulotlar mavjud emas.</div>`;
      return;
    }

    productsContainer.innerHTML = '';
    
    products.forEach(p => {
      const card = document.createElement('div');
      card.className = 'product-card';
      
      // Placeholder image if URL is empty
      const imageSrc = p.imageUrl || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80';
      
      card.innerHTML = `
        <div class="product-image-container">
          <img src="${imageSrc}" alt="${p.title}" loading="lazy">
        </div>
        <div class="product-body">
          <h3 class="product-card-title">${p.title}</h3>
          <p class="product-card-desc">${p.description}</p>
          <div class="product-meta">
            <span class="product-price">${p.price}</span>
            <button class="btn btn-secondary btn-sm view-details-btn" data-id="${p.id}">
              Batafsil <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      `;
      
      productsContainer.appendChild(card);
    });

    // Add event listeners to view detail buttons
    document.querySelectorAll('.view-details-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        openProductModal(id);
      });
    });
  }

  // Open Product Modal
  async function openProductModal(id) {
    try {
      // Increment view count on server and fetch single product
      const response = await fetch(`/api/products/${id}`);
      const product = await response.json();
      
      if (product.error) {
        alert("Mahsulot topilmadi");
        return;
      }

      const imageSrc = product.imageUrl || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80';
      
      let buttonHtml = '';
      if (isWebApp) {
        buttonHtml = `
          <button id="webapp-buy-btn" class="btn btn-primary">
            <i class="fa-brands fa-telegram"></i> Xarid qilish (Lichka)
          </button>
        `;
      } else {
        const targetUrl = botUsername 
          ? `https://t.me/${botUsername}?start=view_${product.id}` 
          : `tg://user?id=${defaultAdminId}`;
        buttonHtml = `
          <a href="${targetUrl}" target="_blank" class="btn btn-primary">
            <i class="fa-brands fa-telegram"></i> Bot orqali sotib olish
          </a>
        `;
      }

      modalContentBody.innerHTML = `
        <h2>${product.title}</h2>
        <img src="${imageSrc}" alt="${product.title}">
        
        <div class="modal-section">
          <h4>Batafsil Tavsif</h4>
          <p>${product.description}</p>
        </div>
        
        <div class="modal-section">
          <h4>Nima uchun ishlatiladi?</h4>
          <p>${product.usage}</p>
        </div>
        
        <div class="modal-footer">
          <span class="product-price" style="font-size: 1.5rem;">${product.price}</span>
          ${buttonHtml}
        </div>
      `;
      
      // Bind WebApp buy button click event
      if (isWebApp) {
        const buyBtn = document.getElementById('webapp-buy-btn');
        buyBtn.addEventListener('click', async () => {
          buyBtn.disabled = true;
          buyBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Bog'lanmoqda...`;
          
          try {
            const user = tg.initDataUnsafe ? tg.initDataUnsafe.user : null;
            const res = await fetch('/api/web-app/order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                telegramId: user ? user.id : 0,
                firstName: user ? user.first_name : 'WebApp Foydalanuvchisi',
                username: user ? user.username : '',
                productId: product.id
              })
            });
            const data = await res.json();
            
            if (data.success) {
              tg.showPopup({
                title: 'Buyurtma ro\'yxatga olindi',
                message: 'To\'lov shaffofligini ta\'minlash uchun adminga yo\'naltirilasiz. Iltimos, adminga yozing.',
                buttons: [{ type: 'ok', text: 'Adminga yozish' }]
              }, () => {
                tg.openTelegramLink(data.adminUrl);
                productModal.classList.remove('active');
              });
            } else {
              alert("Xatolik yuz berdi");
              buyBtn.disabled = false;
              buyBtn.innerHTML = `<i class="fa-brands fa-telegram"></i> Xarid qilish (Lichka)`;
            }
          } catch (e) {
            console.error(e);
            alert("Xatolik: " + e.message);
            buyBtn.disabled = false;
            buyBtn.innerHTML = `<i class="fa-brands fa-telegram"></i> Xarid qilish (Lichka)`;
          }
        });
      }
      
      productModal.classList.add('active');
    } catch (err) {
      console.error("Mahsulot tafsilotlarini yuklashda xatolik:", err);
      alert("Xatolik yuz berdi");
    }
  }

  // Close modal logic
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      productModal.classList.remove('active');
    });
  }

  // Close modal when clicking overlay outside content
  if (productModal) {
    productModal.addEventListener('click', (e) => {
      if (e.target === productModal) {
        productModal.classList.remove('active');
      }
    });
  }

  // Initialize
  fetchBotInfo();
  fetchProducts();
});
