// Hawawshi El Nasr Storefront Application Logic

let products = [];
let cart = [];
let currentCategory = "all";
let searchQuery = "";
const WHATSAPP_NUMBER = "201026401035"; // WhatsApp number for orders
const FREE_SHIPPING_LIMIT = 500; // Updated free shipping limit for food order to be more realistic (500 EGP)
const DEFAULT_SHIPPING_COST = 30; // 30 EGP shipping cost

// Category Names mapping
const CATEGORY_NAMES = {
  all: "الكل",
  hawawshi: "حواوشي النصر",
  plates: "وجبات وورقات مميزة"
};

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  // Load products from database
  loadStoreProducts();
  
  // Load cart from sessionStorage if exists
  const savedCart = sessionStorage.getItem("elnasr_shop_cart");
  if (savedCart) {
    try {
      cart = JSON.parse(savedCart);
      updateCartUI();
    } catch(e) {
      cart = [];
    }
  }

  // Listen for database changes from the admin page
  window.addEventListener("productsUpdated", () => {
    loadStoreProducts();
  });
  
  // Also check local storage updates periodically in case of cross-tab changes
  window.addEventListener("storage", (e) => {
    if (e.key === "elnasr_shop_products") {
      loadStoreProducts();
    }
  });
});

// Load products and render
function loadStoreProducts() {
  products = getProducts(); // function defined in database.js
  renderProducts();
}

// Render products to grid
function renderProducts() {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;
  
  grid.innerHTML = "";
  
  // Filter products by search and category
  const filtered = products.filter(p => {
    const matchesCategory = currentCategory === "all" || p.category === currentCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="cart-empty-message" style="grid-column: 1 / -1; padding: 4rem 0;">
        <i class="fa-solid fa-box-open"></i>
        <h3>لا توجد وجبات مطابقة للبحث حالياً</h3>
        <p>جرب البحث بكلمات أخرى أو اختر قسماً آخر</p>
      </div>
    `;
    return;
  }
  
  filtered.forEach(p => {
    const isAvailable = p.available !== false;
    
    const card = document.createElement("div");
    card.className = `product-card ${!isAvailable ? 'out-of-stock' : ''}`;
    
    card.innerHTML = `
      <span class="product-category-badge">${CATEGORY_NAMES[p.category] || p.category}</span>
      <div class="product-image-container" style="background-image: url('${p.image || 'assets/logo.jpg'}'); background-size: cover; background-position: center; height: 200px;">
        ${!isAvailable ? '<div class="out-of-stock-overlay">غير متوفر حالياً</div>' : ''}
      </div>
      <div class="product-details">
        <h3 class="product-title">${p.name}</h3>
        <p class="product-desc" title="${p.description}">${p.description || "لا يوجد وصف لهذا المنتج حالياً."}</p>
        <div class="product-meta">
          <div class="product-price-info">
            <span class="product-price">${p.price} ج</span>
            <span class="product-unit">لكل ${p.unit}</span>
          </div>
          ${isAvailable ? `
            <button class="add-to-cart-btn" onclick="addToCart('${p.id}')">
              <i class="fa-solid fa-cart-plus"></i>
              <span>إضافة للطلب</span>
            </button>
          ` : `
            <button class="add-to-cart-btn" disabled style="background: var(--gray-300); cursor: not-allowed;">
              <span>غير متاح</span>
            </button>
          `}
        </div>
      </div>
    `;
    
    grid.appendChild(card);
  });
}

// Filter products based on search inputs
function filterProducts() {
  searchQuery = document.getElementById("searchInput").value.trim();
  renderProducts();
}

// Set category filter
function setCategory(category) {
  currentCategory = category;
  
  // Update Active Button Style
  const tabs = document.querySelectorAll(".category-tab");
  tabs.forEach(tab => {
    if (tab.getAttribute("data-category") === category) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }
  });
  
  renderProducts();
}

// Toggle Shopping Cart Drawer Open/Closed
function toggleCart(isOpen) {
  const overlay = document.getElementById("cartDrawerOverlay");
  const drawer = document.getElementById("cartDrawer");
  
  if (isOpen) {
    overlay.classList.add("open");
    drawer.classList.add("open");
  } else {
    overlay.classList.remove("open");
    drawer.classList.remove("open");
  }
}

// Add Item to Cart
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product || product.available === false) return;
  
  const cartItem = cart.find(item => item.product.id === productId);
  
  if (cartItem) {
    cartItem.quantity += 1;
  } else {
    cart.push({
      product: product,
      quantity: 1
    });
  }
  
  saveCartAndRefresh();
  showToast(`تمت إضافة "${product.name}" إلى الطلب!`);
}

// Change Quantity in Cart Drawer
if (typeof updateQty === "undefined") {
  window.updateQty = function(productId, amount) {
    const cartItem = cart.find(item => item.product.id === productId);
    if (!cartItem) return;
    
    cartItem.quantity += amount;
    
    if (cartItem.quantity <= 0) {
      cart = cart.filter(item => item.product.id !== productId);
      showToast(`تم إزالة الوجبة من سلة الطلب.`);
    }
    
    saveCartAndRefresh();
  }
}

// Remove item directly
if (typeof removeFromCart === "undefined") {
  window.removeFromCart = function(productId) {
    const cartItem = cart.find(item => item.product.id === productId);
    const name = cartItem ? cartItem.product.name : "الوجبة";
    cart = cart.filter(item => item.product.id !== productId);
    saveCartAndRefresh();
    showToast(`تم إزالة "${name}" من سلة الطلب.`);
  }
}

// Save Cart to Session & Update Screen elements
function saveCartAndRefresh() {
  sessionStorage.setItem("elnasr_shop_cart", JSON.stringify(cart));
  updateCartUI();
}

// Update Cart Badge, list of items, totals, and progress bar
function updateCartUI() {
  // Update header cart count
  const cartCount = document.getElementById("cartCount");
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartCount) cartCount.textContent = totalItems;
  
  // Render Items List
  const itemsContainer = document.getElementById("cartItemsList");
  const checkoutSection = document.getElementById("cartCheckoutSection");
  
  if (cart.length === 0) {
    if (itemsContainer) {
      itemsContainer.innerHTML = `
        <div class="cart-empty-message">
          <i class="fa-solid fa-basket-shopping"></i>
          <h3>سلة الطلبات فارغة حالياً</h3>
          <p>تصفح الوجبات في منيو النصر وأضف ما تشتهيه لتأكيد الطلب</p>
        </div>
      `;
    }
    if (checkoutSection) checkoutSection.style.display = "none";
    
    // Hide mobile sticky bar
    const stickyBar = document.getElementById("floatingCartBar");
    if (stickyBar) stickyBar.classList.remove("visible");
    
    // Update progress tracker
    updateShippingTracker(0);
    return;
  }
  
  if (checkoutSection) checkoutSection.style.display = "block";
  if (itemsContainer) {
    itemsContainer.innerHTML = "";
    
    cart.forEach(item => {
      const itemTotal = item.product.price * item.quantity;
      
      const div = document.createElement("div");
      div.className = "cart-item";
      div.innerHTML = `
        <div class="cart-item-details">
          <h4 class="cart-item-title">${item.product.name}</h4>
          <span class="cart-item-price">${item.product.price} ج × ${item.quantity} = <strong>${itemTotal} ج</strong></span>
        </div>
        <div class="cart-item-qty-control">
          <button onclick="window.updateQty('${item.product.id}', 1)">+</button>
          <span class="cart-item-qty-val">${item.quantity}</span>
          <button onclick="window.updateQty('${item.product.id}', -1)">-</button>
        </div>
        <button class="remove-cart-item-btn" onclick="window.removeFromCart('${item.product.id}')" title="حذف">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      `;
      itemsContainer.appendChild(div);
    });
  }
  
  let subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  // Update Mobile Sticky Bar info
  const stickyBar = document.getElementById("floatingCartBar");
  if (stickyBar) {
    stickyBar.classList.add("visible");
    const totalEl = document.getElementById("floatingCartTotal");
    const countEl = document.getElementById("floatingCartCount");
    if (totalEl) totalEl.textContent = `${subtotal} ج`;
    if (countEl) countEl.textContent = `${totalItems} وجبة في السلة`;
  }

  // Calculate totals
  const subtotalEl = document.getElementById("cartSubtotal");
  if (subtotalEl) subtotalEl.textContent = `${subtotal} ج`;
  
  // Update progress tracker
  updateShippingTracker(subtotal);
  
  // Recalculate shipping price
  calculateShippingPrice();
}

// Manage shipping price display
function calculateShippingPrice() {
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const citySelect = document.getElementById("custCity");
  const shippingText = document.getElementById("cartShipping");
  const totalText = document.getElementById("cartTotal");
  
  if (subtotal === 0) return;
  
  if (!citySelect || !citySelect.value) {
    if (shippingText) shippingText.textContent = "اختر المحافظة أولاً";
    if (totalText) totalText.textContent = `${subtotal} ج`;
    return;
  }
  
  let shippingCost = DEFAULT_SHIPPING_COST;
  let cityName = citySelect.value === "cairo" ? "القاهرة" : "الجيزة";
  
  if (subtotal >= FREE_SHIPPING_LIMIT) {
    shippingCost = 0;
    if (shippingText) shippingText.innerHTML = `<span style="color: var(--success-color); font-weight: 700;">مجاني 🎉</span>`;
  } else {
    if (shippingText) shippingText.textContent = `${shippingCost} ج (${cityName})`;
  }
  
  const finalTotal = subtotal + shippingCost;
  if (totalText) totalText.textContent = `${finalTotal} ج`;
}

// Update free shipping bar
function updateShippingTracker(subtotal) {
  const progress = document.getElementById("shippingTrackerProgress");
  const msg = document.getElementById("shippingTrackerMsg");
  const amount = document.getElementById("shippingTrackerAmount");
  
  if (subtotal === 0) {
    if (progress) progress.style.width = "0%";
    if (msg) msg.textContent = `أضف طلبات بقيمة ${FREE_SHIPPING_LIMIT}ج للحصول على توصيل مجاني`;
    if (amount) amount.textContent = `${FREE_SHIPPING_LIMIT} ج متبقية`;
    return;
  }
  
  const pct = Math.min((subtotal / FREE_SHIPPING_LIMIT) * 100, 100);
  if (progress) progress.style.width = `${pct}%`;
  
  if (subtotal >= FREE_SHIPPING_LIMIT) {
    if (msg) msg.innerHTML = `تهانينا! لقد حصلت على توصيل مجاني لأي مكان في القاهرة والجيزة <i class="fa-solid fa-gifts" style="color: var(--secondary-color);"></i>`;
    if (amount) amount.textContent = "شحن مجاني";
  } else {
    const diff = FREE_SHIPPING_LIMIT - subtotal;
    if (msg) msg.textContent = "متبقي للتوصيل المجاني:";
    if (amount) amount.textContent = `${diff} ج فقط`;
  }
}

// Handle Order Checkout to WhatsApp
function handleCheckout(event) {
  event.preventDefault();
  
  if (cart.length === 0) {
    showToast("سلتك فارغة، أضف وجبات لتجهيز الطلب", "danger");
    return;
  }
  
  const name = document.getElementById("custName").value.trim();
  const cityVal = document.getElementById("custCity").value;
  const address = document.getElementById("custAddress").value.trim();
  const phone = document.getElementById("custPhone").value.trim();
  
  if (!name || !cityVal || !address || !phone) {
    showToast("يرجى ملء جميع الحقول المطلوبة لتأكيد الطلب", "danger");
    return;
  }
  
  const cityName = cityVal === "cairo" ? "القاهرة" : "الجيزة";
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shippingCost = subtotal >= FREE_SHIPPING_LIMIT ? 0 : DEFAULT_SHIPPING_COST;
  const finalTotal = subtotal + shippingCost;
  
  // Format the WhatsApp message with rich emojis and clean line breaks
  let message = `السلام عليكم ورحمة الله وبركاته 😋\n\n`;
  message += `أود طلب الوجبات التالية من *حواوشي النصر* 🌯🔥:\n\n`;
  
  cart.forEach((item, index) => {
    const itemTotal = item.product.price * item.quantity;
    message += `🍽️ *${item.product.name}*\n`;
    message += `   السعر: ${item.product.price} ج × ${item.quantity} = *${itemTotal} ج* 🍴\n\n`;
  });
  
  message += `💵 *تفاصيل الحساب*:\n`;
  message += `🔸 إجمالي الوجبات: *${subtotal} ج*\n`;
  message += `🚚 خدمة التوصيل: ${shippingCost === 0 ? '*مجاناً 🎉*' : `*${shippingCost} ج* (${cityName})`}\n`;
  message += `💰 إجمالي الحساب الكلي: *${finalTotal} ج* 😋\n\n`;
  
  message += `📝 *بيانات التوصيل للعميل*:\n`;
  message += `👤 *الاسم*: ${name}\n`;
  message += `📍 *المنطقة*: ${cityName}\n`;
  message += `🏠 *العنوان بالتفصيل*: ${address}\n`;
  message += `📞 *رقم الهاتف*: ${phone}\n\n`;
  message += `وفي انتظار تجهيز الأوردر وتأكيده 🍔🔥`;
  
  // Encode URI text
  const encodedText = encodeURIComponent(message);
  
  // Create WhatsApp URL
  const waUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodedText}`;
  
  // Redirect directly via location.href to prevent popup blocking on mobile
  window.location.href = waUrl;
  
  // Clear cart and UI
  cart = [];
  saveCartAndRefresh();
  document.getElementById("checkoutForm").reset();
  toggleCart(false);
  
  showToast("تم تحويلك إلى الواتساب لإكمال وإرسال الطلب! شكراً لك.");
}

// Premium Toast Notification Helper
function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  
  const icon = type === "success" ? "fa-circle-check" : "fa-circle-exclamation";
  
  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${message}</span>
  `;
  
  container.appendChild(toast);
  
  // Animation Triggers
  setTimeout(() => {
    toast.classList.add("show");
  }, 10);
  
  // Remove after 3.5s
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3500);
}
