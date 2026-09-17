/* ============================================================
   TechSmart — Product data layer
   ------------------------------------------------------------
   Products live in the browser's localStorage so the admin
   panel can add/edit/delete them with no server or database.
   The array below is only the STARTING catalogue — the first
   time the site loads on a browser, it is copied into
   localStorage. After that, localStorage is the source of
   truth on that browser/device.

   IMPORTANT (read the README): localStorage is per-browser,
   per-device. Edits made in the admin panel on your shop PC
   will not automatically show up for a customer browsing on
   their own phone unless you wire up a real backend. See
   README.md → "Making product changes visible to everyone"
   for the two easy ways to fix that (free options included).
   ============================================================ */

const TS_STORAGE_KEY = 'techsmart_products_v1';
const TS_LEADS_KEY    = 'techsmart_leads_v1';

const TS_DEFAULT_PRODUCTS = [
  {
    id: 'lap-hp-01',
    category: 'laptop',
    brand: 'HP',
    model: 'HP 15 Core i5 12th Gen',
    configuration: 'Intel Core i5-1235U, 8GB RAM, 512GB SSD, 15.6" FHD, Windows 11, Integrated Graphics',
    price: 1,
    status: 'available',
    featured: true,
    image: ''
  },
  {
    id: 'lap-lenovo-01',
    category: 'laptop',
    brand: 'Lenovo',
    model: 'Lenovo IdeaPad Slim 3',
    configuration: 'AMD Ryzen 5 7520U, 16GB RAM, 512GB SSD, 15.6" FHD IPS, Windows 11 Home',
    price: 42990,
    status: 'available',
    featured: true,
    image: ''
  },
  {
    id: 'lap-dell-01',
    category: 'laptop',
    brand: 'Dell',
    model: 'Dell Vostro 3520',
    configuration: 'Intel Core i3-1215U, 8GB RAM, 512GB SSD, 15.6" FHD, Windows 11, MS Office',
    price: 38990,
    status: 'available',
    featured: false,
    image: ''
  },
  {
    id: 'lap-acer-01',
    category: 'laptop',
    brand: 'Acer',
    model: 'Acer Aspire Lite',
    configuration: 'Intel Core i3-1115G4, 8GB RAM, 256GB SSD, 15.6" FHD, Windows 11 Home',
    price: 32990,
    status: 'available',
    featured: false,
    image: ''
  },
  {
    id: 'lap-asus-01',
    category: 'laptop',
    brand: 'Asus',
    model: 'Asus VivoBook 15',
    configuration: 'Intel Core i5-1334U, 16GB RAM, 512GB SSD, 15.6" FHD OLED, Windows 11',
    price: 54990,
    status: 'out',
    featured: false,
    image: ''
  },
  {
    id: 'lap-hp-02',
    category: 'laptop',
    brand: 'HP',
    model: 'HP Victus Gaming 15',
    configuration: 'Intel Core i5-13420H, 16GB RAM, 512GB SSD, RTX 3050 6GB, 15.6" FHD 144Hz',
    price: 68990,
    status: 'available',
    featured: true,
    image: ''
  },
  {
    id: 'pr-canon-01',
    category: 'printer',
    brand: 'Canon',
    model: 'Canon PIXMA G3020',
    configuration: 'All-in-One Ink Tank, Print • Scan • Copy, Wi-Fi, Borderless Photo Printing',
    price: 16999,
    status: 'available',
    featured: true,
    image: ''
  },
  {
    id: 'pr-epson-01',
    category: 'printer',
    brand: 'Epson',
    model: 'Epson EcoTank L3250',
    configuration: 'All-in-One Ink Tank, Print • Scan • Copy, Wi-Fi & Mobile Print',
    price: 18499,
    status: 'available',
    featured: true,
    image: ''
  },
  {
    id: 'pr-hp-01',
    category: 'printer',
    brand: 'HP',
    model: 'HP Smart Tank 580',
    configuration: 'All-in-One Ink Tank, Print • Scan • Copy, Wi-Fi Direct, Auto Duplex',
    price: 15999,
    status: 'available',
    featured: false,
    image: ''
  },
  {
    id: 'pr-canon-02',
    category: 'printer',
    brand: 'Canon',
    model: 'Canon imageCLASS MF createdBy 3018',
    configuration: 'Laser All-in-One, Print • Scan • Copy, Mono Laser, Compact Design',
    price: 13999,
    status: 'out',
    featured: false,
    image: ''
  },
  {
    id: 'pr-epson-02',
    category: 'printer',
    brand: 'Epson',
    model: 'Epson L120',
    configuration: 'Single Function Ink Tank Printer, High Volume Printing, USB',
    price: 10999,
    status: 'available',
    featured: false,
    image: ''
  }
];

const TSData = (function () {
  function _readRaw() {
    try {
      const raw = localStorage.getItem(TS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('TechSmart: could not read product storage', e);
      return null;
    }
  }

  function _write(list) {
    try {
      localStorage.setItem(TS_STORAGE_KEY, JSON.stringify(list));
      return true;
    } catch (e) {
      console.warn('TechSmart: could not save products (storage full or unavailable)', e);
      return false;
    }
  }

  function init() {
    const existing = _readRaw();
    if (!existing) {
      _write(TS_DEFAULT_PRODUCTS);
    }
  }

  function getAll() {
    return _readRaw() || TS_DEFAULT_PRODUCTS.slice();
  }

  function getByCategory(category) {
    return getAll().filter(p => p.category === category);
  }

  function getById(id) {
    return getAll().find(p => p.id === id) || null;
  }

  function getFeatured(limit) {
    const feats = getAll().filter(p => p.featured && p.status === 'available');
    return limit ? feats.slice(0, limit) : feats;
  }

  function save(product) {
    const list = getAll();
    const idx = list.findIndex(p => p.id === product.id);
    if (idx > -1) {
      list[idx] = product;
    } else {
      list.unshift(product);
    }
    return _write(list);
  }

  function remove(id) {
    const list = getAll().filter(p => p.id !== id);
    return _write(list);
  }

  function resetToDefaults() {
    return _write(TS_DEFAULT_PRODUCTS.slice());
  }

  function makeId(category) {
    return category + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function fmtPrice(n) {
    const num = Number(n) || 0;
    return '₹' + num.toLocaleString('en-IN');
  }

  /* ---- Service / contact leads (also stored locally so the
     owner can see recent enquiries even without email set up) ---- */
  function saveLead(lead) {
    try {
      const list = JSON.parse(localStorage.getItem(TS_LEADS_KEY) || '[]');
      list.unshift(Object.assign({ id: Date.now(), date: new Date().toISOString() }, lead));
      localStorage.setItem(TS_LEADS_KEY, JSON.stringify(list.slice(0, 200)));
    } catch (e) { /* non-fatal */ }
  }

  function getLeads() {
    try { return JSON.parse(localStorage.getItem(TS_LEADS_KEY) || '[]'); }
    catch (e) { return []; }
  }

  return {
    init, getAll, getByCategory, getById, getFeatured,
    save, remove, resetToDefaults, makeId, fmtPrice,
    saveLead, getLeads
  };
})();

TSData.init();
