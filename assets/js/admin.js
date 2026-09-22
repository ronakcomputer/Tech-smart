/* ============================================================
   TechSmart — Admin panel logic
   ------------------------------------------------------------
   Access is protected by Firebase Authentication (Google
   Sign-In). Anyone can attempt to sign in with a Google
   account, but only the email address(es) listed in
   TS_ADMIN_ALLOWED_EMAILS (assets/js/firebase-config.js) are
   let into the dashboard — everyone else is signed out
   immediately. For this to also be enforced on the database
   side (not just hidden in the browser), make sure your
   Firestore security rules check request.auth.token.email
   against the same list — see README.md.
   ============================================================ */

let ts_currentUser = null;

document.addEventListener('DOMContentLoaded', function () {
  ts_injectYear();
  ts_wireGoogleSignIn();
  ts_wireLogout();
  ts_wireProductForm();
  ts_wireResetCatalogue();
  ts_wireImagePreview();
  ts_watchAuthState();
});

/* ---------------- Auth (Firebase Authentication — Google Sign-In) ---------------- */

function ts_isAllowedEmail(email) {
  return !!email && typeof TS_ADMIN_ALLOWED_EMAILS !== 'undefined' &&
    TS_ADMIN_ALLOWED_EMAILS.map(e => e.toLowerCase()).includes(email.toLowerCase());
}

function ts_watchAuthState() {
  if (typeof firebase === 'undefined' || !firebase.auth) {
    console.warn('TechSmart: Firebase Auth failed to load — check your internet connection and firebase-config.js.');
    return;
  }
  firebase.auth().onAuthStateChanged(function (user) {
    if (user && ts_isAllowedEmail(user.email)) {
      ts_currentUser = user;
      document.getElementById('loginError').style.display = 'none';
      ts_showDashboard(user);
    } else if (user) {
      // Signed in with Google, but this email isn't authorised.
      ts_currentUser = null;
      firebase.auth().signOut();
      document.getElementById('loginError').style.display = 'block';
      ts_showLoginScreen();
    } else {
      ts_currentUser = null;
      ts_showLoginScreen();
    }
  });
}

function ts_wireGoogleSignIn() {
  const btn = document.getElementById('googleSignInBtn');
  if (!btn) return;
  btn.addEventListener('click', function () {
    if (typeof firebase === 'undefined' || !firebase.auth) {
      document.getElementById('loginStatusMsg').textContent = 'Sign-in isn\'t available right now — check your internet connection.';
      return;
    }
    btn.disabled = true;
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).catch(function (err) {
      console.warn('TechSmart: Google sign-in failed', err);
      document.getElementById('loginStatusMsg').textContent =
        err.code === 'auth/popup-closed-by-user' ? '' : 'Sign-in failed — please try again.';
    }).finally(function () { btn.disabled = false; });
  });
}

function ts_wireLogout() {
  ['logoutBtn', 'settingsLogoutBtn'].forEach(function (id) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('click', () => { firebase.auth().signOut(); });
  });
}

function ts_showLoginScreen() {
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('dashboard').style.display = 'none';
  document.getElementById('adminUserBadge').style.display = 'none';
}

function ts_showDashboard(user) {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';

  // Show who's currently logged in, in the topbar and the Settings tab.
  const badge = document.getElementById('adminUserBadge');
  badge.style.display = 'flex';
  document.getElementById('adminUserPhoto').src = user.photoURL || '../assets/img/logo.png';
  document.getElementById('adminUserName').textContent = user.displayName || 'Admin';
  document.getElementById('adminUserEmail').textContent = user.email || '';
  const sName = document.getElementById('settingsUserName');
  const sEmail = document.getElementById('settingsUserEmail');
  if (sName) sName.textContent = user.displayName || 'Admin';
  if (sEmail) sEmail.textContent = user.email || '';

  ts_renderLeads();
  // Re-renders on first load AND every time products change anywhere
  // (this device, another device, a customer's device — any edit
  // reaches this table live, without a page refresh).
  TSData.onUpdate(function () {
    ts_renderAdminTable();
    ts_renderStats();
  });
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

  if (!TSData.isReady()) {
    tbody.innerHTML = `<tr><td colspan="6" class="admin-empty">Loading products…</td></tr>`;
    return;
  }

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
  TSData.remove(id).then(function (ok) {
    if (!ok) {
      alert('Could not delete — check your internet connection and try again.');
      return;
    }
    ts_renderAdminTable();
    ts_renderStats();
  });
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

    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    TSData.save(product).then(function (ok) {
      if (submitBtn) submitBtn.disabled = false;
      if (!ok) {
        alert(TSData.isCloud()
          ? 'Could not save — check your internet connection and try again.'
          : 'Could not save — the image may be too large for browser storage. Try a smaller photo (under ~500KB) or paste an image URL instead.');
        return;
      }
      ts_closeProductModal();
      ts_renderAdminTable();
      ts_renderStats();
    });
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
    TSData.resetToDefaults().then(function (ok) {
      if (!ok) {
        alert('Could not reset — check your internet connection and try again.');
        return;
      }
      ts_renderAdminTable();
      ts_renderStats();
    });
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
