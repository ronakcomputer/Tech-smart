# TechSmart Website

A multi-page website for TechSmart (laptops, printers, sales & repair — Meera Market, Chittorgarh, Rajasthan).

## What's inside

```
index.html        Home page
laptops.html       Laptop catalogue (filter/search/sort + WhatsApp enquiry)
printers.html      Printer catalogue (same features)
services.html      Repair/service info + service booking form
about.html         About the shop
contact.html       Address, map, hours, contact form
admin/index.html   Admin panel (login-protected) — add/edit/delete products
assets/css/        Stylesheets
assets/js/         All site logic + product data
robots.txt         Tells search engines what to crawl
sitemap.xml        List of pages for Google Search Console
```

No build tools, frameworks or installs needed — it's plain HTML/CSS/JS. Anyone on your team can open these files in a text editor (even Notepad) and edit them directly.

---

## 1. Running it on your own computer

Just double-click **index.html** — it opens in your browser and the whole site works, including the admin panel and product filters. No server or internet connection required for this.

For the best experience (and required if you ever add features that fetch files), you can also run a tiny local server:

```
cd techsmart
python -m http.server 8000
```
then open `http://localhost:8000` in your browser.

---

## 2. Publishing it live (so customers can visit it)

Any of these work — pick whichever is easiest for you:

**Option A — Netlify (free, easiest, no technical skill needed)**
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag the whole `techsmart` folder onto the page
3. Netlify gives you a live link in seconds. You can later connect your own domain name (e.g. `techsmartchittorgarh.com`) from Netlify's "Domain settings".

**Option B — Your own hosting (GoDaddy, Hostinger, BigRock, etc.)**
1. Buy hosting + a domain name if you don't have one already
2. Open your hosting's File Manager or connect with FTP (e.g. FileZilla)
3. Upload everything inside the `techsmart` folder into the `public_html` (or `www`) folder
4. Visit your domain — the site is live

**Option C — GitHub Pages (free)**
1. Create a GitHub account and a new repository
2. Upload the contents of the `techsmart` folder to it
3. In the repository's Settings → Pages, enable GitHub Pages on the main branch
4. GitHub gives you a live link (custom domain supported too)

### After you publish: update the domain in the code
The pages currently reference a placeholder domain: `https://www.techsmartchittorgarh.com/`. Once you know your real domain, do a find-and-replace for `techsmartchittorgarh.com` across all `.html` files and `sitemap.xml`, and swap in your actual domain. (Most code editors, and even Notepad++, have "Replace in Files".)

---

## 3. The Admin Panel

Open **admin/index.html** (or click "Admin Login" in the website footer).

- **Default password:** `techsmart2026` — change this immediately from the Settings tab after logging in.
- From the **Products** tab you can Add, Edit or Delete any laptop or printer — brand, model, configuration, price, photo and Available/Out of Stock status.
- From the **Enquiries** tab you can see a backup log of enquiries submitted on that browser (the actual enquiry always also goes straight to your WhatsApp — this tab is just a convenience).
- Product photos: upload a photo (under 1.5MB) or paste an image URL. If you leave it blank, a neat placeholder graphic is shown automatically.

### Important — please read: how product data is stored
This admin panel has **no server or database** — it stores your products directly in the browser's local storage on the device you're using. This keeps the site simple and free to run, but it has one real limitation:

> **Changes you make in the admin panel are only saved on that one browser/device.** A customer visiting your site from their own phone will always see the original starter catalogue, not your live edits — because their phone has no access to your shop PC's local storage.

Two ways to fix this properly when you're ready:

1. **Simplest (free, a little manual work):** Whenever you update products, open `assets/js/products-data.js`, edit the `TS_DEFAULT_PRODUCTS` list near the top with your new products, save the file, and re-upload it to your hosting. This becomes the catalogue everyone sees, everywhere, instantly.
2. **Fully automatic (recommended long-term):** Connect the admin panel to a free lightweight backend such as Google Sheets (via a script), Firebase, or Supabase, so edits save to the cloud and every visitor sees them immediately. This needs a developer to wire up (happy to help if you want this built later) — it's a bigger step up from a simple static site.

The admin **login is a screen-lock, not real security** — anyone who can view the page's source code could in theory find a way around it. Don't rely on it to protect anything sensitive; it's meant to stop casual visitors from opening the panel by accident.

---

## 4. WhatsApp Enquiry — how it works

Every product has a "WhatsApp Enquiry" button. When tapped:
1. A small form asks for the customer's name and phone number.
2. Clicking "Continue to WhatsApp" opens WhatsApp (app or web) with a message already written, including: product name, configuration, price, availability, and the customer's name & phone.
3. The customer just hits send — it arrives on your number, **+91 98870 99962**.

The Services page has a similar form for repair bookings, and the Contact page has one for general messages — both do the same thing (open WhatsApp with the details filled in).

To change the WhatsApp number, open `assets/js/main.js` and edit the `phoneWa` value near the top (country code + number, no spaces or `+`).

---

## 5. SEO — getting found on Google

The site already has these SEO foundations built in:
- Unique, keyword-rich `<title>` and description on every page (e.g. "laptop shop Chittorgarh", "printer repair Chittorgarh", brand names)
- Open Graph tags so your logo and a description show up when the link is shared on WhatsApp/Facebook
- `LocalBusiness`/`ElectronicsStore` structured data (JSON-LD) with your address, phone and hours — this is what helps Google show your shop details directly in search results
- `robots.txt` and `sitemap.xml` so Google knows what to crawl
- Your logo set as the site favicon (shows next to your site name in browser tabs and some search results)

To actually appear in Google search results, after publishing:
1. Create a **Google Business Profile** (free) for TechSmart with your address, phone, hours and photos — this is the single biggest factor in local search ("laptop shop near me" type searches) and is how your logo/listing appears in Google Maps and the search side panel.
2. Go to **Google Search Console** (search.google.com/search-console), add your live domain, verify ownership, and submit `https://yourdomain.com/sitemap.xml`.
3. Keep the product prices and stock status up to date — fresh, accurate content is favoured by search engines.
4. Once you have real product photos, replace the placeholder images through the admin panel — real photos help both SEO and customer trust.

---

## 6. Editing content

- **Shop details** (phone, address, hours, email, Facebook link): edit the `TS_CONFIG` object at the top of `assets/js/main.js`, plus the footer text repeated in each HTML file.
- **Colors/fonts**: all defined as CSS variables at the top of `assets/css/style.css` (`:root { ... }`) — change them once, and they apply everywhere.
- **Starter products**: `assets/js/products-data.js` → `TS_DEFAULT_PRODUCTS` array (only affects new/reset browsers — see Admin Panel section above).
- **Logo**: replace `assets/img/logo.png` with a new file of the same name to update it everywhere in one go.

---

## 7. Browser support & responsiveness

Tested layout patterns for phones, tablets and desktops (breakpoints at 940px, 860px, 640px, 600px, 520px). Works in all modern browsers (Chrome, Edge, Safari, Firefox). No Internet Explorer support.
