/* Resas on Zid's Soft theme: the approved homepage design, built from the store's own dashboard sections.
   Paste the whole file into Zid: المظهر ← تخصيص الثيم ← JavaScript مخصص.
   What comes from the dashboard (change it there, the page follows):
     - the banner: the first banner section of the home page
     - the category row: the category sections (names, images, links)
     - the product tabs: every product section (its title and its first products)
     - every other section you add in the dashboard (banners, gallery...) stays on the page, in its order
     - reviews, menu, footer, store logo
   Nothing else is added by this file. The top bar, the logo and the four tiles are set in the dashboard too. Extra blocks (featured
   products, blog, Instagram...) exist but are OFF; switch one on in RESAS.extras below. */
(function () {
  "use strict";

  var RESAS = {
    /* The top bar, the logo and the four tiles are now set in the dashboard (شريط التنبيهات، الشعار، شرائح البطاقات); nothing here. */
    announcement: "",
    whatsapp: "966590000902",
    /* Header logo override. Better: upload the logo in Zid's store settings and leave this empty. */
    logo: "",
    /* Shown only when the dashboard has no banner section. */
    bannerFallback: "https://mohammedaboseedo.github.io/resas-store-design/storefront/assets/img/banner.webp",
    about: { title: "ثمانية عشر عاماً في صناعة الرائحة", text: "نشأت رساس في المملكة العربية السعودية عام 2008، لتقدم عطوراً فرنسية وشرقية بأسلوب دافئ وأنيق، وبخوراً وعوداً من أجود الأنواع.", cta: "تسوّق عطور رساس" },
    /* Extra blocks the dashboard does not have. All off: set true to show one. */
    extras: { about: false, tiles: true, deals: true, featured: false, duo: false, blog: false, instagram: false },
    tileText: "اكتشف المجموعة",
    tabLimit: 10,
    featuredCount: 6,
    /* The sale band reads the discounted products of the home page (set the discount on the product in Zid); nothing is listed here. */
    dealUrls: [],
    instagram: "resas_perfume"
  };

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function img(path, w) { return "https://media.zid.store/cdn-cgi/image/w=" + w + ",q=82,f=auto/https://media.zid.store/" + path; }
  function el(html) { var t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstChild; }
  function rise(i) { return ' data-rise style="--d:' + (i || 0) + 'ms"'; }
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var io = null;
  function observe(scope) {
    if (reduce || !document.documentElement.classList.contains("rs-anim")) return;
    var items = $$("[data-rise]:not(.rs-in)", scope);
    if (!("IntersectionObserver" in window)) { items.forEach(function (e) { e.classList.add("rs-in"); }); return; }
    if (!io) io = new IntersectionObserver(function (entries) { entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("rs-in"); io.unobserve(en.target); } }); }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (e) { io.observe(e); });
  }

  /* The first product photo of a category or product page, read from the start of the page only (the request is cut as soon as the photo is found). */
  var photos = {};
  function photoIn(html, isProduct, final) {
    var card = /<img[^>]*id="product-card-img[^"]*"[^>]*?\ssrc="\s*([^"\s]+)/.exec(html), og = /property="og:image"\s+content="([^"]+)"/.exec(html) || /content="([^"]+)"\s+property="og:image"/.exec(html);
    if (isProduct) return (og && og[1]) || (card && card[1]) || "";
    return (card && card[1]) || (final && og && og[1]) || "";
  }
  function firstPhoto(url) {
    if (photos[url]) return photos[url];
    var isProduct = /\/products\//.test(url), ctl = window.AbortController ? new AbortController() : null;
    photos[url] = fetch(url, { credentials: "same-origin", signal: ctl ? ctl.signal : undefined }).then(function (r) {
      if (!r.ok) return "";
      if (!r.body || !r.body.getReader || !window.TextDecoder) return r.text().then(function (t) { return photoIn(t, isProduct, true); });
      var rd = r.body.getReader(), dec = new TextDecoder(), buf = "";
      function pump() {
        return rd.read().then(function (x) {
          if (x.done) return photoIn(buf, isProduct, true);
          buf += dec.decode(x.value, { stream: true });
          var f = photoIn(buf, isProduct);
          if (f) { if (ctl) ctl.abort(); return f; }
          return pump();
        });
      }
      return pump();
    }).catch(function () { return ""; });
    return photos[url];
  }

  /* A product page's price, old price and title, read for the hero card and the deals. */
  var cache = {};
  function loadProduct(url) {
    if (cache[url]) return cache[url];
    cache[url] = fetch(url, { credentials: "same-origin" }).then(function (r) { return r.ok ? r.text() : Promise.reject(); }).then(function (html) {
      var d = new DOMParser().parseFromString(html, "text/html");
      var t = function (s) { var e = d.querySelector(s); return e ? e.textContent.replace(/\s+/g, " ").trim() : ""; };
      var og = (d.querySelector('meta[property="og:image"]') || {}).content || "";
      var i = og.lastIndexOf("https://media.zid.store/");
      return { url: url, title: t("h1"), price: t(".product-formatted-price"), old: t(".product-formatted-price-old"), image: i > -1 ? og.slice(i + "https://media.zid.store/".length) : "" };
    }).catch(function () { return null; });
    return cache[url];
  }
  function num(s) { var m = String(s || "").replace(/,/g, "").match(/[\d.]+/); return m ? parseFloat(m[0]) : 0; }

  /* ---------- announcement bar ---------- */
  function announcement() {
    if (!RESAS.announcement || $(".rs-announce")) return;
    var header = $("header");
    if (header) header.parentNode.insertBefore(el('<div class="rs-announce">' + esc(RESAS.announcement) + "</div>"), header);
  }

  /* The page you are on gets the gold underline in the menu, as in the design (Soft does not mark it). */
  function navCurrent() {
    var path = location.pathname, dec = path; try { dec = decodeURIComponent(path); } catch (e) {}
    $$("header .menu-link, nav .menu-link").forEach(function (a) {
      var h = (a.getAttribute("href") || "").split("?")[0], d = h; try { d = decodeURIComponent(h); } catch (e) {}
      var key = d.split("/").slice(0, 3).join("/");
      a.classList.toggle("rs-current", d === "/" ? path === "/" : d.length > 1 && dec.indexOf(key) === 0);
    });
  }

  /* The all-categories page shows Zid's English label; the store is Arabic. */
  function allCategoriesLabel() {
    $$(".breadcrumb-item.active, .breadcrumb-item.active *").forEach(function (e) {
      if (e.children.length === 0 && /^\W*all categories\W*$/i.test(e.textContent.trim())) e.textContent = "كل التصنيفات";
    });
  }

  /* ---------- header: menu and search on the start side, logo centred, account and cart on the end side ---------- */
  function header() {
    var bar = $(".search-header-bar");
    if (!bar || $(".rs-hstart", bar)) return;
    var start = el('<div class="rs-hstart"></div>');
    var menu = $(".header-logo .icon-menu-top");
    var search = $(".search-input.lg-search-div", bar);
    if (menu) start.appendChild(menu);
    if (search) start.appendChild(search);
    bar.insertBefore(start, bar.firstChild);
    var cart = $(".header-cart"), account = $(".account-area"), cartLink = $(".a-shopping-cart"), mobileSearch = $(".sm-search-icon"), region = $(".header-cart .language-currency");
    /* RTL, from the logo outwards: language, search (phones), account, then the cart at the far end. */
    if (cart && account) cart.insertBefore(account, cart.firstChild);
    if (cart && mobileSearch) cart.insertBefore(mobileSearch, cart.firstChild);
    if (cart && region) cart.insertBefore(region, cart.firstChild);
    if (cart && cartLink && cartLink.parentNode !== cart) cart.appendChild(cartLink.parentNode);
    var logoImg = $(".header-logo .image-logo");
    if (RESAS.logo && logoImg) { logoImg.removeAttribute("srcset"); logoImg.src = RESAS.logo; }
    /* The brand mark at the top of the phone menu. */
    var drawerTop = $(".slide-menu .menu-header-theme-bg-primary > li:first-child > div, .slide-menu ul > li:first-child > div");
    if (drawerTop && logoImg && !$(".rs-drawer-logo", drawerTop)) { var dl = document.createElement("img"); dl.className = "rs-drawer-logo"; dl.alt = ""; dl.src = logoImg.currentSrc || logoImg.src; drawerTop.appendChild(dl); }
    /* The store's social links, taken from the footer (set in the dashboard), at the bottom of the phone menu. */
    var soc = $("footer .social-icons"), topList = $(".slide-menu .menu-header-theme-bg-primary") || $(".slide-menu ul");
    if (soc && topList && !$(".rs-drawer-social", topList)) { var sli = document.createElement("li"); sli.className = "rs-drawer-social"; sli.appendChild(soc.cloneNode(true)); topList.appendChild(sli); }
    var lang = $(".account-lang-currency");
    if (lang) lang.style.display = "none";
  }

  /* ---------- reading the store's own sections ---------- */
  function sized(src, w) { src = String(src || "").trim(); return /cdn-cgi\/image\//.test(src) ? src.replace(/w=\d+/, "w=" + w) : src; }
  function txt(e) { return e ? e.textContent.replace(/\s+/g, " ").trim() : ""; }
  function live(list) { return list.filter(function (e) { return !e.closest(".slick-cloned"); }); }
  function cardInfo(c) {
    var a = $('a[href*="/products/"]', c), im = $("img[id^='product-card-img']", c), pr = $(".product-price span", c);
    var old = $(".product-prev-price, .product-price del, .product-price .old-price, .product-price [class*='old']", c);
    var rt = $(".product-card-rating", c), rc = $(".product-card-rating-count", c), w = $("[data-wishlist-id]", c);
    if (!a || !im) return null;
    return {
      url: a.getAttribute("href"), name: txt($(".product-title", c)), image: im.getAttribute("src"),
      price: pr ? pr.innerHTML : "", priceNum: num(txt(pr)), oldHtml: old ? old.innerHTML : "", oldNum: old ? num(txt(old)) : 0,
      rating: rt ? parseFloat(rt.getAttribute("data-rating")) || 0 : 0, count: rc ? num(txt(rc)) : 0,
      id: w ? w.getAttribute("data-wishlist-id") : "", canAdd: !!$(".product-card-add-to-cart", c), inStock: !$(".btn-product-card-out-of-stock", c), node: c
    };
  }
  function readStore(root) {
    var S = { hero: null, cats: [], sections: [], cards: [], used: [], banners: [], tiles: [], strip: [] };
    var ss = $$("section.ss", root);
    if (ss[0]) {
      var hi = live($$("img", ss[0]))[0], ha = hi && hi.closest("a");
      if (hi) S.hero = { src: (hi.getAttribute("src") || "").trim() || (hi.currentSrc || ""), url: ha ? ha.getAttribute("href") : "", alt: hi.getAttribute("alt") || "" };
    }
    var galleries = $$(".gallery-section", root), strips = galleries.filter(function (g) { return live($$("img", g)).length >= 5; }), plain = galleries.filter(function (g) { return strips.indexOf(g) < 0; });
    S.used = S.used.concat(ss, galleries);
    /* The photo strip above the footer: a "مجموعة الصور" section with five or more photos (the photos and their links come from the dashboard). */
    S.strip = [];
    strips.slice(0, 1).forEach(function (g) {
      live($$("img", g)).forEach(function (im) {
        var a = im.closest("a"), src = (im.getAttribute("src") || im.getAttribute("data-src") || "").trim() || (im.getAttribute("srcset") || im.getAttribute("data-srcset") || "").split(",").pop().trim().split(" ")[0];
        if (src) S.strip.push({ src: src, url: a ? a.getAttribute("href") : "", alt: im.getAttribute("alt") || "" });
      });
    });
    S.banners = [];
    ss.slice(1).concat(plain).forEach(function (sec) {
      live($$("img", sec)).forEach(function (im) {
        var a = im.closest("a"), src = (im.getAttribute("src") || im.getAttribute("data-src") || "").trim() || (im.getAttribute("srcset") || im.getAttribute("data-srcset") || "").split(",").pop().trim().split(" ")[0];
        if (src && !S.banners.some(function (b) { return b.src === src; })) S.banners.push({ src: src, url: a ? a.getAttribute("href") : "", alt: im.getAttribute("alt") || "" });
      });
    });
    /* The four tiles: a "شرائح البطاقات" section in the dashboard. Card title = "title | small text", link and image as set there. */
    S.tiles = [];
    $$(".home-cards-section", root).forEach(function (sec) {
      S.used.push(sec);
      live($$(".card-item a", sec)).forEach(function (a) {
        var im = $("img", a), h = $("h3", a), parts = txt(h).split("|");
        if (!im) return;
        S.tiles.push({ url: a.getAttribute("href") || "", src: (im.getAttribute("src") || im.getAttribute("data-src") || "").trim(), title: parts[0].trim(), text: parts.slice(1).join("|").trim() });
      });
    });
    $$(".home-categories-section", root).forEach(function (sec) {
      S.used.push(sec);
      live($$(".category-item a", sec)).forEach(function (a) {
        var im = $("img", a), url = a.getAttribute("href");
        if (!im || S.cats.some(function (c) { return c.url === url; })) return;
        S.cats.push({ name: txt($("h3", a)) || im.getAttribute("alt") || "", url: url, image: im.getAttribute("src") });
      });
    });
    var seen = {};
    $$(".home-products-section", root).forEach(function (sec) {
      S.used.push(sec);
      var cards = live($$(".product-item", sec)).map(cardInfo).filter(Boolean);
      if (!cards.length) return;
      S.sections.push({ title: txt($(".section-title", sec)), cards: cards });
      cards.forEach(function (c) { if (!seen[c.url]) { seen[c.url] = 1; S.cards.push(c); } });
    });
    return S;
  }
  function catFor(S, title) { return S.cats.filter(function (c) { return c.name && c.name === title; })[0]; }

  /* ---------- homepage ---------- */
  function home() {
    var root = $(".home");
    if (!root || root.classList.contains("rs-ready")) return;
    var EX = RESAS.extras || {};
    var S = readStore(root);
    if (!S.sections.length) return;
    var anchor = root.firstElementChild;
    var fav = S.cards.filter(function (c) { return c.inStock; });
    var top = fav.slice().sort(function (a, b) { return (b.rating * 10 + b.count) - (a.rating * 10 + a.count); });

    var hero;
    if (S.hero) {
      var himg = '<img class="rs-hero__img" src="' + esc(S.hero.src) + '" alt="' + esc(S.hero.alt || "العرض الرئيسي") + '" fetchpriority="high">';
      hero = el('<section class="rs-hero" aria-label="العرض الرئيسي">' + (S.hero.url ? '<a href="' + esc(S.hero.url) + '">' + himg + "</a>" : himg) + "</section>");
    } else {
      hero = el('<section class="rs-hero" aria-label="العرض الرئيسي"><img class="rs-hero__img" src="' + esc(RESAS.bannerFallback) + '" width="1280" height="494" alt="" fetchpriority="high"></section>');
    }
    (function (im) { var f = function () { if (im.naturalWidth && Math.abs(im.naturalWidth / im.naturalHeight - 2.59) < 0.12) im.setAttribute("data-crop", ""); }; if (im.complete) f(); else im.addEventListener("load", f); })($("img", hero));

    var CHEV = function (d) { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + d + '"/></svg>'; };
    var arches = S.cats.length ? el('<section class="rs-sec" aria-labelledby="rs-cat-title"><div class="rs-wrap"><div class="rs-sec__head"><h2 class="rs-title rs-sec__title" id="rs-cat-title"' + rise(0) + '>تسوّق حسب القسم</h2>' +
      '<a class="rs-link" href="/categories"' + rise(80) + '>عرض كل الأقسام</a></div><div class="rs-rail"><ul class="rs-arches">' +
      S.cats.slice(0, 16).map(function (a, i) {
        return '<li' + rise(Math.min(i, 7) * 55) + '><a class="rs-arch-link" href="' + esc(a.url) + '"><span class="rs-arch-link__frame"><img src="' + esc(sized(a.image, 420)) + '" alt="" loading="lazy"></span><span class="rs-arch-link__name">' + esc(a.name) + "</span></a></li>";
      }).join("") + '</ul><button class="rs-rail__btn rs-rail__btn--prev" type="button" aria-label="الأقسام السابقة" hidden>' + CHEV("M9 6l6 6-6 6") + '</button><button class="rs-rail__btn rs-rail__btn--next" type="button" aria-label="الأقسام التالية" hidden>' + CHEV("M15 6l-6 6 6 6") + "</button></div></div></section>") : null;
    if (arches) (function (rail) {
      var list = $(".rs-arches", rail), prev = $(".rs-rail__btn--prev", rail), next = $(".rs-rail__btn--next", rail);
      function sync() {
        var span = list.scrollWidth - list.clientWidth, at = Math.abs(list.scrollLeft), more = span > 4;
        prev.hidden = next.hidden = !more;
        prev.disabled = at < 4; next.disabled = at > span - 4;
      }
      /* RTL: the list starts on the right and scrolls toward negative values; "next" goes left. */
      prev.addEventListener("click", function () { list.scrollBy({ left: list.clientWidth * 0.9, behavior: "smooth" }); });
      next.addEventListener("click", function () { list.scrollBy({ left: -list.clientWidth * 0.9, behavior: "smooth" }); });
      list.addEventListener("scroll", sync, { passive: true });
      window.addEventListener("resize", sync);
      window.addEventListener("load", sync);
      setTimeout(sync, 300);
    })($(".rs-rail", arches));

    var A = RESAS.about, aimg = (top[0] || S.cards[0]).image;
    var about = el('<section class="rs-sec" aria-labelledby="rs-about-title"><div class="rs-wrap"><div class="rs-about__panel"><div class="rs-about__body"><span class="rs-about__kicker"' + rise(0) + '>عن رساس</span>' +
      '<h2 class="rs-title rs-about__title" id="rs-about-title"' + rise(60) + ">" + esc(A.title) + "</h2><p class=\"rs-about__text\"" + rise(120) + ">" + esc(A.text) + "</p>" +
      '<div class="rs-about__cta"' + rise(180) + '><a class="rs-btn" href="' + esc((S.cats[1] || S.cats[0] || { url: "/categories" }).url) + '">' + esc(A.cta) + "</a></div></div>" +
      '<div class="rs-about__media"' + rise(120) + '><img src="' + esc(sized(aimg, 900)) + '" alt=""></div></div></div></section>');

    /* Tabs: one per product section of the home page, in the dashboard order. */
    var tabs = S.sections.map(function (sec) {
      var cat = catFor(S, sec.title);
      return { label: sec.title, url: cat ? cat.url : "", cards: sec.cards.slice(0, RESAS.tabLimit).map(function (c) { return c.node; }) };
    });
    var picks = el('<section class="rs-sec" aria-labelledby="rs-pop-title"><div class="rs-wrap"><div class="rs-sec__head"><h2 class="rs-title rs-sec__title" id="rs-pop-title"' + rise(0) + '>اختيارات رساس</h2>' +
      '<div class="rs-tabs" role="tablist" aria-label="منتجات رساس"' + rise(80) + '></div></div><div class="rs-panels"></div></div></section>');
    var bar = $(".rs-tabs", picks), panels = $(".rs-panels", picks);
    tabs.forEach(function (t, i) {
      bar.appendChild(el('<button type="button" role="tab" id="rs-tab-' + i + '" aria-controls="rs-panel-' + i + '" aria-selected="' + (i ? "false" : "true") + '"' + (i ? ' tabindex="-1"' : "") + ">" + esc(t.label) + "</button>"));
      var panel = el('<div role="tabpanel" id="rs-panel-' + i + '" aria-labelledby="rs-tab-' + i + '"' + (i ? " hidden" : "") + '><div class="rs-grid rs-grid--five"></div></div>');
      var grid = $(".rs-grid", panel);
      t.cards.forEach(function (c, k) {
        var li = document.createElement("div");
        li.setAttribute("data-rise", ""); li.style.setProperty("--d", (k % 5) * 70 + "ms");
        var card = c.cloneNode(true);
        /* Zid sends 235px thumbnails for sliders; the grid needs larger photos. */
        $$("img[id^='product-card-img']", card).forEach(function (im) { im.src = sized(im.getAttribute("src"), 600); });
        li.appendChild(card); grid.appendChild(li);
      });
      if (t.url) panel.appendChild(el('<p class="rs-more"><a class="rs-btn rs-btn--tone" href="' + esc(t.url) + '">عرض الكل</a></p>'));
      panels.appendChild(panel);
    });
    var btns = $$("[role=tab]", bar);
    var select = function (i, focus) {
      btns.forEach(function (b, j) { b.setAttribute("aria-selected", j === i ? "true" : "false"); b.tabIndex = j === i ? 0 : -1; $("#rs-panel-" + j).hidden = j !== i; });
      if (focus) btns[i].focus();
      observe(picks);
    };
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

    /* The dashboard's other banners and gallery, laid out as one tidy grid; wide strips take a full row. */
    var banners = S.banners.length ? el('<section class="rs-sec" aria-label="عروض"><div class="rs-wrap"><div class="rs-banners">' + S.banners.map(function (b, i) {
      var inner = '<img src="' + esc(sized(b.src, 1200)) + '" alt="' + esc(b.alt) + '" loading="lazy">';
      return (b.url ? '<a class="rs-banner" href="' + esc(b.url) + '"' + rise((i % 2) * 90) + ">" : '<div class="rs-banner"' + rise((i % 2) * 90) + ">") + inner + (b.url ? "</a>" : "</div>");
    }).join("") + "</div></div></section>") : null;
    if (banners) $$(".rs-banner img", banners).forEach(function (im) {
      var f = function () { if (im.naturalWidth / im.naturalHeight >= 3.4) im.closest(".rs-banner").classList.add("rs-banner--wide"); };
      if (im.complete && im.naturalWidth) f(); else im.addEventListener("load", f);
    });

    /* Tiles: the first four product sections, each with its first product photo. */
    var KINDS = ["photo a", "sand", "dark", "photo d"];
    var tiles = !S.tiles.length ? null : el('<section class="rs-sec" aria-label="أقسام مختارة"><div class="rs-wrap"><ul class="rs-tiles">' + S.tiles.slice(0, 4).map(function (t, i) {
      var k = KINDS[i].split(" "), cls = "rs-tile rs-tile--" + k[0] + (k[1] ? " rs-tile--" + k[1] : "");
      var text = '<span class="rs-tile__title">' + esc(t.title) + '</span><span class="rs-tile__text">' + esc(t.text || RESAS.tileText) + "</span>";
      var pic = '<img src="' + esc(sized(t.src, 700)) + '" alt="" loading="lazy">';
      return '<li' + rise(i * 90) + '><a class="' + cls + '" href="' + esc(t.url) + '">' + (k[0] === "photo" ? pic + text : text + pic) + "</a></li>";
    }).join("") + "</ul></div></section>");

    /* Sale band: products on the home page that show an old price; if none do, the optional pages in RESAS.dealUrls are checked. */
    var deals = el('<section class="rs-sec" aria-labelledby="rs-deals-title" hidden><div class="rs-wrap"><div class="rs-dband"></div></div></section>');
    var seen = {};
    var onSale = S.cards.filter(function (c) { if (seen[c.url] || !(c.oldNum > c.priceNum && c.priceNum > 0)) return false; seen[c.url] = 1; return true; }).map(function (c) {
      return { url: c.url, title: c.name, price: c.price, old: c.oldHtml, pct: Math.round((1 - c.priceNum / c.oldNum) * 100), image: c.image };
    });
    var dealsReady = !EX.deals ? Promise.resolve([]) : onSale.length ? Promise.resolve(onSale) : Promise.all((RESAS.dealUrls || []).map(loadProduct)).then(function (list) {
      return list.filter(function (p) { return p && p.old && num(p.old) > num(p.price) && p.image; }).map(function (p) {
        return { url: p.url, title: p.title, price: esc(p.price), old: esc(p.old), pct: Math.round((1 - num(p.price) / num(p.old)) * 100), image: "https://media.zid.store/" + p.image };
      });
    });
    dealsReady.then(function (on) {
      on = on.sort(function (a, b) { return b.pct - a.pct; }).slice(0, 4);
      if (!on.length) return;
      var max = on[0].pct, lead = on[0];
      $(".rs-dband", deals).innerHTML = '<div class="rs-dband__text"><span class="rs-dband__kicker"' + rise(0) + '>عروض رساس</span><h2 class="rs-title rs-dband__title" id="rs-deals-title"' + rise(60) + ">وفّر حتى " + max + "%</h2>" +
        '<p class="rs-dband__lede"' + rise(120) + ">تخفيضات على " + on.length + " منتجات مختارة من رساس، والأسعار شاملة الضريبة.</p>" +
        '<div class="rs-dband__list">' + on.map(function (p, i) {
          return '<a class="rs-drow"' + rise(180 + i * 70) + ' href="' + esc(p.url) + '"><img src="' + esc(sized(p.image, 200)) + '" alt="" loading="lazy"><span><span class="rs-drow__name">' + esc(p.title) + '</span><span class="rs-drow__price"><strong>' + p.price + "</strong><del>" + p.old + '</del></span></span><span class="rs-drow__off">' + p.pct + "%</span></a>";
        }).join("") + "</div></div>" +
        '<div class="rs-dband__media"><img src="' + esc(sized(lead.image, 1000)) + '" alt="' + esc(lead.title) + '" loading="lazy"></div>';
      deals.hidden = false;
      observe(deals);
    });

    /* Featured: the best rated in-stock products of the home page, with the real add-to-cart. */
    var STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>';
    function stars(avg) { var o = ""; for (var k = 1; k <= 5; k++) o += STAR.replace("<svg", '<svg class="' + (k <= Math.round(avg) ? "on" : "") + '"'); return o; }
    var picked = top.slice(0, RESAS.featuredCount);
    var featured = el('<section class="rs-sec" aria-labelledby="rs-mini-title"><div class="rs-wrap"><div class="rs-sec__head"><h2 class="rs-title rs-sec__title" id="rs-mini-title"' + rise(0) + '>منتجات مختارة</h2></div><div class="rs-mini">' +
      picked.map(function (f, i) {
        var add = f.canAdd && f.id
          ? '<a class="btn btn-primary product-card-add-to-cart rs-mini__add" href="' + esc(f.url) + '" onclick="event.preventDefault(); event.stopPropagation(); productCartAddToCart(this,\'' + esc(f.id) + '\')"><img class="add-to-cart-progress d-none" src="https://static.zid.store/00e1f94e/spinner.gif?v=v2.55.0" width="20" height="20" alt="">أضف إلى السلة</a>'
          : '<a class="btn btn-primary rs-mini__add" href="' + esc(f.url) + '">عرض المنتج</a>';
        return '<article class="rs-mini__item"' + rise((i % 3) * 70) + '><a class="rs-mini__img" href="' + esc(f.url) + '" tabindex="-1" aria-hidden="true"><img src="' + esc(sized(f.image, 240)) + '" alt="" loading="lazy"></a>' +
          '<div class="rs-mini__body"><h3 class="rs-mini__name"><a href="' + esc(f.url) + '">' + esc(f.name) + '</a></h3>' +
          '<div class="rs-mini__rate"><span class="rs-mini__stars" role="img" aria-label="' + (f.count ? "التقييم " + f.rating + " من 5" : "لا تقييمات بعد") + '">' + stars(f.rating) + "</span>" + (f.count ? "<span>(" + f.count + ")</span>" : "") + "</div>" +
          '<p class="rs-mini__price">' + f.price + "</p></div>" + add + "</article>";
      }).join("") + "</div></div></section>");

    /* Two banners: the gifts category (found by name in the store's categories) and WhatsApp help. */
    var gifts = S.cats.filter(function (c) { return /هدايا|هدية/.test(c.name); })[0];
    if (!gifts) {
      var gl = $$('a[href*="/categories/"]').filter(function (a) { return /هدايا|هدية/.test(txt(a)); })[0];
      if (gl) gifts = { name: txt(gl), url: gl.getAttribute("href") };
    }
    var brazier = S.cards.filter(function (c) { return /مبخر/.test(c.name); })[0] || top[0];
    var duoItems = [];
    if (gifts) duoItems.push({ kicker: "للمناسبات", title: gifts.name, text: "اختر الأنسب لمن تحب.", cta: "تسوّق " + gifts.name, url: gifts.url, image: brazier.image });
    duoItems.push({ kicker: "محتار في اختيار عطرك؟", title: "نساعدك تختار عطرك المناسب", text: "فريق رساس يرد عليك على واتساب، لك أو لهديتك.", cta: "تحدّث معنا على واتساب", url: "https://wa.me/" + RESAS.whatsapp, image: (top[1] || top[0]).image });
    var duo = el('<section class="rs-sec" aria-label="هدايا ومساعدة"><div class="rs-wrap"><div class="rs-duo">' + duoItems.map(function (d, i) {
      var ext = /^https?:/.test(d.url);
      return '<a class="rs-duo__item"' + rise(i * 90) + ' href="' + esc(d.url) + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + '><span class="rs-duo__body"><span class="rs-duo__kicker">' + esc(d.kicker) + '</span><span class="rs-title rs-duo__title">' + esc(d.title) + '</span><span class="rs-duo__text">' + esc(d.text) + '</span><span class="rs-link">' + esc(d.cta) + '</span></span><span class="rs-duo__img"><img src="' + esc(sized(d.image, 720)) + '" alt="" loading="lazy"></span></a>';
    }).join("") + "</div></div></section>");

    /* Blog: the newest posts of the store blog, read from the blog itself. */
    var blog = el('<section class="rs-sec" aria-labelledby="rs-blog-title" hidden><div class="rs-wrap"><div class="rs-sec__head"><h2 class="rs-title rs-sec__title" id="rs-blog-title">من مدونة رساس</h2></div><div class="rs-posts"></div><div class="rs-posts__more"><a class="rs-link" href="/blogs/المدونة">كل المقالات</a></div></div></section>');
    if (EX.blog) fetch("/blogs/المدونة", { credentials: "same-origin" }).then(function (r) { return r.ok ? r.text() : Promise.reject(); }).then(function (html) {
      var d = new DOMParser().parseFromString(html, "text/html"), links = [];
      $$("a[href]", d).forEach(function (a) {
        var u; try { u = new URL(a.getAttribute("href"), location.origin); } catch (e) { return; }
        if (u.origin !== location.origin || u.pathname.indexOf("/blogs/") !== 0 || decodeURIComponent(u.pathname) === "/blogs/المدونة" || links.indexOf(u.pathname) > -1) return;
        links.push(u.pathname);
      });
      return Promise.all(links.slice(0, 3).map(function (p) {
        return fetch(p, { credentials: "same-origin" }).then(function (r) { return r.text(); }).then(function (h) {
          var pd = new DOMParser().parseFromString(h, "text/html"), m = function (n) { return (pd.querySelector('meta[property="' + n + '"]') || {}).content || ""; };
          return { url: p, title: m("og:title") || txt($("h1", pd)), text: m("og:description"), image: m("og:image") };
        }).catch(function () { return null; });
      }));
    }).then(function (posts) {
      posts = (posts || []).filter(function (p) { return p && p.title && p.image; });
      if (!posts.length) return;
      $(".rs-posts", blog).innerHTML = posts.map(function (b, i) {
        return '<a class="rs-post"' + rise(i * 90) + ' href="' + esc(b.url) + '"><span class="rs-post__img"><img src="' + esc(b.image) + '" alt="" loading="lazy"></span><h3 class="rs-post__title">' + esc(b.title) + '</h3><p class="rs-post__text">' + esc(b.text) + '</p><span class="rs-link">اقرأ المزيد</span></a>';
      }).join("");
      blog.hidden = false;
      observe(blog);
    }).catch(function () {});

    /* Instagram: product photos spread across the store until real posts are linked. */
    var step = Math.max(1, Math.floor(fav.length / 6)), igPics = [];
    for (var q = 0; q < fav.length && igPics.length < 6; q += step) igPics.push(fav[q].image);
    var insta = el('<section class="rs-insta" aria-labelledby="rs-insta-title"><div class="rs-wrap rs-insta__head"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".6"/></svg>' +
      '<h2 class="rs-title rs-sec__title" id="rs-insta-title"' + rise(0) + '>تابعنا على إنستغرام</h2><a class="rs-insta__handle" href="https://www.instagram.com/' + RESAS.instagram + '" target="_blank" rel="noopener">@' + RESAS.instagram + '</a></div><ul class="rs-insta__grid">' +
      igPics.map(function (m) { return '<li><a href="https://www.instagram.com/' + RESAS.instagram + '" target="_blank" rel="noopener" aria-label="رساس على إنستغرام"><img src="' + esc(sized(m, 480)) + '" alt="" loading="lazy"></a></li>'; }).join("") + "</ul></section>");

    /* Order: banner, categories, product tabs, then the dashboard's other sections in their own order, then the store's reviews.
       The optional extras (RESAS.extras) go in the places the first design gave them. */
    var after = anchor;
    function put(node) { if (!node) return; after.parentNode.insertBefore(node, after.nextSibling); after = node; }
    anchor.parentNode.insertBefore(hero, anchor);
    /* The "about" panel made with Zid's generator sits right after the categories, as in the design. */
    var aboutSec = $$(".aigc-section", root).filter(function (s) { return /عن رساس/.test(s.textContent); })[0];
    /* Tile photos come from the products: the first product of the category (or the product) each card links to. The card's own image stays only as the placeholder until then. */
    if (tiles) $$("a.rs-tile", tiles).forEach(function (a) {
      var im = $("img", a), u = a.getAttribute("href");
      if (!im || !u || u === "/") return;
      firstPhoto(u).then(function (src) { if (src) { im.removeAttribute("srcset"); im.src = sized(src.trim(), 700); } });
    });
    put(arches); put(EX.about ? about : null); put(aboutSec || null); put(picks); put(EX.tiles ? tiles : null); put(EX.deals ? deals : null); put(banners);
    put(EX.featured ? featured : null); put(EX.duo ? duo : null); put(EX.blog ? blog : null); put(EX.instagram ? insta : null);
    var strip = !S.strip.length ? null : el('<section class="rs-strip" aria-label="صور"><ul class="rs-strip__grid">' + S.strip.slice(0, 12).map(function (p, i) {
      var inner = '<img src="' + esc(sized(p.src, 480)) + '" alt="' + esc(p.alt) + '" loading="lazy">';
      return '<li' + rise((i % 6) * 60) + '>' + (p.url ? '<a href="' + esc(p.url) + '">' + inner + "</a>" : inner) + "</li>";
    }).join("") + "</ul></section>");
    var rv = $(".testimonials-slider", root), reviews = rv && rv.closest("[section-id]");
    if (reviews) {
      /* The store left this section's title empty in the dashboard. */
      var rt = $(".section-title", reviews);
      if (rt && !rt.textContent.trim()) rt.textContent = "آراء عملائنا";
      root.appendChild(reviews);
    }
    if (strip) root.appendChild(strip);
    /* Only now hide the sections that were used, so a failure above never leaves the page empty. */
    S.used.forEach(function (n) { n.classList.add("rs-used"); });
    root.classList.add("rs-ready");
    observe(root);
    try { thread(root); } catch (e) { console.error("Resas thread:", e); }
  }

  /* The gold thread of the design: one thin line down the page margins, behind the content, drawn as you scroll and swapping
     sides in the empty bands between the sections. Wide screens only. */
  function thread(root) {
    if (!root || $(".rs-thread", root)) return;
    var NS = "http://www.w3.org/2000/svg", svg = document.createElementNS(NS, "svg"), path = document.createElementNS(NS, "path");
    svg.setAttribute("class", "rs-thread"); svg.setAttribute("aria-hidden", "true"); svg.appendChild(path);
    root.insertBefore(svg, root.firstChild);
    var len = 0, startY = 0, endY = 1;
    function blocks() {
      return Array.prototype.filter.call(root.children, function (e) { return !e.classList.contains("rs-thread") && !e.classList.contains("rs-used") && e.offsetHeight > 0 && getComputedStyle(e).display !== "none"; });
    }
    function draw() {
      if (!len) return;
      var top = root.getBoundingClientRect().top + window.pageYOffset;
      var p = reduce ? 1 : Math.min(1, Math.max(0, (window.pageYOffset + window.innerHeight * 0.75 - (top + startY)) / (endY - startY)));
      path.style.strokeDashoffset = len * (1 - p);
    }
    function build() {
      var W = root.clientWidth, H = root.scrollHeight;
      if (W < 1100) { svg.style.display = "none"; len = 0; return; }
      var secs = blocks();
      if (secs.length < 3) { svg.style.display = "none"; len = 0; return; }
      svg.style.display = "";
      var xR = W - 22, xL = 22, side = 1, y0 = secs[1].offsetTop + 90, d = "M" + xR + " " + y0;
      for (var i = 1; i < secs.length - 1; i++) {
        var prev = secs[i], next = secs[i + 1], gapTop = prev.offsetTop + prev.offsetHeight, gapEnd = next.offsetTop + (parseFloat(getComputedStyle(next).paddingTop) || 0), gap = gapEnd - gapTop;
        if (gap < 60) continue;
        var mid = gapTop + gap / 2, half = Math.min(100, gap / 2 - 10), a = mid - half, c = mid + half, x1 = side ? xR : xL, x2 = side ? xL : xR;
        d += " L" + x1 + " " + a + " C" + x1 + " " + (a + half) + " " + x2 + " " + (c - half) + " " + x2 + " " + c;
        side = !side;
      }
      var endPY = H - 28;
      d += " L" + (side ? xR : xL) + " " + endPY;
      svg.style.width = W + "px"; svg.style.height = H + "px"; svg.setAttribute("viewBox", "0 0 " + W + " " + H);
      path.setAttribute("d", d); len = path.getTotalLength(); startY = y0; endY = endPY;
      path.style.strokeDasharray = len; draw();
    }
    window.addEventListener("scroll", draw, { passive: true });
    window.addEventListener("resize", build);
    window.addEventListener("load", build);
    if ("ResizeObserver" in window) new ResizeObserver(build).observe(root);
    build();
  }

  /* Soft starts the reviews slider only on some loads (a known timing bug); start it here when it did not run. Phones keep Soft's stacked cards. */
  function reviewsSlider() {
    var jq = window.jQuery;
    var slider = $(".home .testimonials-slider");
    if (!jq || !jq.fn || !jq.fn.slick || !slider || slider.classList.contains("slick-initialized") || (window.innerWidth || 0) < 768) return;
    var rtl = window.appDirection !== "ltr";
    var nextCls = rtl ? "icon-keyboard_arrow_left" : "icon-keyboard_arrow_right", prevCls = rtl ? "icon-keyboard_arrow_right" : "icon-keyboard_arrow_left";
    jq(slider).slick({
      slidesToShow: 3, slidesToScroll: 3, infinite: false, autoplay: false, arrows: true, dots: false, rtl: rtl,
      nextArrow: '<button class="slick-next slick-arrow" aria-label="التالي" type="button"><span class="' + nextCls + '"></span></button>',
      prevArrow: '<button class="slick-prev slick-arrow" aria-label="السابق" type="button"><span class="' + prevCls + '"></span></button>',
      responsive: [{ breakpoint: 992, settings: { slidesToShow: 2, slidesToScroll: 2 } }]
    });
  }

  /* Category pages on phones: two subcategories per row (kept from the previous custom JS). */
  function catCols() {
    var narrow = (window.innerWidth || document.documentElement.clientWidth) < 768;
    $$(".cat-col").forEach(function (c) { c.classList.toggle("col-6", narrow); });
  }

  function init() {
    if (!reduce) document.documentElement.classList.add("rs-anim");
    try { announcement(); } catch (e) { console.error("Resas announcement:", e); }
    try { header(); } catch (e) { console.error("Resas header:", e); }
    try { navCurrent(); } catch (e) { console.error("Resas nav:", e); }
    try { allCategoriesLabel(); } catch (e) { console.error("Resas label:", e); }
    try { home(); } catch (e) { console.error("Resas home:", e); }
    try { reviewsSlider(); } catch (e) { console.error("Resas reviews:", e); }
    try { catCols(); window.addEventListener("resize", catCols); } catch (e) { console.error("Resas categories:", e); }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
