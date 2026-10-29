/* Resas storefront. Shared parts (header, search, menus, cart, footer) run on
   every page; the homepage sections run when window.RESAS_HOME is loaded, and
   the product page runs when the page has [data-product-page].
   Data: window.RESAS_STORE (exported from Zid), window.RESAS_HOME (section settings). */
(function () {
  "use strict";

  var STORE = window.RESAS_STORE;
  var HOME = window.RESAS_HOME;
  if (!STORE) {
    console.error("Resas: data/store.js did not load.");
    return;
  }
  var S = STORE.store;
  var ICONS = {
    instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".6"/></svg>',
    snapchat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5c3 0 5 2.2 5 5v2.3l1.6-.4c.6 0 .8.7.3 1l-1.8 1c.4 1.6 1.7 3 3.4 3.5-.3.8-1.6 1-2.6 1.2-.2.6-.3 1.3-.9 1.3-.9 0-1.8-.5-3 .3-1 .7-1.6 1-2 1s-1-.3-2-1c-1.2-.8-2.1-.3-3-.3-.6 0-.7-.7-.9-1.3-1-.2-2.3-.4-2.6-1.2 1.7-.5 3-1.9 3.4-3.5l-1.8-1c-.5-.3-.3-1 .3-1l1.6.4V8.5c0-2.8 2-5 5-5z"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3.5v11.2a3.3 3.3 0 11-3.3-3.3"/><path d="M14 3.5c.5 2.6 2.3 4.2 5 4.4"/></svg>',
    x: '<svg class="is-fill" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.21-6.82-5.97 6.82H1.68l7.73-8.84L1.25 2.25h6.83l4.71 6.23zm-1.16 17.52h1.83L7.08 4.13H5.12z"/></svg>'
  };
  var SOCIAL_LABELS = { instagram: "إنستغرام", snapchat: "سناب شات", tiktok: "تيك توك", x: "إكس" };

  /* ---------- helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function get(obj, path) {
    return path.split(".").reduce(function (o, k) { return o == null ? o : o[k]; }, obj);
  }
  function img(url, w) {
    if (!url) return "";
    return "https://media.zid.store/cdn-cgi/image/w=" + w + ",q=82,f=auto/" + url;
  }
  function srcset(url, widths) {
    return widths.map(function (w) { return img(url, w) + " " + w + "w"; }).join(", ");
  }
  /* 1062 → "1,062.00 ر.س" */
  function sar(v) {
    return v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " " + S.currency.symbol;
  }
  function money(v) {
    /* The small epsilon rounds half-halalas up like Zid does (110.5 + 15% = 127.075 → 127.08). */
    return sar(Math.round(v * (1 + S.tax_rate) * 100 + 1e-6) / 100);
  }
  function inCategory(name) {
    return STORE.products.filter(function (p) { return p.in_stock && p.categories.indexOf(name) !== -1; });
  }
  var byName = {};
  STORE.products.forEach(function (p) { if (!byName[p.name]) byName[p.name] = p; });
  function product(name) {
    var p = byName[name];
    if (!p) console.warn("Resas: product not found in store data:", name);
    return p;
  }
  function category(name) {
    var all = STORE.categories.concat(STORE.menu, STORE.all_categories || []);
    for (var i = 0; i < all.length; i++) if (all[i].name === name) return all[i];
    console.warn("Resas: category not found in store data:", name);
    return { name: name, url: "/categories" };
  }
  /* In the local preview, product links open product.html; once installed in Zid
     they use the product's own Zid address. */
  var PREVIEW = /^(localhost|127\.0\.0\.1|)$/.test(location.hostname);
  function href(p) {
    return PREVIEW ? "product.html?id=" + encodeURIComponent(p.id) : p.url;
  }
  /* Category and "all products" links: category.html in the preview, Zid's own pages once installed. */
  function link(url) {
    if (!PREVIEW || !url) return url;
    var m = String(url).match(/\/categories\/(\d+)/);
    if (m) return "category.html?id=" + m[1];
    if (url === "/products" || url === "/categories" || url === "/categories/") return "category.html";
    if (url.indexOf("/products?") === 0) return "category.html" + url.slice(9);
    if (url === "/cart") return "cart.html";
    return url;
  }
  var catById = {};
  (STORE.all_categories || []).forEach(function (c) { catById[c.id] = c; });
  /* Arabic-insensitive matching: أ/إ/آ → ا, ة → ه, ى → ي, no diacritics or tatweel. */
  function norm(s) {
    return String(s).toLowerCase()
      .replace(/[ً-ْـ]/g, "")
      .replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي");
  }
  function ctaHref(cta) {
    if (cta.url) return link(cta.url);
    if (cta.product) { var p = product(cta.product); return p ? href(p) : "/"; }
    return link(category(cta.category).url);
  }
  function stars(avg) {
    var out = "";
    for (var i = 1; i <= 5; i++) {
      out += '<svg class="' + (i <= Math.round(avg) ? "is-on" : "") + '" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>';
    }
    return out;
  }
  /* Stars and review count; grey stars when there are no reviews yet. */
  function ratingLine(p) {
    var r = p.rating && p.rating.count ? p.rating : null;
    return r
      ? '<p class="rs-rating"><span class="rs-stars" role="img" aria-label="التقييم ' + r.average + ' من 5">' + stars(r.average) + "</span><span>(" + r.count + ")</span></p>"
      : '<p class="rs-rating"><span class="rs-stars" role="img" aria-label="لا تقييمات بعد">' + stars(0) + "</span></p>";
  }
  function plural(n, one, two, few, many) {
    return n === 1 ? one : n === 2 ? two : n <= 10 ? n + " " + few : n + " " + many;
  }
  function render(name, html) {
    $$('[data-render="' + name + '"]').forEach(function (el) { el.innerHTML = html; });
  }

  /* ---------- toast ---------- */
  var toastTimer;
  function toast(msg) {
    var t = $("[data-toast]");
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 2600);
  }

  /* ---------- cart: Zid's cart when installed, a local preview otherwise ---------- */
  var Cart = (function () {
    var zidCart = window.zid && window.zid.cart && typeof window.zid.cart.addProduct === "function" ? window.zid.cart : null;
    var KEY = "resas-preview-cart";
    function read() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
    function write(items) { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) { /* private mode: cart lives for this page only */ } }
    var items = read();
    var listeners = [];
    /* Preview only: cart.html?demo=1 fills an empty cart with three products for review. */
    if (PREVIEW && !items.length && /[?&]demo=1/.test(location.search)) {
      items = ["عنبر", "ليدي روز", "بخور رساس"].map(function (n, i) { var p = byName[n]; return p && { id: p.id, qty: i ? 1 : 2 }; }).filter(Boolean);
      write(items);
    }

    function count() { return items.reduce(function (n, i) { return n + i.qty; }, 0); }
    /* VAT-inclusive total, rounded per unit like Zid (2 × 260.00 = 520.00). */
    function total() {
      return items.reduce(function (n, i) {
        var p = STORE.products.filter(function (x) { return x.id === i.id; })[0];
        return p ? n + Math.round((p.sale_price || p.price) * (1 + S.tax_rate) * 100 + 1e-6) / 100 * i.qty : n;
      }, 0);
    }
    function paint() {
      var n = count();
      $$("[data-cart-count]").forEach(function (b) { b.textContent = n; b.hidden = n === 0; });
      $$("[data-open-cart]").forEach(function (b) { b.setAttribute("aria-label", n ? "السلة، " + n + " " + (n === 1 ? "منتج" : n === 2 ? "منتجان" : n <= 10 ? "منتجات" : "منتج") : "السلة فارغة"); });
      var list = items.map(function (i) {
        var p = STORE.products.filter(function (x) { return x.id === i.id; })[0];
        if (!p) return "";
        return '<li class="rs-cart__item"><img src="' + esc(img(p.image, 160)) + '" alt="" width="64" height="64" loading="lazy">' +
          '<div><h3>' + esc(p.name) + '</h3><span>' + i.qty + " × " + money(p.sale_price || p.price) + '</span></div>' +
          '<button class="rs-icon-btn" type="button" aria-label="حذف ' + esc(p.name) + '" data-remove="' + esc(p.id) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 11v6M14 11v6M7 7l1 13h8l1-13M9 7V4h6v3"/></svg></button></li>';
      }).join("");
      render("cart", list || '<li class="rs-cart__empty">سلتك فارغة. ابدأ من الأكثر مبيعاً.</li>');
      $$("[data-cart-total]").forEach(function (t) { t.textContent = sar(total()); });
      $$("[data-preview-note]").forEach(function (t) { t.hidden = !!zidCart; });
      listeners.forEach(function (fn) { fn(); });
    }
    function add(id, name, qty) {
      qty = qty || 1;
      if (zidCart) {
        return zidCart.addProduct({ product_id: id, quantity: qty }, { showErrorNotification: true })
          .then(function () { toast("أُضيف «" + name + "» إلى السلة"); });
      }
      var line = items.filter(function (i) { return i.id === id; })[0];
      if (line) line.qty += qty; else items.push({ id: id, qty: qty });
      write(items);
      paint();
      toast("أُضيف «" + name + "» إلى السلة");
      return Promise.resolve();
    }
    function remove(id) {
      items = items.filter(function (i) { return i.id !== id; });
      write(items);
      paint();
    }
    function setQty(id, qty) {
      var line = items.filter(function (i) { return i.id === id; })[0];
      if (!line) return;
      line.qty = Math.max(1, Math.min(10, qty));
      write(items);
      paint();
    }
    /* Lines with their product, skipping products no longer in the store data. */
    function lines() {
      return items.map(function (i) { return { qty: i.qty, p: STORE.products.filter(function (x) { return x.id === i.id; })[0] }; }).filter(function (l) { return l.p; });
    }
    return { add: add, remove: remove, setQty: setQty, lines: lines, paint: paint, onChange: function (fn) { listeners.push(fn); }, isZid: !!zidCart };
  })();

  /* ---------- static bindings ---------- */
  $$("[data-store]").forEach(function (el) { el.textContent = S[el.getAttribute("data-store")] || ""; });
  $$("[data-store-src]").forEach(function (el) { el.src = img(S[el.getAttribute("data-store-src")], 240); });
  if (HOME) $$("[data-home]").forEach(function (el) { el.textContent = get(HOME, el.getAttribute("data-home")) || ""; });
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  $$("a[data-link]").forEach(function (a) { a.href = link(a.getAttribute("data-link")); });

  /* ---------- menus ---------- */
  function li(url, name) { return '<li><a href="' + esc(link(url)) + '">' + esc(name) + "</a></li>"; }
  var menuHtml = STORE.menu.map(function (m) { return li(m.url, m.name); }).join("");
  render("menu", li("/products", "جميع المنتجات") + menuHtml + li("/categories/141504/فواحات", "فواحات اعواد") + li("/categories/141500/عطور-زيتية", "عطور زيتية"));
  render("drawer-menu", li("/products", "جميع المنتجات") + menuHtml + '<li><a href="/auth/login">حسابي</a></li><li><a href="/shipping-and-payment">الدفع والتوصيل</a></li>');
  render("footer-shop", STORE.menu.slice(0, 4).map(function (m) { return li(m.url, m.name); }).join(""));
  render("social", Object.keys(S.social).map(function (k) {
    return '<li><a href="' + esc(S.social[k]) + '" target="_blank" rel="noopener" aria-label="' + SOCIAL_LABELS[k] + '">' + ICONS[k] + "</a></li>";
  }).join(""));
  render("payments", S.payment_methods.map(function (m) { return "<li>" + esc(m) + "</li>"; }).join(""));

  /* ---------- product cards (homepage, product page) ---------- */
  /* The small grey line above a product name: its first real shopping category,
     skipping campaign groupings such as "عروض الجمعه البيضاء". */
  var CAMPAIGN = /عرض|عروض|الاكثر|مختارة|اشتري/;
  function shelf(p) {
    for (var i = 0; i < p.categories.length; i++) if (!CAMPAIGN.test(p.categories[i])) return p.categories[i];
    return "";
  }
  function shelfLabel(name) { return String(name).replace("مستوحاه", "مستوحاة"); }
  var PLUS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1.2 12H6.2z"/><path d="M9 8V6.5a3 3 0 016 0V8"/><path d="M12 11.5v5M9.5 14h5"/></svg>';
  /* "جديد": added to Zid within the last new_badge_days days (60 on pages without home settings). */
  var NEW_DAYS = (HOME && HOME.new_badge_days) || 60;
  function isNew(p) { var t = Date.parse(p.created || ""); return !isNaN(t) && (Date.now() - t) / 864e5 <= NEW_DAYS; }
  /* opts.stars adds the rating line (homepage grids). card is also used directly in .map(), so opts may be an index. */
  function card(p, opts) {
    var sale = p.sale_price && p.sale_price < p.price;
    var pct = sale ? Math.round((1 - p.sale_price / p.price) * 100) : 0;
    var link = href(p);
    return '<li><article class="rs-card">' +
      '<div class="rs-card__media">' +
        '<a href="' + esc(link) + '" tabindex="-1" aria-hidden="true"><img src="' + esc(img(p.image, 480)) + '" srcset="' + esc(srcset(p.image, [300, 480, 720])) + '" sizes="(min-width: 1024px) 250px, (min-width: 768px) 30vw, 45vw" alt="" width="300" height="375" loading="lazy"></a>' +
        (sale || isNew(p) ? '<span class="rs-card__badges">' + (isNew(p) ? '<span class="rs-card__badge rs-card__badge--new">جديد</span>' : "") + (sale ? '<span class="rs-card__badge">خصم ' + pct + "%</span>" : "") + "</span>" : "") +
        (p.has_options
          ? '<a class="rs-card__add" href="' + esc(link) + '" aria-label="اختر خيارات ' + esc(p.name) + '">' + PLUS + "</a>"
          : '<button class="rs-card__add" type="button" aria-label="أضف ' + esc(p.name) + ' إلى السلة" data-add="' + esc(p.id) + '" data-name="' + esc(p.name) + '">' + PLUS + "</button>") +
      "</div>" +
      '<span class="rs-card__cat">' + esc(shelfLabel(shelf(p))) + "</span>" +
      '<h3 class="rs-card__name"><a href="' + esc(link) + '">' + esc(p.name) + "</a></h3>" +
      (opts && opts.stars ? ratingLine(p) : "") +
      '<p class="rs-card__price' + (sale ? " rs-card__price--sale" : "") + '">' +
        (sale ? "<strong>" + money(p.sale_price) + "</strong><del>" + money(p.price) + "</del>" : "<strong>" + money(p.price) + "</strong>") +
      "</p>" +
    "</article></li>";
  }

  if (HOME && $(".rs-hero")) homepage();
  if ($("[data-product-page]")) productPage();
  if ($("[data-category-page]")) categoryPage();
  if ($("[data-cart-page]")) cartPage();

  function homepage() {
  /* ---------- hero slider ---------- */
  var slides = HOME.hero.slides;
  render("hero", slides.map(function (s, i) {
    var from = s.from_product && product(s.from_product);
    var pics = s.products.map(product).filter(Boolean);
    return '<div class="rs-hero__slide" role="group" aria-roledescription="شريحة" aria-label="' + (i + 1) + " من " + slides.length + '"' + (i ? ' aria-hidden="true"' : "") + ">" +
      '<div class="rs-hero__body">' +
        '<span class="rs-eyebrow">' + esc(s.eyebrow) + "</span>" +
        (i === 0 ? "<h1" : "<h2") + ' class="rs-hero__title">' + esc(s.title) + (i === 0 ? "</h1>" : "</h2>") +
        '<p class="rs-hero__text">' + esc(s.text) + "</p>" +
        (from ? '<p class="rs-hero__from">تبدأ من ' + money(from.price) + "</p>" : "") +
        '<a class="rs-btn" href="' + esc(ctaHref(s.cta)) + '"' + (i ? ' tabindex="-1"' : "") + ">" + esc(s.cta.label) + "</a>" +
      "</div>" +
      '<div class="rs-hero__media">' + pics.map(function (p, j) {
        return '<img src="' + esc(img(p.image, 640)) + '" srcset="' + esc(srcset(p.image, [320, 640, 960])) + '" sizes="(min-width: 768px) 280px, 45vw" alt="' + (j === 1 ? esc(p.name) : "") + '"' + (i === 0 && j === 1 ? ' fetchpriority="high"' : ' loading="lazy"') + ">";
      }).join("") + "</div>" +
    "</div>";
  }).join(""));
  render("hero-dots", slides.map(function (s, i) {
    return '<button class="rs-hero__dot" type="button" aria-label="الشريحة ' + (i + 1) + '"' + (i ? "" : ' aria-current="true"') + ' data-slide="' + i + '"></button>';
  }).join(""));

  (function slider() {
    var track = $(".rs-hero__track");
    var hero = $(".rs-hero");
    var current = 0;
    var timer = null;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function go(n) {
      current = (n + slides.length) % slides.length;
      /* RTL: the next slide sits to the left, so the track moves right. */
      track.style.transform = "translateX(" + (current * 100) + "%)";
      $$(".rs-hero__slide", track).forEach(function (el, i) {
        el.setAttribute("aria-hidden", i === current ? "false" : "true");
        $$("a", el).forEach(function (a) { a.tabIndex = i === current ? 0 : -1; });
      });
      $$(".rs-hero__dot").forEach(function (d, i) { if (i === current) d.setAttribute("aria-current", "true"); else d.removeAttribute("aria-current"); });
    }
    function play() { if (!reduce && slides.length > 1) { stop(); timer = setInterval(function () { go(current + 1); }, HOME.hero.autoplay_ms); } }
    function stop() { clearInterval(timer); timer = null; }
    $$(".rs-hero__dot").forEach(function (d) { d.addEventListener("click", function () { go(+d.getAttribute("data-slide")); play(); }); });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", play);
    hero.addEventListener("focusin", stop);
    hero.addEventListener("focusout", play);
    hero.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { go(current + 1); e.preventDefault(); }
      if (e.key === "ArrowRight") { go(current - 1); e.preventDefault(); }
    });
    var x0 = null;
    hero.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; stop(); }, { passive: true });
    hero.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) go(current + (dx > 0 ? 1 : -1));
      x0 = null;
      play();
    });
    play();
  })();

  /* ---------- shared pieces ---------- */
  var stocked = STORE.products.filter(function (p) { return p.in_stock; });
  function score(p) { return p.rating && p.rating.count ? p.rating.average * 100 + Math.min(p.rating.count, 99) : 0; }
  var bestRated = stocked.filter(score).sort(function (a, b) { return score(b) - score(a); });
  /* Fill a short list up to n with the best-rated products it doesn't already have. */
  function topUp(list, n) {
    var ids = list.map(function (p) { return p.id; });
    return list.concat(bestRated.filter(function (p) { return ids.indexOf(p.id) === -1; })).slice(0, n);
  }
  function waLink() { return "https://wa.me/" + S.whatsapp; }
  function bannerHref(cta) { return cta.whatsapp ? waLink() : ctaHref(cta); }

  /* ---------- categories in arched frames ---------- */
  /* A category's in-stock products, its subcategories included ("عطور" holds 148). */
  function familyCount(c) {
    c = (STORE.all_categories || []).filter(function (x) { return x.name === c.name; })[0] || c;
    var names = [];
    (function add(x) { names.push(x.name); (x.children || []).forEach(function (id) { if (catById[id]) add(catById[id]); }); })(c);
    return STORE.products.filter(function (p) { return p.in_stock && p.categories.some(function (n) { return names.indexOf(n) > -1; }); }).length;
  }
  render("arches", HOME.arches.map(function (t) {
    var c = category(t.category);
    var p = product(t.product);
    var n = familyCount(c);
    return '<li><a class="rs-arch" href="' + esc(link(c.url)) + '">' +
      '<span class="rs-arch__frame">' + (p ? '<img src="' + esc(img(p.image, 640)) + '" srcset="' + esc(srcset(p.image, [400, 640, 900])) + '" sizes="(min-width: 768px) 140px, 30vw" alt="" loading="lazy">' : "") + "</span>" +
      '<span class="rs-arch__name">' + esc(t.title) + "</span>" +
      '<span class="rs-arch__count">' + plural(n, "منتج واحد", "منتجان", "منتجات", "منتجاً") + "</span>" +
    "</a></li>";
  }).join(""));

  /* ---------- the two banners: text on one side, product photo on the other ---------- */
  var onSale = stocked.filter(function (p) { return p.sale_price && p.sale_price < p.price; });
  var maxOff = onSale.reduce(function (m, p) { return Math.max(m, Math.round((1 - p.sale_price / p.price) * 100)); }, 0);
  function banner(t, cls, w) {
    var copy = t;
    var cta = t.cta;
    var p = t.product && product(t.product);
    return '<li><a class="' + cls + (t.style ? " " + cls + "--" + t.style : "") + '" href="' + esc(bannerHref(cta)) + '"' + (cta.whatsapp ? ' target="_blank" rel="noopener"' : "") + ">" +
      '<span class="' + cls + '__body">' +
        '<span class="rs-eyebrow">' + esc(copy.eyebrow) + "</span>" +
        '<span class="' + cls + '__title">' + esc(copy.title.replace("{max_discount}", maxOff)) + "</span>" +
        (copy.text ? '<span class="' + cls + '__text">' + esc(copy.text) + "</span>" : "") +
        '<span class="rs-cta">' + esc(cta.label) + "</span>" +
      "</span>" +
      (p ? '<img src="' + esc(img(p.image, w)) + '" srcset="' + esc(srcset(p.image, [w / 2, w])) + '" sizes="(min-width: 1024px) ' + (w / 2) + 'px, 45vw" alt="" loading="lazy">' : "") +
    "</a></li>";
  }
  render("duo", HOME.duo.map(function (t) { return banner(t, "rs-duo__item", 720); }).join(""));

  /* ---------- product tabs ---------- */
  var tabs = HOME.picks.tabs.map(function (t) {
    var list = t.category ? inCategory(t.category)
      : t.sort === "new" ? stocked.slice().sort(function (a, b) { return String(b.created || "").localeCompare(String(a.created || "")); })
      : t.sort === "rating" ? bestRated
      : stocked;
    return { label: t.label, list: topUp(list.slice(0, HOME.picks.limit), HOME.picks.limit) };
  });
  render("pick-tabs", tabs.map(function (t, i) {
    return '<button type="button" role="tab" id="rs-tab-' + i + '" aria-controls="rs-panel-' + i + '" aria-selected="' + (i ? "false" : "true") + '"' + (i ? ' tabindex="-1"' : "") + ">" + esc(t.label) + "</button>";
  }).join(""));
  render("pick-panels", tabs.map(function (t, i) {
    return '<div role="tabpanel" id="rs-panel-' + i + '" aria-labelledby="rs-tab-' + i + '"' + (i ? " hidden" : "") + '><ul class="rs-grid rs-grid--four rs-grid--center">' +
      t.list.map(function (p) { return card(p, { stars: true }); }).join("") + "</ul></div>";
  }).join(""));
  (function tablist() {
    var btns = $$('[data-render="pick-tabs"] [role="tab"]');
    function select(i, focus) {
      btns.forEach(function (b, j) {
        b.setAttribute("aria-selected", j === i ? "true" : "false");
        b.tabIndex = j === i ? 0 : -1;
        $("#rs-panel-" + j).hidden = j !== i;
      });
      if (focus) btns[i].focus();
    }
    btns.forEach(function (b, i) {
      b.addEventListener("click", function () { select(i); });
      /* RTL: the next tab is to the left. */
      b.addEventListener("keydown", function (e) {
        var n = { ArrowLeft: i + 1, ArrowRight: i - 1, Home: 0, End: btns.length - 1 }[e.key];
        if (n === undefined) return;
        e.preventDefault();
        select((n + btns.length) % btns.length, true);
      });
    });
  })();

  /* ---------- sale band (the store's story when nothing is on sale) ---------- */
  var story = maxOff || !HOME.story.fallback ? HOME.story : HOME.story.fallback;
  if (maxOff) $(".rs-story").classList.add("rs-story--sale");
  $('[data-render="story-eyebrow"]').textContent = story.eyebrow;
  $('[data-render="story-title"]').textContent = story.title.replace("{max_discount}", maxOff);
  $('[data-render="story-text"]').textContent = story.text
    ? story.text.replace("{count}", plural(onSale.length, "منتج واحد", "منتجين", "منتجات", "منتجاً"))
    : S.about;
  var storyP = product(story.image_product);
  if (storyP) {
    var si = $('[data-render="story-image"]');
    si.src = img(storyP.image, 1200);
    si.srcset = srcset(storyP.image, [600, 1200]);
    si.sizes = "(min-width: 768px) 50vw, 100vw";
    si.alt = storyP.name + " من رساس";
    si.loading = "lazy";
  }
  var storyCta = $('[data-render="story-cta"]');
  storyCta.href = ctaHref(story.cta);
  storyCta.textContent = story.cta.label;

  /* ---------- featured: small horizontal cards ---------- */
  render("featured", topUp(inCategory(HOME.featured.source_category), HOME.featured.limit).map(function (p) {
    var sale = p.sale_price && p.sale_price < p.price;
    var url = href(p);
    return '<li><article class="rs-mini__item">' +
      '<a class="rs-mini__img" href="' + esc(url) + '" tabindex="-1" aria-hidden="true"><img src="' + esc(img(p.image, 240)) + '" alt="" width="120" height="120" loading="lazy"></a>' +
      '<div class="rs-mini__body">' +
        '<h3 class="rs-mini__name"><a href="' + esc(url) + '">' + esc(p.name) + "</a></h3>" +
        ratingLine(p) +
        '<p class="rs-card__price' + (sale ? " rs-card__price--sale" : "") + '">' + (sale ? "<strong>" + money(p.sale_price) + "</strong><del>" + money(p.price) + "</del>" : "<strong>" + money(p.price) + "</strong>") + "</p>" +
      "</div>" +
      (p.has_options
        ? '<a class="rs-mini__btn" href="' + esc(url) + '">اختر الحجم</a>'
        : '<button class="rs-mini__btn" type="button" data-add="' + esc(p.id) + '" data-name="' + esc(p.name) + '">أضف إلى السلة</button>') +
    "</article></li>";
  }).join(""));

  /* ---------- blog posts (the live store's blog; the preview links there too) ---------- */
  function blog(url) { return PREVIEW ? "https://resas.sa.com" + url : url; }
  render("posts", HOME.posts.items.map(function (t) {
    var p = product(t.image_product);
    var url = blog(t.url);
    return '<li><article class="rs-post">' +
      '<a class="rs-post__img" href="' + esc(url) + '" tabindex="-1" aria-hidden="true">' + (p ? '<img src="' + esc(img(p.image, 720)) + '" srcset="' + esc(srcset(p.image, [480, 720])) + '" sizes="(min-width: 768px) 33vw, 100vw" alt="" loading="lazy">' : "") + "</a>" +
      '<h3 class="rs-post__title"><a href="' + esc(url) + '">' + esc(t.title) + "</a></h3>" +
      '<p class="rs-muted">' + esc(t.text) + "</p>" +
      '<a class="rs-cta" href="' + esc(url) + '" aria-label="اقرأ المزيد: ' + esc(t.title) + '">اقرأ المزيد</a>' +
    "</article></li>";
  }).join(""));
  var postsMore = $('[data-render="posts-more"]');
  postsMore.href = blog(HOME.posts.more.url);
  postsMore.textContent = HOME.posts.more.label;

  /* ---------- Instagram strip ---------- */
  var insta = S.social.instagram;
  var handle = $('[data-render="insta-handle"]');
  if (insta) {
    handle.href = insta;
    handle.textContent = "@" + insta.replace(/\/+$/, "").split("/").pop();
    render("instagram", HOME.instagram.products.map(product).filter(Boolean).map(function (p) {
      return '<li><a href="' + esc(insta) + '" target="_blank" rel="noopener"><img src="' + esc(img(p.image, 480)) + '" srcset="' + esc(srcset(p.image, [320, 480])) + '" sizes="(min-width: 768px) 17vw, 34vw" alt="' + esc(p.name) + '" loading="lazy"></a></li>';
    }).join(""));
  } else {
    $(".rs-insta").hidden = true;
  }
  } /* end homepage() */

  /* ---------- category page: category.html?id=<Zid category id>, ?q=<search>, or all products ---------- */
  function categoryPage() {
    var params = new URLSearchParams(location.search);
    var cat = catById[params.get("id")];
    var q = (params.get("q") || "").trim();
    var PAGE = 24;
    var shown = PAGE;

    /* A parent category also shows its subcategories' products (e.g. "عطور" holds 12 subcategories). */
    function family(c) {
      var names = [c.name];
      (c.children || []).forEach(function (id) { if (catById[id]) names = names.concat(family(catById[id])); });
      return names;
    }
    var base, title, crumbs = '<li><a href="index.html">الرئيسية</a></li>';
    if (cat) {
      var names = family(cat);
      base = STORE.products.filter(function (p) { return p.categories.some(function (n) { return names.indexOf(n) > -1; }); });
      title = shelfLabel(cat.name);
      var parent = cat.parents && cat.parents.length && catById[cat.parents[cat.parents.length - 1]];
      if (parent) crumbs += '<li><a href="' + esc(link(parent.url)) + '">' + esc(shelfLabel(parent.name)) + "</a></li>";
      document.title = title + " | " + S.name;
    } else if (q) {
      var words = norm(q).split(/\s+/);
      base = STORE.products.filter(function (p) {
        var hay = norm(p.name + " " + p.categories.join(" "));
        return words.every(function (w) { return hay.indexOf(w) > -1; });
      });
      title = "نتائج البحث عن «" + q + "»";
      document.title = "بحث: " + q + " | " + S.name;
    } else {
      base = STORE.products.slice();
      title = params.get("sale") === "1" ? "عروض رساس" : "جميع المنتجات";
      document.title = title + " | " + S.name;
    }
    render("cat-crumbs", crumbs + '<li aria-current="page">' + esc(title) + "</li>");
    render("cat-title", esc(title));

    if (cat && cat.description) {
      render("cat-desc", esc(cat.description));
      render("cat-about", esc(cat.description));
      render("cat-name", esc(title));
      $("[data-cat-about]").hidden = false;
    }

    /* Text tabs: "الكل" plus the children; for a leaf, its parent and siblings; for all products / search, the main sections. */
    var chipCats = [], allTab = null;
    var parentCat = cat && cat.parents && cat.parents.length && catById[cat.parents[cat.parents.length - 1]];
    if (cat && cat.children && cat.children.length) { chipCats = cat.children.map(function (id) { return catById[id]; }); allTab = { url: link(cat.url), current: true }; }
    else if (parentCat) { chipCats = parentCat.children.map(function (id) { return catById[id]; }); allTab = { url: link(parentCat.url), current: false }; }
    else { chipCats = STORE.menu.map(function (m) { var id = (m.url.match(/\/categories\/(\d+)/) || [])[1]; return catById[id]; }); allTab = { url: link("/products"), current: !cat && !q }; }
    /* Counts include subcategories, so "عطور" shows its 148 products rather than the 6 filed directly under it. */
    function familyProducts(c) {
      var names = family(c);
      return STORE.products.filter(function (p) { return p.categories.some(function (n) { return names.indexOf(n) > -1; }); });
    }
    chipCats = chipCats.filter(Boolean).map(function (c) {
      var list = familyProducts(c);
      return { id: c.id, name: c.name, url: c.url, list: list, count: list.filter(function (p) { return p.in_stock; }).length };
    }).filter(function (c) { return c.count > 0; });
    if (chipCats.length) {
      $("[data-subcats]").hidden = false;
      render("cat-chips", '<li><a href="' + esc(allTab.url) + '"' + (allTab.current ? ' aria-current="page"' : "") + ">الكل</a></li>" +
        chipCats.map(function (c) {
          return '<li><a href="' + esc(link(c.url)) + '"' + (cat && c.id === cat.id ? ' aria-current="page"' : "") + ">" + esc(shelfLabel(c.name)) + "</a></li>";
        }).join(""));
    }
    var helpLink = $('[data-render="filter-help"]');
    if (helpLink) helpLink.href = "https://wa.me/" + S.whatsapp;

    /* Filters */
    function shownPrice(p) { return (p.sale_price && p.sale_price < p.price ? p.sale_price : p.price) * (1 + S.tax_rate); }
    var BANDS = [
      { label: "أقل من 100", min: 0, max: 100 },
      { label: "100 إلى 200", min: 100, max: 200 },
      { label: "200 إلى 300", min: 200, max: 300 },
      { label: "أكثر من 300", min: 300, max: Infinity }
    ];
    var state = { stock: true, sale: params.get("sale") === "1", bands: [], sort: "featured" };
    $("[data-filter-sale]").checked = state.sale;
    render("filter-price", BANDS.map(function (b, i) {
      var n = base.filter(function (p) { var v = shownPrice(p); return p.in_stock && v >= b.min && v < b.max; }).length;
      return '<button type="button" aria-pressed="false" data-band="' + i + '"' + (n ? "" : " disabled") + "><span>" + b.label + " ر.س</span><small>" + n + "</small></button>";
    }).join(""));

    function result() {
      var list = base.filter(function (p) {
        if (state.stock && !p.in_stock) return false;
        if (state.sale && !(p.sale_price && p.sale_price < p.price)) return false;
        if (state.bands.length) {
          var v = shownPrice(p);
          if (!state.bands.some(function (i) { return v >= BANDS[i].min && v < BANDS[i].max; })) return false;
        }
        return true;
      });
      var order = {};
      base.forEach(function (p, i) { order[p.id] = i; });
      var sorters = {
        featured: function (a, b) { return (b.in_stock - a.in_stock) || order[a.id] - order[b.id]; },
        "price-asc": function (a, b) { return shownPrice(a) - shownPrice(b); },
        "price-desc": function (a, b) { return shownPrice(b) - shownPrice(a); },
        "new": function (a, b) { return String(b.created || "").localeCompare(String(a.created || "")); },
        rating: function (a, b) { return ((b.rating || {}).count ? b.rating.average * 100 + b.rating.count : 0) - ((a.rating || {}).count ? a.rating.average * 100 + a.rating.count : 0); }
      };
      return list.sort(sorters[state.sort]);
    }

    function draw() {
      var list = result();
      var page = list.slice(0, shown);
      render("cat-grid", page.map(card).join(""));
      var count = list.length;
      render("cat-count", count ? plural(count, "منتج واحد", "منتجان", "منتجات", "منتجاً") : "لا توجد منتجات");
      render("cat-showing", count ? "عرض " + page.length + " من " + count : "");
      $("[data-cat-empty]").hidden = count > 0;
      $("[data-loadmore]").hidden = count <= shown;
      render("cat-progress", "عرضنا " + page.length + " من " + count);
      var bar = $("[data-progress]");
      if (bar) bar.style.width = (count ? Math.round(page.length / count * 100) : 0) + "%";
      var active = state.bands.length + (state.sale ? 1 : 0) + (state.stock ? 0 : 1);
      var badge = $("[data-filter-count]");
      badge.textContent = active;
      badge.hidden = !active;
      $(".rs-filters__clear").hidden = !active;
      $$("[data-filter-apply]").forEach(function (b) { b.textContent = count ? "عرض " + plural(count, "منتج واحد", "منتجين", "منتجات", "منتجاً") : "لا توجد نتائج"; });
      /* Removable chips for each active filter */
      var X = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
      render("active-filters",
        state.bands.map(function (i) { return '<li><button type="button" data-drop-band="' + i + '" aria-label="إزالة ' + BANDS[i].label + ' ر.س">' + BANDS[i].label + " ر.س" + X + "</button></li>"; }).join("") +
        (state.sale ? '<li><button type="button" data-drop="sale" aria-label="إزالة: عليه خصم">عليه خصم' + X + "</button></li>" : "") +
        (!state.stock ? '<li><button type="button" data-drop="stock" aria-label="إزالة: يشمل النافد">يشمل النافد' + X + "</button></li>" : ""));
    }

    function setBand(i, on) {
      state.bands = on ? state.bands.concat(i) : state.bands.filter(function (x) { return x !== i; });
      var b = $('[data-band="' + i + '"]');
      if (b) b.setAttribute("aria-pressed", on ? "true" : "false");
      shown = PAGE; draw();
    }
    $$("[data-band]").forEach(function (b) {
      b.addEventListener("click", function () {
        var i = +b.getAttribute("data-band");
        setBand(i, state.bands.indexOf(i) === -1);
      });
    });
    $('[data-render="active-filters"]').addEventListener("click", function (e) {
      var band = e.target.closest("[data-drop-band]");
      if (band) setBand(+band.getAttribute("data-drop-band"), false);
      var d = e.target.closest("[data-drop]");
      if (d && d.getAttribute("data-drop") === "sale") { state.sale = false; $("[data-filter-sale]").checked = false; shown = PAGE; draw(); }
      if (d && d.getAttribute("data-drop") === "stock") { state.stock = true; $("[data-filter-stock]").checked = true; shown = PAGE; draw(); }
    });
    $("[data-filter-stock]").addEventListener("change", function (e) { state.stock = e.target.checked; shown = PAGE; draw(); });
    $("[data-filter-sale]").addEventListener("change", function (e) { state.sale = e.target.checked; shown = PAGE; draw(); });
    $("[data-sort]").addEventListener("change", function (e) { state.sort = e.target.value; shown = PAGE; draw(); });
    $("[data-more]").addEventListener("click", function () {
      var first = shown;
      shown += PAGE;
      draw();
      var next = $$('[data-render="cat-grid"] > li')[first];
      if (next) { var a = $("a[href]:not([tabindex='-1'])", next); if (a) a.focus({ preventScroll: true }); }
    });
    $$("[data-filter-reset]").forEach(function (b) {
      b.addEventListener("click", function () {
        state = { stock: true, sale: false, bands: [], sort: state.sort };
        $$("[data-band]").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        $("[data-filter-stock]").checked = true;
        $("[data-filter-sale]").checked = false;
        shown = PAGE; draw();
      });
    });

    /* Filters open as a side panel (a bottom sheet on phones) */
    var sheet = $("[data-filters]");
    var scrim = $(".rs-filters__scrim");
    var opener = $("[data-open-filters]");
    function sheetOpen(on) {
      sheet.classList.toggle("is-open", on);
      scrim.hidden = !on;
      opener.setAttribute("aria-expanded", on ? "true" : "false");
      document.body.style.overflow = on ? "hidden" : "";
      if (on) { var f = $(".rs-filters__body button:not([disabled]), .rs-filters__body input", sheet); if (f) f.focus(); } else opener.focus();
    }
    opener.addEventListener("click", function () { sheetOpen(true); });
    $$("[data-close-filters]").forEach(function (b) { b.addEventListener("click", function () { if (sheet.classList.contains("is-open")) sheetOpen(false); }); });
    sheet.addEventListener("keydown", function (e) { if (e.key === "Escape" && sheet.classList.contains("is-open")) sheetOpen(false); });

    draw();
  }

  /* ---------- cart page: the preview cart now; Zid's cart template once installed ---------- */
  function cartPage() {
    var MINUS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h12"/></svg>';
    var PLUS_ = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6v12M6 12h12"/></svg>';
    function unit(p) { return p.sale_price && p.sale_price < p.price ? p.sale_price : p.price; }
    /* VAT is rounded on the unit price, then multiplied, so 2 × 260.00 is 520.00 as in Zid. */
    function incl(v) { return Math.round(v * (1 + S.tax_rate) * 100 + 1e-6) / 100; }
    function draw() {
      var ls = Cart.lines();
      var n = ls.reduce(function (s, l) { return s + l.qty; }, 0);
      var sub = ls.reduce(function (s, l) { return s + incl(unit(l.p)) * l.qty; }, 0);
      var save = ls.reduce(function (s, l) { return s + (incl(l.p.price) - incl(unit(l.p))) * l.qty; }, 0);
      $("[data-bag-full]").hidden = !n;
      $("[data-bag-empty]").hidden = !!n;
      $("[data-bag-sticky]").hidden = !n;
      render("bag-count", n ? plural(n, "منتج واحد", "منتجان", "منتجات", "منتجاً") : "");
      render("bag-items", ls.map(function (l) {
        var p = l.p, sale = unit(p) < p.price, url = href(p);
        return '<li class="rs-line">' +
          '<a class="rs-line__img" href="' + esc(url) + '" tabindex="-1" aria-hidden="true"><img src="' + esc(img(p.image, 240)) + '" alt="" width="96" height="120" loading="lazy"></a>' +
          '<div class="rs-line__info">' +
            '<span class="rs-card__cat">' + esc(shelfLabel(shelf(p))) + "</span>" +
            '<h3 class="rs-line__name"><a href="' + esc(url) + '">' + esc(p.name) + "</a></h3>" +
            '<p class="rs-card__price' + (sale ? " rs-card__price--sale" : "") + '"><strong>' + money(unit(p)) + "</strong>" + (sale ? "<del>" + money(p.price) + "</del>" : "") + "</p>" +
            '<button class="rs-line__remove" type="button" data-remove="' + esc(p.id) + '" aria-label="إزالة ' + esc(p.name) + ' من السلة">إزالة</button>' +
          "</div>" +
          '<div class="rs-qty" role="group" aria-label="كمية ' + esc(p.name) + '">' +
            '<button type="button" aria-label="زيادة الكمية" data-line-plus="' + esc(p.id) + '"' + (l.qty >= 10 ? " disabled" : "") + ">" + PLUS_ + "</button>" +
            '<span aria-live="polite">' + l.qty + "</span>" +
            '<button type="button" aria-label="إنقاص الكمية" data-line-minus="' + esc(p.id) + '"' + (l.qty <= 1 ? " disabled" : "") + ">" + MINUS + "</button>" +
          "</div>" +
          '<p class="rs-line__total">' + sar(incl(unit(p)) * l.qty) + "</p>" +
        "</li>";
      }).join(""));
      render("sum-label", "المجموع (" + plural(n, "منتج واحد", "منتجان", "منتجات", "منتجاً") + ")");
      render("sum-sub", sar(sub));
      $("[data-sum-save]").hidden = save <= 0;
      render("sum-save", "− " + sar(save));
      render("sum-total", sar(sub));
      render("sum-vat", "شامل ضريبة القيمة المضافة " + sar(Math.round(sub * S.tax_rate / (1 + S.tax_rate) * 100) / 100));
      render("sum-split", "أو 4 دفعات بقيمة <strong>" + sar(Math.round(sub / 4 * 100) / 100) + "</strong> مع تمارا أو تابي، بدون فوائد.");
      /* Suggestions: best rated in-stock products that aren't in the cart. */
      var inBag = ls.map(function (l) { return l.p.id; });
      var picks = STORE.products.filter(function (p) { return p.in_stock && p.rating && p.rating.count && inBag.indexOf(p.id) === -1; })
        .sort(function (a, b) { return b.rating.average * 100 + b.rating.count - (a.rating.average * 100 + a.rating.count); }).slice(0, 4);
      render("upsell-title", n ? "قد يعجبك أيضاً" : "الأعلى تقييماً في رساس");
      render("upsell", picks.map(function (p) { return card(p, { stars: true }); }).join(""));
    }
    $('[data-render="bag-items"]').addEventListener("click", function (e) {
      var plus = e.target.closest("[data-line-plus]");
      var minus = e.target.closest("[data-line-minus]");
      var btn = plus || minus;
      if (!btn) return;
      var id = btn.getAttribute(plus ? "data-line-plus" : "data-line-minus");
      var line = Cart.lines().filter(function (l) { return l.p.id === id; })[0];
      if (!line) return;
      Cart.setQty(id, line.qty + (plus ? 1 : -1));
      /* Keep keyboard focus on the same button after the list redraws. */
      var again = $("[data-line-" + (plus ? "plus" : "minus") + '="' + id + '"]');
      if (again && !again.disabled) again.focus();
    });
    $("[data-coupon]").addEventListener("submit", function (e) {
      e.preventDefault();
      /* Zid checks and applies coupons in its own checkout; nothing is validated here. */
      toast(PREVIEW ? "معاينة: الكود يُطبَّق في صفحة الدفع في زد" : "يُطبَّق الكود في الخطوة التالية");
    });
    $$("[data-checkout]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        if (!PREVIEW) return;
        e.preventDefault();
        toast("معاينة: إتمام الطلب يتم في صفحة الدفع في زد");
      });
    });
    /* Phones: a total + checkout bar while the summary's button is off screen. */
    var bar = $("[data-bag-sticky]");
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        var off = !entries[0].isIntersecting;
        bar.classList.toggle("is-on", off);
        bar.setAttribute("aria-hidden", off ? "false" : "true");
        $("a", bar).tabIndex = off ? 0 : -1;
      }).observe($(".rs-bag__checkout"));
    }
    Cart.onChange(draw);
    draw();
  }

  /* ---------- product page ---------- */
  function productPage() {
    var root = $("[data-product-page]");
    var id = new URLSearchParams(location.search).get("id");
    var p = STORE.products.filter(function (x) { return x.id === id; })[0] || byName["مارشميلو 50 مل"] || STORE.products[0];
    var sale = p.sale_price && p.sale_price < p.price;
    var now = sale ? p.sale_price : p.price;
    var cat = shelf(p);
    var catRec = (STORE.all_categories || []).filter(function (c) { return c.name === cat; })[0];
    var catLink = link(catRec ? catRec.url : "/categories");
    var images = p.images && p.images.length ? p.images : [p.image];

    document.title = p.name + " | " + S.name;
    var desc = $('meta[name="description"]');
    if (desc && p.description) desc.setAttribute("content", p.description.slice(0, 155));

    render("pdp-crumbs", '<li><a href="index.html">الرئيسية</a></li>' + (cat ? '<li><a href="' + esc(catLink) + '">' + esc(shelfLabel(cat)) + "</a></li>" : "") + '<li aria-current="page">' + esc(p.name) + "</li>");

    /* Gallery: main photo plus thumbnails; on phones the main photo swipes. */
    var main = $(".rs-pdp__main img", root);
    function show(i) {
      main.src = img(images[i], 1000);
      main.srcset = srcset(images[i], [600, 1000, 1400]);
      main.alt = p.name + (images.length > 1 ? "، الصورة " + (i + 1) + " من " + images.length : "");
      $$(".rs-pdp__thumb", root).forEach(function (t, j) { t.setAttribute("aria-current", j === i ? "true" : "false"); });
      current = i;
    }
    var current = 0;
    render("pdp-thumbs", images.length > 1 ? images.map(function (u, i) {
      return '<li><button class="rs-pdp__thumb" type="button" aria-label="الصورة ' + (i + 1) + '" data-thumb="' + i + '"><img src="' + esc(img(u, 160)) + '" alt="" width="80" height="100"></button></li>';
    }).join("") : "");
    show(0);
    $$("[data-thumb]", root).forEach(function (b) { b.addEventListener("click", function () { show(+b.getAttribute("data-thumb")); }); });
    var x0 = null;
    $(".rs-pdp__main", root).addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    $(".rs-pdp__main", root).addEventListener("touchend", function (e) {
      if (x0 === null || images.length < 2) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) show((current + (dx > 0 ? 1 : -1) + images.length) % images.length);
      x0 = null;
    });
    if (sale) render("pdp-badge", "خصم " + Math.round((1 - p.sale_price / p.price) * 100) + "%");
    else $('[data-render="pdp-badge"]', root).hidden = true;

    /* Text */
    render("pdp-cat", esc(shelfLabel(cat)));
    render("pdp-name", esc(p.name));
    var rating = p.rating && p.rating.count ? p.rating : null;
    render("pdp-rating", rating
      ? '<span class="rs-stars" role="img" aria-label="التقييم ' + rating.average + ' من 5">' + stars(rating.average) + "</span><span>" + rating.average.toFixed(1) + " (" + plural(rating.count, "تقييم واحد", "تقييمان", "تقييمات", "تقييماً") + ")</span>"
      : '<span class="rs-stars" aria-hidden="true">' + stars(0) + "</span><span>لا تقييمات بعد</span>");
    render("pdp-price", "<strong>" + money(now) + "</strong>" + (sale ? "<del>" + money(p.price) + "</del>" : "") + '<span class="rs-pdp__vat">شامل الضريبة</span>');
    render("pdp-split", "أو 4 دفعات بقيمة <strong>" + money(now / 4) + "</strong> مع تمارا أو تابي، بدون فوائد.");
    var text = p.description || "";
    var first = text.split("\n")[0];
    /* The intro next to the price only appears when the full description has more than it. */
    if (text.indexOf("\n") > -1 || first.length > 220) render("pdp-short", esc(first.length > 220 ? first.slice(0, 220).replace(/\s+\S*$/, "") + "…" : first));
    else $('[data-render="pdp-short"]', root).hidden = true;
    render("pdp-desc", text ? text.split("\n").map(function (l) { return "<p>" + esc(l) + "</p>"; }).join("") : "<p>لا يوجد وصف لهذا المنتج بعد.</p>");

    /* Buy box: quantity, add to cart, or a link for products with options / out of stock */
    var qtyEl = $("[data-qty]", root);
    var qty = 1;
    function setQty(n) { qty = Math.max(1, Math.min(10, n)); qtyEl.textContent = qty; }
    $("[data-qty-plus]", root).addEventListener("click", function () { setQty(qty + 1); });
    $("[data-qty-minus]", root).addEventListener("click", function () { setQty(qty - 1); });
    var buy = $$("[data-pdp-buy]");
    buy.forEach(function (b) {
      if (!p.in_stock) {
        b.disabled = true;
        b.textContent = "نفدت الكمية";
      } else if (p.has_options) {
        b.textContent = "اختر الحجم في صفحة المتجر";
        b.addEventListener("click", function () { location.href = p.url; });
      } else {
        b.addEventListener("click", function () {
          b.disabled = true;
          Cart.add(p.id, p.name, qty).then(function () { b.disabled = false; }, function () { b.disabled = false; });
        });
      }
    });
    if (!p.in_stock || p.has_options) $(".rs-qty", root).hidden = true;
    $$("[data-pdp-total]").forEach(function (t) { t.textContent = money(now); });
    $$("[data-pdp-title]").forEach(function (t) { t.textContent = p.name; });

    /* Sticky bar on phones once the main button scrolls out of view */
    var bar = $("[data-pdp-sticky]");
    if (bar && "IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        bar.classList.toggle("is-visible", !entries[0].isIntersecting && entries[0].boundingClientRect.top < 0);
      }).observe($(".rs-pdp__buy", root));
    }

    /* Related: same shelf, in stock, not this product */
    /* Four from the same category, topped up with the best rated when the category is small. */
    var related = STORE.products.filter(function (x) { return x.in_stock && x.id !== p.id && cat && x.categories.indexOf(cat) !== -1; }).slice(0, 4);
    if (related.length < 4) {
      var ids = related.map(function (x) { return x.id; }).concat(p.id);
      related = related.concat(STORE.products.filter(function (x) { return x.in_stock && x.rating && x.rating.count && ids.indexOf(x.id) === -1; })
        .sort(function (a, b) { return b.rating.average * 100 + b.rating.count - (a.rating.average * 100 + a.rating.count); })).slice(0, 4);
    }
    render("pdp-related", related.map(function (x) { return card(x, { stars: true }); }).join(""));
  }

  /* ---------- newsletter (footer) ---------- */
  $$("[data-newsletter]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      /* Not connected yet: wire this to the newsletter service at install, and only then show a thank-you. */
      toast("معاينة: يُربط الاشتراك بالنشرة عند التركيب في زد");
      form.reset();
    });
  });

  /* ---------- add to cart ---------- */
  document.addEventListener("click", function (e) {
    var add = e.target.closest("[data-add]");
    if (add) {
      add.disabled = true;
      Cart.add(add.getAttribute("data-add"), add.getAttribute("data-name")).then(function () { add.disabled = false; }, function () { add.disabled = false; });
    }
    var rm = e.target.closest("[data-remove]");
    if (rm) Cart.remove(rm.getAttribute("data-remove"));
  });
  Cart.paint();

  /* ---------- header: fold the category row while scrolling down ---------- */
  (function compactHeader() {
    var header = $("[data-header]");
    var ticking = false;
    function update() {
      var y = window.scrollY;
      if (y > 160) header.classList.add("is-compact");
      else if (y < 80) header.classList.remove("is-compact");
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  })();

  /* ---------- search: instant suggestions from the store's products ---------- */
  (function search() {
    var header = $("[data-header]");
    var box = $("[data-search]");
    var input = $("#rs-search-input");
    var list = $("#rs-search-list");
    var toggle = $("[data-toggle-search]");
    var results = [];
    var active = -1;
    var SUGGEST = ["عنبر", "عود", "مسك", "توزيعات"];

    var index = STORE.products.filter(function (p) { return p.in_stock; }).map(function (p) {
      return { p: p, name: norm(p.name), cats: norm(p.categories.join(" ")) };
    });

    function open(isOpen) {
      list.hidden = !isOpen;
      input.setAttribute("aria-expanded", isOpen ? "true" : "false");
      if (!isOpen) { active = -1; input.removeAttribute("aria-activedescendant"); }
    }
    function mark() {
      $$(".rs-search__item", list).forEach(function (li, i) { li.setAttribute("aria-selected", i === active ? "true" : "false"); });
      if (active >= 0) input.setAttribute("aria-activedescendant", "rs-sr-" + active); else input.removeAttribute("aria-activedescendant");
    }
    function run() {
      var q = norm(input.value.trim());
      if (q.length < 2) { open(false); return; }
      var words = q.split(/\s+/);
      results = index.map(function (r) {
        var score = 0;
        words.forEach(function (w) { if (r.name.indexOf(w) === 0) score += 3; else if (r.name.indexOf(w) > -1) score += 2; else if (r.cats.indexOf(w) > -1) score += 1; else score -= 100; });
        return { r: r, score: score };
      }).filter(function (x) { return x.score > 0; })
        .sort(function (a, b) { return b.score - a.score; })
        .slice(0, 6).map(function (x) { return x.r.p; });
      active = -1;
      if (results.length) {
        list.innerHTML = results.map(function (p, i) {
          return '<li class="rs-search__item" id="rs-sr-' + i + '" role="option" aria-selected="false"><a href="' + esc(href(p)) + '" tabindex="-1">' +
            '<img src="' + esc(img(p.image, 120)) + '" alt="" width="48" height="48"><span>' + esc(p.name) + "</span><strong>" + money(p.sale_price || p.price) + "</strong></a></li>";
        }).join("");
      } else {
        list.innerHTML = '<li class="rs-search__empty" role="option" aria-disabled="true">لا نتائج لـ «' + esc(input.value.trim()) + '». جرّب:<br>' +
          SUGGEST.map(function (s) { return '<button type="button" data-suggest="' + s + '">' + s + "</button>"; }).join("") + "</li>";
      }
      open(true);
    }

    input.addEventListener("input", run);
    input.addEventListener("focus", function () { if (input.value.trim().length >= 2) run(); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" && results.length) { active = Math.min(active + 1, results.length - 1); mark(); e.preventDefault(); }
      else if (e.key === "ArrowUp" && results.length) { active = Math.max(active - 1, 0); mark(); e.preventDefault(); }
      else if (e.key === "Enter") {
        /* Enter on a highlighted suggestion opens it; otherwise the full results page (preview) or the top match. */
        e.preventDefault();
        if (active >= 0 && results[active]) location.href = href(results[active]);
        else if (PREVIEW && input.value.trim().length >= 2) location.href = "category.html?q=" + encodeURIComponent(input.value.trim());
        else if (results[0]) location.href = href(results[0]);
      }
      else if (e.key === "Escape") { panel(false); toggle.focus(); }
    });
    list.addEventListener("mousedown", function (e) {
      var s = e.target.closest("[data-suggest]");
      if (s) { e.preventDefault(); input.value = s.getAttribute("data-suggest"); run(); input.focus(); }
    });
    /* The search icon opens a panel under the header; clicking elsewhere closes it. */
    function panel(on) {
      box.hidden = !on;
      toggle.setAttribute("aria-expanded", on ? "true" : "false");
      header.classList.toggle("is-searching", on);
      if (on) input.focus(); else open(false);
    }
    toggle.addEventListener("click", function () { panel(box.hidden); });
    document.addEventListener("click", function (e) {
      if (!box.hidden && !box.contains(e.target) && !toggle.contains(e.target)) panel(false);
    });
  })();

  /* ---------- drawers ---------- */
  function drawer(rootSel, openSel, closeSel) {
    var root = $(rootSel);
    var opener = null;
    function open(e) {
      opener = e.currentTarget;
      root.hidden = false;
      document.body.style.overflow = "hidden";
      if (opener.hasAttribute("aria-expanded")) opener.setAttribute("aria-expanded", "true");
      $(".rs-drawer__panel", root).focus();
    }
    function close() {
      if (root.hidden) return;
      root.hidden = true;
      document.body.style.overflow = "";
      if (opener) {
        if (opener.hasAttribute("aria-expanded")) opener.setAttribute("aria-expanded", "false");
        opener.focus();
      }
    }
    $$(openSel).forEach(function (b) {
      b.addEventListener("click", function (e) {
        /* With Zid's cart installed, the cart button opens Zid's own cart. */
        if (rootSel === "#rs-cart" && Cart.isZid && typeof window.showShoppingCart === "function") { window.showShoppingCart(); return; }
        open(e);
      });
    });
    $$(closeSel, root).forEach(function (b) { b.addEventListener("click", close); });
    root.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        var f = $$('a[href], button:not([disabled]), [tabindex="0"]', root).filter(function (x) { return x.offsetParent !== null; });
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { f[f.length - 1].focus(); e.preventDefault(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { f[0].focus(); e.preventDefault(); }
      }
    });
  }
  drawer("#rs-drawer", "[data-open-drawer]", "[data-close-drawer]");
  drawer("#rs-cart", "[data-open-cart]", "[data-close-cart]");

  /* Preview only: pages this preview doesn't have (policies, login, blog) open on the live store instead of a 404. */
  if (PREVIEW) {
    $$('a[href^="/"]').forEach(function (a) {
      var path = a.getAttribute("href");
      if (path !== "/" && path !== "/checkout") a.href = "https://resas.sa.com" + path;
    });
  }
})();
