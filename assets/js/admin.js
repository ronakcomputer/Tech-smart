/* ============================================================
   TechSmart — Admin panel logic
   ------------------------------------------------------------
   This is a CLIENT-SIDE ONLY admin panel: there is no server,
   so "login" is just a screen-lock to stop casual visitors
   from opening the panel — it is NOT secure against someone
   determined who can read the page source. Do not use this
   panel for anything beyond simple stock/price updates on a
   browser you trust. See README.md for how to add real,
   server-side security if you ever need it.
   ============================================================ */

const TS_ADMIN_PASS_KEY = 'techsmart_admin_pass_v1';
const TS_ADMIN_SESSION_KEY = 'techsmart_admin_session_v1';
const TS_DEFAULT_PASSWORD = 'techsmart2026';

document.addEventListener('DOMContentLoaded', function () {
  ts_injectYear();
  ts_adminInitAuth();
  ts_wireLoginForm();
  ts_wireLogout();
  ts_wireProductForm();
  ts_wireChangePassword();
  ts_wireResetCatalogue();
  ts_wireImagePreview();

  if (ts_isLoggedIn()) {
    ts_showDashboard();
  }
});

/* ---------------- Auth (screen-lock only) ---------------- */

function ts_getAdminPassword() {
  return localStorage.getItem(TS_ADMIN_PASS_KEY) || TS_DEFAULT_PASSWORD;
}

function ts_isLoggedIn() {
  return sessionStorage.getItem(TS_ADMIN_SESSION_KEY) === 'yes';
}

function ts_adminInitAuth() {
  const hint = document.getElementById('loginHint');
  if (hint) hint.textContent = 'Default password: ' + TS_DEFAULT_PASSWORD + ' (change it after logging in)';
}

function ts_wireLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const val = document.getElementById('loginPassword').value;
    const err = document.getElementById('loginError');
    if (val === ts_getAdminPassword()) {
      sessionStorage.setItem(TS_ADMIN_SESSION_KEY, 'yes');
      err.style.display = 'none';
      ts_showDashboard();
    } else {
      err.style.display = 'block';
    }
  });
}

function ts_wireLogout() {
  const btn = document.getElementById('logoutBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    sessionStorage.removeItem(TS_ADMIN_SESSION_KEY);
    location.reload();
  });
}

function ts_showDashboard() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';
  ts_renderAdminTable();
  ts_renderLeads();
  ts_renderStats();
}

/* ---------------- Product table ---------------- */

let ts_editingId = null;

function ts_renderStats() {
  const all = TSData.getAll();
  const laptops = all.filter(p => p.category === 'laptop').length;
  const printers = all.filter(p => p.category === 'printer').length;
  const outOfStock = all.filter(p => p.status === 'out').length;
  document.getElementById('statLaptops').textContent = laptops;
  document.getElementById('statPrinters').textContent = printers;
  document.getElementById('statOut').textContent = outOfStock;
  document.getElementById('statTotal').textContent = all.length;
}

function ts_renderAdminTable() {
  const tbody = document.getElementById('adminTableBody');
  const catFilter = document.getElementById('adminFilterCategory').value;
  let list = TSData.getAll();
  if (catFilter) list = list.filter(p => p.category === catFilter);

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="admin-empty">No products yet. Click "Add Product" to create your first listing.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(p => `
    <tr>
      <td class="admin-cell-img"><img src="${p.image && p.image.trim() ? p.image : ts_placeholderFor(p.category)}" alt=""></td>
      <td>
        <strong>${ts_escape(p.model)}</strong><br>
        <span class="admin-muted">${ts_escape(p.brand)} · ${p.category === 'laptop' ? 'Laptop' : 'Printer'}</span>
      </td>
      <td class="admin-muted admin-config-cell">${ts_escape(p.configuration)}</td>
      <td><strong>${TSData.fmtPrice(p.price)}</strong></td>
      <td><span class="admin-pill ${p.status === 'available' ? 'admin-pill-ok' : 'admin-pill-out'}">${p.status === 'available' ? 'Available' : 'Out of Stock'}</span></td>
      <td class="admin-actions-cell">
        <button class="btn btn-ghost btn-sm" onclick="ts_editProduct('${p.id}')">Edit</button>
        <button class="btn btn-sm admin-btn-delete" onclick="ts_deleteProduct('${p.id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  const filter = document.getElementById('adminFilterCategory');
  if (filter) filter.addEventListener('change', ts_renderAdminTable);
  const addBtn = document.getElementById('addProductBtn');
  if (addBtn) addBtn.addEventListener('click', () => ts_openProductModal());
});

function ts_openProductModal(id) {
  ts_editingId = id || null;
  const modal = document.getElementById('productModal');
  const form = document.getElementById('productForm');
  form.reset();
  document.getElementById('imgPreview').style.display = 'none';
  document.getElementById('productModalTitle').textContent = id ? 'Edit Product' : 'Add Product';

  if (id) {
    const p = TSData.getById(id);
    if (!p) return;
    form.category.value = p.category;
    form.brand.value = p.brand;
    form.model.value = p.model;
    form.configuration.value = p.configuration;
    form.price.value = p.price;
    form.status.value = p.status;
    form.featured.checked = !!p.featured;
    form.image.value = p.image || '';
    if (p.image) {
      document.getElementById('imgPreview').src = p.image;
      document.getElementById('imgPreview').style.display = 'block';
    }
  }
  modal.classList.add('open');
}

function ts_closeProductModal() {
  document.getElementById('productModal').classList.remove('open');
  ts_editingId = null;
}

function ts_editProduct(id) { ts_openProductModal(id); }

function ts_deleteProduct(id) {
  const p = TSData.getById(id);
  if (!p) return;
  if (!confirm(`Delete "${p.model}"? This cannot be undone.`)) return;
  TSData.remove(id);
  ts_renderAdminTable();
  ts_renderStats();
}

function ts_wireProductForm() {
  const form = document.getElementById('productForm');
  if (!form) return;

  document.querySelectorAll('[data-close-product-modal]').forEach(btn =>
    btn.addEventListener('click', ts_closeProductModal)
  );
  document.getElementById('productModal').addEventListener('click', (e) => {
    if (e.target.id === 'productModal') ts_closeProductModal();
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const fd = new FormData(form);
    const product = {
      id: ts_editingId || TSData.makeId(fd.get('category')),
      category: fd.get('category'),
      brand: fd.get('brand').trim(),
      model: fd.get('model').trim(),
      configuration: fd.get('configuration').trim(),
      price: Number(fd.get('price')) || 0,
      status: fd.get('status'),
      featured: fd.get('featured') === 'on',
      image: fd.get('image') || ''
    };
    if (!product.brand || !product.model || !product.configuration || !product.price) return;

    const ok = TSData.save(product);
    if (!ok) {
      alert('Could not save — the image may be too large for browser storage. Try a smaller photo (under ~500KB) or paste an image URL instead.');
      return;
    }
    ts_closeProductModal();
    ts_renderAdminTable();
    ts_renderStats();
  });
}

function ts_wireImagePreview() {
  const fileInput = document.getElementById('imgFile');
  const urlInput = document.querySelector('#productForm [name="image"]');
  const preview = document.getElementById('imgPreview');
  if (!fileInput) return;

  fileInput.addEventListener('change', function () {
    const file = fileInput.files[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) {
      alert('Please choose an image smaller than 1.5MB for best performance.');
      fileInput.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
      urlInput.value = e.target.result;
      preview.src = e.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  });

  urlInput.addEventListener('input', function () {
    if (urlInput.value.trim()) {
      preview.src = urlInput.value.trim();
      preview.style.display = 'block';
    } else {
      preview.style.display = 'none';
    }
  });
}

function ts_wireResetCatalogue() {
  const btn = document.getElementById('resetCatalogueBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    if (!confirm('Reset the catalogue back to the sample starter products? Your custom products/edits will be lost.')) return;
    TSData.resetToDefaults();
    ts_renderAdminTable();
    ts_renderStats();
  });
}

/* ---------------- Change admin password ---------------- */

function ts_wireChangePassword() {
  const form = document.getElementById('passwordForm');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const current = document.getElementById('currentPassword').value;
    const next = document.getElementById('newPassword').value;
    const msg = document.getElementById('passwordMsg');
    if (current !== ts_getAdminPassword()) {
      msg.textContent = 'Current password is incorrect.';
      msg.className = 'form-note admin-msg-error';
      return;
    }
    if (next.length < 6) {
      msg.textContent = 'New password should be at least 6 characters.';
      msg.className = 'form-note admin-msg-error';
      return;
    }
    localStorage.setItem(TS_ADMIN_PASS_KEY, next);
    msg.textContent = 'Password updated for this browser.';
    msg.className = 'form-note admin-msg-ok';
    form.reset();
  });
}

/* ---------------- Leads / enquiries viewer ---------------- */

function ts_renderLeads() {
  const wrap = document.getElementById('leadsList');
  if (!wrap) return;
  const leads = TSData.getLeads();
  if (!leads.length) {
    wrap.innerHTML = '<div class="admin-empty">No enquiries recorded on this browser yet. Enquiries appear here after a customer submits the WhatsApp or service form on this device.</div>';
    return;
  }
  wrap.innerHTML = leads.slice(0, 30).map(l => `
    <div class="lead-row">
      <div>
        <strong>${ts_escape(l.name || '—')}</strong>
        <span class="admin-muted"> · ${ts_escape(l.phone || '')}</span>
        <div class="admin-muted lead-detail">
          ${l.type === 'product' ? 'Product enquiry: ' + ts_escape(l.product || '') : ''}
          ${l.type === 'service' ? 'Service: ' + ts_escape(l.device || '') + ' — ' + ts_escape(l.issue || '') : ''}
          ${l.type === 'contact' ? 'Message: ' + ts_escape(l.message || '') : ''}
        </div>
      </div>
      <span class="admin-muted lead-date">${new Date(l.date).toLocaleString('en-IN')}</span>
    </div>
  `).join('');
}
