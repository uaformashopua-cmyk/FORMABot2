/*
  FORMA
  Frontend for GitHub Pages + Supabase + Telegram Mini App.

  Important:
  - This file contains ONLY the Supabase publishable key.
  - Never put a Supabase secret/service_role key into this file.
*/

const SUPABASE_URL = "https://qdcnzraotcfdupmnapqo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_UGo_9Ma67h0WPZdbuBU_cw_FGHgUEHH";
const MANAGER_USERNAME = "Sundayass";

const FALLBACK_PRODUCTS = [
  {
    id: "demo-iphone-13",
    name: "iPhone 13",
    category: "iphone",
    price: 12999,
    memory: "128 GB",
    color: "Midnight",
    condition: "B/В",
    battery: "АКБ 91%",
    warranty: "3 місяці",
    available: true,
    image: ""
  },
  {
    id: "demo-iphone-14",
    name: "iPhone 14",
    category: "iphone",
    price: 15999,
    memory: "128 GB",
    color: "Blue",
    condition: "B/В",
    battery: "АКБ 94%",
    warranty: "3 місяці",
    available: true,
    image: ""
  },
  {
    id: "demo-iphone-15",
    name: "iPhone 15",
    category: "iphone",
    price: 23999,
    memory: "128 GB",
    color: "Black",
    condition: "Новий",
    battery: "АКБ 100%",
    warranty: "12 місяців",
    available: true,
    image: ""
  },
  {
    id: "demo-start",
    name: "FORMA START",
    category: "pc",
    price: 24999,
    cpu: "Ryzen 5",
    gpu: "RTX 4060",
    ram: "16 GB",
    storage: "1 TB",
    warranty: "12 місяців",
    available: true,
    image: ""
  },
  {
    id: "demo-pro",
    name: "FORMA PRO",
    category: "pc",
    price: 39999,
    cpu: "Ryzen 7",
    gpu: "RTX 4070",
    ram: "32 GB",
    storage: "1 TB",
    warranty: "12 місяців",
    available: true,
    image: ""
  },
  {
    id: "demo-ultra",
    name: "FORMA ULTRA",
    category: "pc",
    price: 59999,
    cpu: "Ryzen 9",
    gpu: "RTX 4080",
    ram: "64 GB",
    storage: "2 TB",
    warranty: "24 місяці",
    available: true,
    image: ""
  }
];

let supabaseClient = null;
let products = [];
let currentPage = "home";
let currentCategory = null;

const app = document.getElementById("app");

function formatPrice(value) {
  const number = Number(value || 0);
  return new Intl.NumberFormat("uk-UA").format(number) + " грн";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeCategory(value) {
  const v = String(value || "").toLowerCase().trim();

  if (["iphone", "айфон", "iPhone".toLowerCase()].includes(v)) return "iphone";
  if (["pc", "комп'ютери", "компьютеры", "computer", "computers"].includes(v)) return "pc";

  return v || "other";
}

function categoryLabel(category) {
  return normalizeCategory(category) === "iphone" ? "iPhone" : "PC";
}

function productIcon(product) {
  return normalizeCategory(product.category) === "iphone" ? "📱" : "🖥️";
}

function productImage(product, detail = false) {
  const image = String(product.image || "").trim();

  if (image) {
    return `
      <div class="${detail ? "detail-image" : "product-image"}">
        <img src="${escapeHtml(image)}"
             alt="${escapeHtml(product.name)}"
             loading="${detail ? "eager" : "lazy"}"
             onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=&quot;${detail ? "detail-placeholder" : "product-placeholder"}&quot;>${productIcon(product)}</div>';">
      </div>
    `;
  }

  return `
    <div class="${detail ? "detail-image" : "product-image"}">
      <div class="${detail ? "detail-placeholder" : "product-placeholder"}">${productIcon(product)}</div>
    </div>
  `;
}

function telegramInit() {
  try {
    const tg = window.Telegram?.WebApp;

    if (!tg) return;

    tg.ready();
    tg.expand();

    if (tg.setHeaderColor) tg.setHeaderColor("#0b0b0d");
    if (tg.setBackgroundColor) tg.setBackgroundColor("#0b0b0d");
  } catch (error) {
    console.warn("Telegram init:", error);
  }
}

async function initSupabase() {
  try {
    if (!window.supabase?.createClient) {
      console.warn("Supabase CDN не завантажився.");
      return false;
    }

    supabaseClient = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY
    );

    return true;
  } catch (error) {
    console.error("Supabase init error:", error);
    supabaseClient = null;
    return false;
  }
}

async function loadProducts() {
  if (!supabaseClient) {
    products = FALLBACK_PRODUCTS.map(p => ({ ...p }));
    return;
  }

  try {
    const { data, error } = await supabaseClient
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase products error:", error);
      products = FALLBACK_PRODUCTS.map(p => ({ ...p }));
      showToast("Базу не вдалося завантажити. Показую резервні товари.");
      return;
    }

    products = Array.isArray(data)
      ? data.map(p => ({ ...p, category: normalizeCategory(p.category) }))
      : [];

    if (!products.length) {
      products = FALLBACK_PRODUCTS.map(p => ({ ...p }));
      showToast("У базі поки немає товарів. Показую демо-товари.");
    }
  } catch (error) {
    console.error("Products load exception:", error);
    products = FALLBACK_PRODUCTS.map(p => ({ ...p }));
  }
}

function getProduct(id) {
  return products.find(p => String(p.id) === String(id));
}

function productMeta(product) {
  const category = normalizeCategory(product.category);

  if (category === "iphone") {
    return [
      product.memory,
      product.color,
      product.condition
    ].filter(Boolean).join(" • ");
  }

  return [
    product.cpu,
    product.gpu,
    product.ram,
    product.storage
  ].filter(Boolean).join(" • ");
}

function renderProductCard(product) {
  const available = product.available !== false;

  return `
    <article class="product-card" onclick="openProduct('${escapeHtml(product.id)}')">
      ${productImage(product)}
      <div class="product-info">
        <div class="product-name">${escapeHtml(product.name)}</div>
        <div class="product-price">${formatPrice(product.price)}</div>
        <div class="product-meta">${escapeHtml(productMeta(product) || categoryLabel(product.category))}</div>
        <div class="badge ${available ? "" : "off"}">
          ${available ? "В наявності" : "Немає в наявності"}
        </div>
      </div>
    </article>
  `;
}

function renderHeader(title = "FORMA", subtitle = "iPhone • PC") {
  return `
    <header class="header">
      <div class="header-row">
        <div>
          <div class="brand">${escapeHtml(title)}</div>
          <div class="header-subtitle">${escapeHtml(subtitle)}</div>
        </div>
        <button class="header-action" onclick="openManager()" aria-label="Написати менеджеру">💬</button>
      </div>
    </header>
  `;
}

function renderNav(active) {
  return `
    <nav class="bottom-nav">
      <button class="nav-btn ${active === "home" ? "active" : ""}" onclick="goHome()">
        <span class="icon">⌂</span>
        <span>Головна</span>
      </button>
      <button class="nav-btn ${active === "catalog" ? "active" : ""}" onclick="showCatalog()">
        <span class="icon">◫</span>
        <span>Каталог</span>
      </button>
      <button class="nav-btn ${active === "profile" ? "active" : ""}" onclick="showProfile()">
        <span class="icon">●</span>
        <span>Профіль</span>
      </button>
    </nav>
  `;
}

function renderHome() {
  currentPage = "home";
  currentCategory = null;

  app.innerHTML = `
    <div class="shell">
      ${renderHeader()}
      <main class="content">
        <section class="hero">
          <div class="hero-kicker">ОРИГІНАЛЬНИЙ МАГАЗИН FORMA</div>
          <h1>Техніка без зайвого.</h1>
          <p>iPhone та готові ПК-збірки. Обирай товар, дивись характеристики та пиши менеджеру.</p>
        </section>

        <div class="section-title">
          <h2>Категорії</h2>
          <span>${products.length} товарів</span>
        </div>

        <section class="category-grid">
          <button class="category-card" onclick="showCategory('iphone')">
            <div class="category-icon">📱</div>
            <strong>iPhone</strong>
            <span>${products.filter(p => normalizeCategory(p.category) === "iphone").length} товарів</span>
          </button>

          <button class="category-card" onclick="showCategory('pc')">
            <div class="category-icon">🖥️</div>
            <strong>PC</strong>
            <span>${products.filter(p => normalizeCategory(p.category) === "pc").length} збірок</span>
          </button>
        </section>

        <div class="section-title">
          <h2>Товари</h2>
          <span>FORMA</span>
        </div>

        <section class="product-grid">
          ${products.length ? products.slice(0, 6).map(renderProductCard).join("") : `
            <div class="empty" style="grid-column:1/-1">Товарів поки немає.</div>
          `}
        </section>
      </main>
      ${renderNav("home")}
    </div>
  `;
}

function renderCatalog() {
  currentPage = "catalog";

  const title = currentCategory
    ? categoryLabel(currentCategory)
    : "Каталог";

  const visible = currentCategory
    ? products.filter(p => normalizeCategory(p.category) === normalizeCategory(currentCategory))
    : products;

  app.innerHTML = `
    <div class="shell">
      ${renderHeader(title, currentCategory ? "FORMA" : "iPhone • PC")}
      <main class="content">
        <div class="back-row">
          <button class="back-btn" onclick="goHome()">←</button>
          <h1 class="page-title">${escapeHtml(title)}</h1>
        </div>

        ${!currentCategory ? `
          <div class="category-grid" style="margin-bottom:18px">
            <button class="category-card" onclick="showCategory('iphone')">
              <div class="category-icon">📱</div>
              <strong>iPhone</strong>
              <span>Смартфони</span>
            </button>
            <button class="category-card" onclick="showCategory('pc')">
              <div class="category-icon">🖥️</div>
              <strong>PC</strong>
              <span>Готові збірки</span>
            </button>
          </div>
        ` : ""}

        <section class="product-grid">
          ${visible.length
            ? visible.map(renderProductCard).join("")
            : `<div class="empty" style="grid-column:1/-1">У цій категорії товарів немає.</div>`
          }
        </section>
      </main>
      ${renderNav("catalog")}
    </div>
  `;
}

function renderProduct(product) {
  currentPage = "product";

  const category = normalizeCategory(product.category);
  const available = product.available !== false;

  const specs = category === "iphone"
    ? [
        ["Категорія", "iPhone"],
        ["Пам'ять", product.memory],
        ["Колір", product.color],
        ["Стан", product.condition],
        ["Акумулятор", product.battery],
        ["Гарантія", product.warranty]
      ]
    : [
        ["Категорія", "PC"],
        ["Процесор", product.cpu],
        ["Відеокарта", product.gpu],
        ["Оперативна пам'ять", product.ram],
        ["Накопичувач", product.storage],
        ["Гарантія", product.warranty]
      ];

  app.innerHTML = `
    <div class="shell">
      ${renderHeader("FORMA", "Товар")}
      <main class="content">
        <div class="back-row">
          <button class="back-btn" onclick="goBackFromProduct()">←</button>
          <h1 class="page-title">Товар</h1>
        </div>

        ${productImage(product, true)}

        <section class="detail-card">
          <h2 class="detail-name">${escapeHtml(product.name)}</h2>
          <div class="detail-price">${formatPrice(product.price)}</div>

          <div class="specs">
            ${specs
              .filter(([, value]) => value)
              .map(([label, value]) => `
                <div class="spec-row">
                  <span class="spec-label">${escapeHtml(label)}</span>
                  <span class="spec-value">${escapeHtml(value)}</span>
                </div>
              `).join("")}
          </div>

          <div class="badge ${available ? "" : "off"}">
            ${available ? "В наявності" : "Немає в наявності"}
          </div>

          <button class="primary-btn"
                  ${available ? "" : "disabled"}
                  onclick="buyProduct('${escapeHtml(product.id)}')">
            ${available ? "ХОЧУ ПРИДБАТИ" : "НЕМАЄ В НАЯВНОСТІ"}
          </button>

          <button class="secondary-btn" onclick="openManager('${escapeHtml(product.id)}')">
            Написати менеджеру
          </button>
        </section>
      </main>
      ${renderNav("")}
    </div>
  `;
}

function renderProfile() {
  currentPage = "profile";
  currentCategory = null;

  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const name = tgUser
    ? [tgUser.first_name, tgUser.last_name].filter(Boolean).join(" ")
    : "Користувач Telegram";

  app.innerHTML = `
    <div class="shell">
      ${renderHeader("FORMA", "Профіль")}
      <main class="content">
        <section class="profile-card">
          <div class="profile-avatar">👤</div>
          <div class="profile-name">${escapeHtml(name)}</div>
          <div class="profile-note">
            Тут можна буде додати історію замовлень, обране та інші функції.
          </div>
          <div class="status">
            Магазин підключений до Supabase
          </div>
        </section>

        <button class="primary-btn" onclick="openManager()">
          Зв'язатися з менеджером
        </button>
      </main>
      ${renderNav("profile")}
    </div>
  `;
}

function showCatalog() {
  currentCategory = null;
  renderCatalog();
}

function showCategory(category) {
  currentCategory = normalizeCategory(category);
  renderCatalog();
}

function openProduct(id) {
  const product = getProduct(id);

  if (!product) {
    showToast("Товар не знайдено.");
    return;
  }

  renderProduct(product);
  window.scrollTo({ top: 0, behavior: "instant" });
}

function goHome() {
  renderHome();
  window.scrollTo({ top: 0, behavior: "instant" });
}

function showProfile() {
  renderProfile();
  window.scrollTo({ top: 0, behavior: "instant" });
}

function goBackFromProduct() {
  if (currentCategory) {
    renderCatalog();
  } else {
    renderHome();
  }
}

function makeTelegramUrl(product) {
  const text = product
    ? `Привіт! Хочу придбати ${product.name} за ${formatPrice(product.price)}. Підкажіть, будь ласка, щодо наявності та оформлення замовлення.`
    : "Привіт! Хочу придбати товар у FORMA. Підкажіть, будь ласка, що зараз є в наявності.";

  return `https://t.me/${MANAGER_USERNAME}?text=${encodeURIComponent(text)}`;
}

function openManager(productId = null) {
  const product = productId ? getProduct(productId) : null;
  const url = makeTelegramUrl(product);

  try {
    window.Telegram?.WebApp?.openTelegramLink?.(url);
  } catch (error) {
    console.warn("Telegram link error:", error);
  }

  setTimeout(() => {
    window.open(url, "_blank");
  }, 150);
}

function buyProduct(productId) {
  const product = getProduct(productId);

  if (!product) {
    showToast("Товар не знайдено.");
    return;
  }

  if (product.available === false) {
    showToast("Цей товар зараз недоступний.");
    return;
  }

  openManager(productId);
}

let toastTimer = null;

function showToast(message) {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("show"));

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 220);
  }, 3000);
}

function renderFatalError(error) {
  console.error("FORMA fatal error:", error);

  app.innerHTML = `
    <div class="error-screen">
      <div class="boot-logo">FORMA</div>
      <div class="error-text">
        Щось пішло не так під час запуску магазину.
      </div>
      <button class="primary-btn" style="max-width:320px" onclick="location.reload()">
        ОНОВИТИ
      </button>
    </div>
  `;
}

async function startApp() {
  try {
    telegramInit();

    await initSupabase();
    await loadProducts();

    renderHome();
  } catch (error) {
    renderFatalError(error);
  }
}

window.goHome = goHome;
window.showCatalog = showCatalog;
window.showCategory = showCategory;
window.showProfile = showProfile;
window.openProduct = openProduct;
window.buyProduct = buyProduct;
window.openManager = openManager;
window.goBackFromProduct = goBackFromProduct;

document.addEventListener("DOMContentLoaded", startApp);
