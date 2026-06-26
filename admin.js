document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const loginOverlay = document.getElementById('login-overlay');
  const loginForm = document.getElementById('login-form');
  const adminPasswordInput = document.getElementById('admin-password');
  const togglePasswordBtn = document.getElementById('toggle-password-btn');
  const loginErrorMsg = document.getElementById('login-error-msg');
  const dashboardContainer = document.getElementById('dashboard-container');
  
  const sidebarNavLinks = document.querySelectorAll('.sidebar-nav a');
  const tabSections = document.querySelectorAll('.tab-section');
  const pageTitle = document.getElementById('page-title');
  const pageSubtitle = document.getElementById('page-subtitle');
  const botStatusContainer = document.getElementById('bot-status-container');
  const botStatusLabel = botStatusContainer.querySelector('.status-label');
  
  const logoutBtn = document.getElementById('logout-btn');

  // Metrics
  const metricUsers = document.getElementById('metric-users');
  const metricOrders = document.getElementById('metric-orders');
  const metricViews = document.getElementById('metric-views');
  const metricProducts = document.getElementById('metric-products');
  const popularProductsContainer = document.getElementById('popular-products-container');

  // Products
  const adminProductsTbody = document.getElementById('admin-products-tbody');
  const addProductBtn = document.getElementById('add-product-btn');
  const productFormModal = document.getElementById('product-form-modal');
  const closeFormModalBtn = document.getElementById('close-form-modal');
  const productForm = document.getElementById('product-form');
  const formProductId = document.getElementById('form-product-id');
  const formProductTitle = document.getElementById('form-product-title');
  const formProductPrice = document.getElementById('form-product-price');
  const formProductImage = document.getElementById('form-product-image');
  const formProductDesc = document.getElementById('form-product-desc');
  const formProductUsage = document.getElementById('form-product-usage');
  const formSubmitBtn = document.getElementById('form-submit-btn');
  const modalFormTitle = document.getElementById('modal-form-title');

  // Orders
  const adminOrdersTbody = document.getElementById('admin-orders-tbody');
  const pendingOrdersBadge = document.getElementById('pending-orders-badge');

  // Settings
  const settingsForm = document.getElementById('settings-form');
  const settingsToken = document.getElementById('settings-token');
  const settingsAdminId = document.getElementById('settings-admin-id');
  const settingsAdminUsername = document.getElementById('settings-admin-username');
  const settingsWebappUrl = document.getElementById('settings-webapp-url');
  const settingsStatusMsg = document.getElementById('settings-status-msg');

  let adminToken = localStorage.getItem('admin_token') || '';
  let chartInstance = null;

  // Toggle password visibility
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', () => {
      const type = adminPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      adminPasswordInput.setAttribute('type', type);
      const icon = togglePasswordBtn.querySelector('i');
      if (type === 'text') {
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  }

  // Check login
  if (adminToken) {
    showDashboard();
  } else {
    showLogin();
  }

  // Handle login submit
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = adminPasswordInput.value;
    
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        adminToken = data.token;
        localStorage.setItem('admin_token', adminToken);
        showDashboard();
      } else {
        loginErrorMsg.textContent = data.error || "Noto'g'ri parol!";
      }
    } catch (err) {
      console.error(err);
      loginErrorMsg.textContent = "Server bilan bog'lanishda xatolik!";
    }
  });

  // Logout
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('admin_token');
    adminToken = '';
    showLogin();
  });

  function showLogin() {
    loginOverlay.style.display = 'flex';
    dashboardContainer.style.display = 'none';
  }

  function showDashboard() {
    loginOverlay.style.display = 'none';
    dashboardContainer.style.display = 'grid';
    loadDashboardData();
  }

  // Header helpers
  const headers = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  });

  // Tab switching
  sidebarNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      const targetTab = link.getAttribute('data-tab');
      
      // Update sidebar links
      sidebarNavLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      
      // Toggle tab sections
      tabSections.forEach(section => {
        section.classList.remove('active');
        if (section.id === `tab-${targetTab}`) {
          section.classList.add('active');
        }
      });

      // Update titles
      switch (targetTab) {
        case 'analytics':
          pageTitle.textContent = "Tahlillar paneli";
          pageSubtitle.textContent = "Statistika, faoliyat va tizim holati.";
          loadAnalytics();
          break;
        case 'products':
          pageTitle.textContent = "Mahsulotlar";
          pageSubtitle.textContent = "Katalogdagi mahsulotlarni tahrirlash, qo'shish yoki o'chirish.";
          loadProducts();
          break;
        case 'orders':
          pageTitle.textContent = "Buyurtmalar";
          pageSubtitle.textContent = "Mijozlar tomonidan qoldirilgan xarid arizalari ro'yxati.";
          loadOrders();
          break;
        case 'settings':
          pageTitle.textContent = "Tizim sozlamalari";
          pageSubtitle.textContent = "Telegram bot tokeni va admin ma'lumotlarini sozlash.";
          loadSettings();
          break;
      }
    });
  });

  // Load All Dashboard Data
  function loadDashboardData() {
    loadAnalytics();
    loadOrdersBadgeOnly();
  }

  // Update Bot Status indicator
  function updateBotStatusUI(status) {
    botStatusContainer.className = 'bot-status-indicator';
    if (status === 'Faol') {
      botStatusContainer.classList.add('status-online');
      botStatusLabel.textContent = 'Bot: Faol';
    } else {
      botStatusContainer.classList.add('status-offline');
      botStatusLabel.textContent = `Bot: ${status}`;
    }
  }

  // --- TAB 1: ANALYTICS ---
  async function loadAnalytics() {
    try {
      const res = await fetch('/api/admin/analytics', { headers: headers() });
      if (res.status === 401) return handleUnauthorized();
      
      const data = await res.json();
      
      // Update metrics
      metricUsers.textContent = data.summary.totalUsers;
      metricOrders.textContent = data.summary.totalOrders;
      metricViews.textContent = data.summary.totalViews;
      metricProducts.textContent = data.summary.totalProducts;
      
      updateBotStatusUI(data.botStatus);
      
      // Render Popular products
      popularProductsContainer.innerHTML = '';
      if (data.popularProducts && data.popularProducts.length > 0) {
        data.popularProducts.forEach((p, index) => {
          const item = document.createElement('div');
          item.className = 'popular-product-item';
          const imgUrl = p.imageUrl || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80';
          
          item.innerHTML = `
            <span class="pop-prod-rank">#${index + 1}</span>
            <img class="pop-prod-img" src="${imgUrl}" alt="${p.title}">
            <div class="pop-prod-details">
              <div class="pop-prod-title">${p.title}</div>
              <div class="pop-prod-views">${p.views || 0} marta ko'rilgan</div>
            </div>
          `;
          popularProductsContainer.appendChild(item);
        });
      } else {
        popularProductsContainer.innerHTML = '<p class="text-muted">Hozircha ma'lumot yo'q</p>';
      }

      // Render Growth Chart
      renderChart(data.charts);

    } catch (err) {
      console.error(err);
    }
  }

  function renderChart(chartData) {
    const ctx = document.getElementById('usersChart').getContext('2d');
    
    if (chartInstance) {
      chartInstance.destroy();
    }
    
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.dates.map(d => {
          const date = new Date(d);
          return date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' });
        }),
        datasets: [
          {
            label: "Foydalanuvchilar o'sishi",
            data: chartData.usersGrowth,
            borderColor: '#9333ea',
            backgroundColor: 'rgba(147, 51, 234, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4
          },
          {
            label: "Buyurtmalar o'sishi",
            data: chartData.ordersGrowth,
            borderColor: '#06b6d4',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#9ca3af',
              font: { family: 'Outfit' }
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#9ca3af', font: { family: 'Outfit' } }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { 
              color: '#9ca3af', 
              font: { family: 'Outfit' },
              stepSize: 1,
              precision: 0 
            }
          }
        }
      }
    });
  }

  // --- TAB 2: PRODUCTS ---
  async function loadProducts() {
    try {
      const res = await fetch('/api/products');
      const products = await res.json();
      
      adminProductsTbody.innerHTML = '';
      
      if (products.length === 0) {
        adminProductsTbody.innerHTML = `<tr><td colspan="5" class="text-center" style="text-align:center; padding: 2rem;">Mahsulotlar mavjud emas. Yangisini qo'shing.</td></tr>`;
        return;
      }

      products.forEach(p => {
        const imgUrl = p.imageUrl || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80';
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><img class="table-img" src="${imgUrl}" alt="${p.title}"></td>
          <td style="font-weight: 600;">${p.title}</td>
          <td class="product-price">${p.price}</td>
          <td><i class="fa-solid fa-eye text-muted"></i> ${p.views || 0}</td>
          <td>
            <div class="table-actions">
              <button class="table-btn table-btn-edit edit-prod-btn" data-id="${p.id}"><i class="fa-solid fa-pen-to-square"></i></button>
              <button class="table-btn table-btn-delete delete-prod-btn" data-id="${p.id}"><i class="fa-solid fa-trash"></i></button>
            </div>
          </td>
        `;
        adminProductsTbody.appendChild(tr);
      });

      // Add edit listeners
      document.querySelectorAll('.edit-prod-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          openEditProductModal(id);
        });
      });

      // Add delete listeners
      document.querySelectorAll('.delete-prod-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          deleteProduct(id);
        });
      });

    } catch (err) {
      console.error(err);
    }
  }

  // Add Product button click
  addProductBtn.addEventListener('click', () => {
    modalFormTitle.textContent = "Yangi mahsulot qo'shish";
    productForm.reset();
    formProductId.value = '';
    formSubmitBtn.textContent = "Qo'shish";
    productFormModal.classList.add('active');
  });

  closeFormModalBtn.addEventListener('click', () => {
    productFormModal.classList.remove('active');
  });

  // Open Edit Product Modal
  async function openEditProductModal(id) {
    try {
      const res = await fetch(`/api/products/${id}`);
      const product = await res.json();
      
      if (product.error) return alert("Mahsulot topilmadi");

      modalFormTitle.textContent = "Mahsulotni tahrirlash";
      formProductId.value = product.id;
      formProductTitle.value = product.title;
      formProductPrice.value = product.price;
      formProductImage.value = product.imageUrl || '';
      formProductDesc.value = product.description;
      formProductUsage.value = product.usage;
      formSubmitBtn.textContent = "Saqlash";
      
      productFormModal.classList.add('active');
    } catch (err) {
      console.error(err);
    }
  }

  // Handle product form submit
  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = formProductId.value;
    const bodyData = {
      title: formProductTitle.value,
      price: formProductPrice.value,
      imageUrl: formProductImage.value,
      description: formProductDesc.value,
      usage: formProductUsage.value
    };

    const url = id ? `/api/admin/products/${id}` : '/api/admin/products';
    const method = id ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: headers(),
        body: JSON.stringify(bodyData)
      });

      if (res.status === 401) return handleUnauthorized();
      
      if (res.ok) {
        productFormModal.classList.remove('active');
        loadProducts();
      } else {
        alert("Xatolik yuz berdi");
      }
    } catch (err) {
      console.error(err);
    }
  });

  // Delete Product
  async function deleteProduct(id) {
    if (!confirm("Haqiqatan ham bu mahsulotni o'chirmoqchisiz?")) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: headers()
      });

      if (res.status === 401) return handleUnauthorized();

      if (res.ok) {
        loadProducts();
      } else {
        alert("O'chirishda xatolik yuz berdi");
      }
    } catch (err) {
      console.error(err);
    }
  }

  // --- TAB 3: ORDERS ---
  async function loadOrders() {
    try {
      const res = await fetch('/api/admin/orders', { headers: headers() });
      if (res.status === 401) return handleUnauthorized();
      
      const orders = await res.json();
      adminOrdersTbody.innerHTML = '';

      if (orders.length === 0) {
        adminOrdersTbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem;">Buyurtmalar tarixi bo'sh.</td></tr>`;
        pendingOrdersBadge.style.display = 'none';
        return;
      }

      // Sort: newest first
      orders.sort((a, b) => b.id - a.id);

      let pendingCount = 0;

      orders.forEach(o => {
        const date = new Date(o.createdAt).toLocaleDateString('uz-UZ', {
          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        
        let statusClass = 'status-badge-pending';
        if (o.status === 'tasdiqlandi') statusClass = 'status-badge-approved';
        if (o.status === 'rad etildi') statusClass = 'status-badge-rejected';

        if (o.status === 'kutilmoqda') {
          pendingCount++;
        }

        const customerInfo = o.username 
          ? `<a class="user-tg-link" href="https://t.me/${o.username}" target="_blank">${o.firstName} (@${o.username})</a>`
          : `<a class="user-tg-link" href="tg://user?id=${o.telegramId}">${o.firstName} (${o.telegramId})</a>`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>#${o.id}</td>
          <td>${date}</td>
          <td>${customerInfo}</td>
          <td style="font-weight: 500;">${o.productTitle}</td>
          <td class="product-price">${o.price}</td>
          <td><span class="status-badge ${statusClass}">${o.status}</span></td>
          <td>
            <div class="table-actions">
              ${o.status === 'kutilmoqda' ? `
                <button class="btn btn-secondary btn-sm action-approve-btn" data-id="${o.id}" style="color:var(--success); border-color: rgba(16, 185, 129, 0.2);"><i class="fa-solid fa-check"></i></button>
                <button class="btn btn-secondary btn-sm action-reject-btn" data-id="${o.id}" style="color:var(--error); border-color: rgba(239, 68, 68, 0.2);"><i class="fa-solid fa-xmark"></i></button>
              ` : `<span class="text-muted" style="font-size:0.85rem;">Bajarildi</span>`}
            </div>
          </td>
        `;
        adminOrdersTbody.appendChild(tr);
      });

      // Update badge
      if (pendingCount > 0) {
        pendingOrdersBadge.textContent = pendingCount;
        pendingOrdersBadge.style.display = 'inline-block';
      } else {
        pendingOrdersBadge.style.display = 'none';
      }

      // Add actions event listeners
      document.querySelectorAll('.action-approve-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          updateOrderStatus(id, 'tasdiqlandi');
        });
      });

      document.querySelectorAll('.action-reject-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.getAttribute('data-id');
          updateOrderStatus(id, 'rad etildi');
        });
      });

    } catch (err) {
      console.error(err);
    }
  }

  // Update order badge only (loaded on dashboard init)
  async function loadOrdersBadgeOnly() {
    try {
      const res = await fetch('/api/admin/orders', { headers: headers() });
      if (res.status === 401) return;
      const orders = await res.json();
      const pendingCount = orders.filter(o => o.status === 'kutilmoqda').length;
      if (pendingCount > 0) {
        pendingOrdersBadge.textContent = pendingCount;
        pendingOrdersBadge.style.display = 'inline-block';
      } else {
        pendingOrdersBadge.style.display = 'none';
      }
    } catch (e) {}
  }

  // Update order status
  async function updateOrderStatus(id, status) {
    try {
      const res = await fetch(`/api/admin/orders/${id}/status`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ status })
      });

      if (res.status === 401) return handleUnauthorized();

      if (res.ok) {
        loadOrders();
      } else {
        alert("Xatolik yuz berdi");
      }
    } catch (err) {
      console.error(err);
    }
  }

  // --- TAB 4: SETTINGS ---
  async function loadSettings() {
    try {
      const res = await fetch('/api/admin/settings', { headers: headers() });
      if (res.status === 401) return handleUnauthorized();
      
      const data = await res.json();
      
      settingsToken.value = data.botToken || '';
      settingsAdminId.value = data.adminId || '';
      settingsAdminUsername.value = data.adminUsername || '';
      settingsWebappUrl.value = data.webappUrl || '';
    } catch (err) {
      console.error(err);
    }
  }

  // Save Settings
  settingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const bodyData = {
      botToken: settingsToken.value.trim(),
      adminId: settingsAdminId.value.trim(),
      adminUsername: settingsAdminUsername.value.trim().replace('@', ''), // Remove @ if entered
      webappUrl: settingsWebappUrl.value.trim()
    };

    settingsStatusMsg.className = 'settings-status-msg';
    settingsStatusMsg.textContent = "Saqlanmoqda...";

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(bodyData)
      });

      if (res.status === 401) return handleUnauthorized();

      const data = await res.json();
      if (data.success) {
        settingsStatusMsg.classList.add('success');
        settingsStatusMsg.textContent = "Sozlamalar saqlandi. Bot qayta yuklandi.";
        updateBotStatusUI(data.botStatus);
      } else {
        settingsStatusMsg.classList.add('error');
        settingsStatusMsg.textContent = "Xatolik yuz berdi.";
      }
    } catch (err) {
      console.error(err);
      settingsStatusMsg.classList.add('error');
      settingsStatusMsg.textContent = "Server bilan bog'lanishda xatolik.";
    }
  });

  // Handle unauthorized
  function handleUnauthorized() {
    alert("Seans muddati tugadi yoki sizga ruxsat berilmagan. Iltimos qayta kiring.");
    localStorage.removeItem('admin_token');
    adminToken = '';
    showLogin();
  }
});
