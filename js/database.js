// Hawawshi El Nasr Storefront Database Manager (with Supabase PostgreSQL Sync)

const DEFAULT_PRODUCTS = [
  // --- 1. Hawawshi (الحواوشي) ---
  { 
    id: "h1", 
    name: "حواوشي ساده (وسط)", 
    category: "hawawshi", 
    price: 50, 
    unit: "رغيف", 
    available: true, 
    description: "رغيف حواوشي بلدي ساده مميز بتتبيلة النصر الأصلية باللحم البلدي الطازج.",
    image: "assets/products/sada.jpg"
  },
  { 
    id: "h2", 
    name: "حواوشي ساده (كبير)", 
    category: "hawawshi", 
    price: 70, 
    unit: "رغيف", 
    available: true, 
    description: "رغيف حواوشي بلدي حجم كبير بتتبيلة النصر الأصلية باللحم البلدي الطازج.",
    image: "assets/products/sada.jpg"
  },
  { 
    id: "h3", 
    name: "حواوشي جبنة رومي", 
    category: "hawawshi", 
    price: 70, 
    unit: "رغيف", 
    available: true, 
    description: "حواوشي بلدي غني باللحم المتبل مغطى بالجبنة الرومي اللذيذة الذائبة.",
    image: "assets/products/cheddar.jpg"
  },
  { 
    id: "h4", 
    name: "حواوشي جبنة شيدر", 
    category: "hawawshi", 
    price: 80, 
    unit: "رغيف", 
    available: true, 
    description: "حواوشي بلدي باللحم البلدي مغطى بالجبنة الشيدر الفاخرة الذائبة.",
    image: "assets/products/cheddar.jpg"
  },
  { 
    id: "h5", 
    name: "حواوشي موتزاريلا", 
    category: "hawawshi", 
    price: 70, 
    unit: "رغيف", 
    available: true, 
    description: "حواوشي بلدي باللحم البلدي غني بجبنة الموتزاريلا المطاطية اللذيذة.",
    image: "assets/products/mozzarella.jpg"
  },
  { 
    id: "h6", 
    name: "حواوشي بسطرمه", 
    category: "hawawshi", 
    price: 70, 
    unit: "رغيف", 
    available: true, 
    description: "حواوشي بلدي بالبسطرمة الفاخرة والبهارات واللحم المفروم المميز.",
    image: "assets/products/pastirma.jpg"
  },
  { 
    id: "h7", 
    name: "حواوشي ميكس جبن", 
    category: "hawawshi", 
    price: 70, 
    unit: "رغيف", 
    available: true, 
    description: "حواوشي بلدي غني بخليط رائع من جبن الشيدر والموتزاريلا والرومي الذائبة.",
    image: "assets/products/mix_cheese.jpg"
  },
  { 
    id: "h8", 
    name: "حواوشي سجق", 
    category: "hawawshi", 
    price: 70, 
    unit: "رغيف", 
    available: true, 
    description: "حواوشي محشو بالسجق البلدي المتبل والبهارات والخضروات الطازجة.",
    image: "assets/products/mix_cheese.jpg"
  },

  // --- 2. Meat Papers (وجبات وورقات) ---
  { 
    id: "w1", 
    name: "ورقة لحمة", 
    category: "plates", 
    price: 150, 
    unit: "ورقة", 
    available: true, 
    description: "ورقة لحم بلدي مطبوخة بالخضروات الطازجة والبهارات والصلصة في الفرن.",
    image: "assets/products/waraq_lahma.jpg"
  },
  { 
    id: "w2", 
    name: "ورقة سجق", 
    category: "plates", 
    price: 140, 
    unit: "ورقة", 
    available: true, 
    description: "ورقة سجق بلدي مشوي بالبصل والفلفل والأعشاب والتوابل الشرقية.",
    image: "assets/products/waraq_sojoq.jpg"
  },
  { 
    id: "w3", 
    name: "ورقة كبدة", 
    category: "plates", 
    price: 150, 
    unit: "ورقة", 
    available: true, 
    description: "ورقة كبدة بلدي متبلة بالثوم وعصير الليمون والفلفل الحار والخلطة السرية.",
    image: "assets/products/waraq_kebda.jpg"
  }
];

const DB_KEY = "elnasr_shop_products";
const DB_VERSION_KEY = "elnasr_db_version";
const CURRENT_VERSION = "2"; // Cache version control

// Initialize Local Cache Database
function initDatabase() {
  const current = localStorage.getItem(DB_KEY);
  const version = localStorage.getItem(DB_VERSION_KEY);
  
  if (!current || version !== CURRENT_VERSION) {
    localStorage.setItem(DB_KEY, JSON.stringify(DEFAULT_PRODUCTS));
    localStorage.setItem(DB_VERSION_KEY, CURRENT_VERSION);
  }
}

// Get all products from local cache, and trigger background fetch from Supabase
function getProducts() {
  initDatabase();
  
  // Asynchronously sync from Supabase
  setTimeout(() => {
    fetchProductsFromSupabase();
  }, 100);

  try {
    return JSON.parse(localStorage.getItem(DB_KEY));
  } catch (e) {
    return DEFAULT_PRODUCTS;
  }
}

// Asynchronously fetch products from Supabase and update local storage & UI
async function fetchProductsFromSupabase() {
  if (typeof window.supabaseDb === "undefined" || !window.supabaseDb) {
    return;
  }
  
  try {
    const { data, error } = await window.supabaseDb.from("products").select("*");
    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.log("Supabase table is empty. Seeding default products...");
      const { error: seedError } = await window.supabaseDb.from("products").insert(DEFAULT_PRODUCTS);
      if (seedError) throw seedError;
      localStorage.setItem(DB_KEY, JSON.stringify(DEFAULT_PRODUCTS));
    } else {
      // Sort to keep consistent listing order
      data.sort((a, b) => a.id.localeCompare(b.id));
      
      const cacheStr = localStorage.getItem(DB_KEY);
      const fbProductsStr = JSON.stringify(data);
      
      if (cacheStr !== fbProductsStr) {
        localStorage.setItem(DB_KEY, fbProductsStr);
        window.dispatchEvent(new Event("productsUpdated"));
      }
    }
  } catch (error) {
    console.error("Supabase sync error:", error);
  }
}

// Save products to local storage & Supabase (batch upsert for edit/add/backup imports)
function saveProducts(productsList) {
  localStorage.setItem(DB_KEY, JSON.stringify(productsList));
  window.dispatchEvent(new Event("productsUpdated"));
  
  // Write to Supabase using upsert
  if (typeof window.supabaseDb !== "undefined" && window.supabaseDb) {
    window.supabaseDb.from("products").upsert(productsList)
      .then(({ error }) => {
        if (error) console.error("Supabase upsert error:", error);
      })
      .catch(e => console.error("Supabase upsert exception:", e));
  }
}

// Reset database to default (Clear Supabase table + Local cache)
function resetDatabase() {
  localStorage.setItem(DB_KEY, JSON.stringify(DEFAULT_PRODUCTS));
  window.dispatchEvent(new Event("productsUpdated"));
  
  if (typeof window.supabaseDb !== "undefined" && window.supabaseDb) {
    // Delete all products and insert defaults
    window.supabaseDb.from("products").delete().neq("id", "placeholder_val")
      .then(({ error }) => {
        if (error) throw error;
        return window.supabaseDb.from("products").insert(DEFAULT_PRODUCTS);
      })
      .then(({ error }) => {
        if (error) console.error("Supabase seed error during reset:", error);
      })
      .catch(e => console.error("Error resetting Supabase DB:", e));
  }
  
  return DEFAULT_PRODUCTS;
}

// Initialize on script load
initDatabase();
