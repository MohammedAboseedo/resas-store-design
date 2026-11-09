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
    /* The bottom tab bar on phones, and the sticky add-to-cart bar on product pages. */
    phoneBars: true,
    /* The round "back to top" button (appears after scrolling down). */
    backToTop: true,
    /* Free-shipping meter: it follows the free-shipping rule set in Zid; this is only a fallback amount (SAR, 0 = off). */
    freeShippingFrom: 0,
    /* Product page: a short trust strip under the add-to-cart button, and a "only N left" note when the stock is 5 or less (read from the
       quantity list). Add a line to `extra` (for example "شحن مجاني للطلبات فوق 200 ريال") only once it is true. false turns the strip off. */
    trust: {
      extra: [],
      /* A line for one product page only, hidden after its date. Free shipping in Zid is an automatic offer on one product, minimum 149 (31 Oct to 30 Nov 2026). */
      byProduct: [{ match: "ارينا-1", text: "شحن مجاني على هذا العرض", until: "2026-11-30" }],
      items: ["أصلي 100% من رساس", "تقسيط بدون فوائد مع تمارا وتابي", "توصيل لجميع مناطق المملكة خلال 1 إلى 5 أيام عمل"],
      links: [["الشحن والدفع", "/shipping-and-payment"], ["الاستبدال والاسترجاع", "/pages/refund-exchange-policy"]]
    },
    tabLimit: 10,
    /* How many product sections become tabs under "اختيارات رساس"; the rest are rows lower on the page. */
    tabCount: 4,
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
    if (cart && cartLink && cartLink.parentNode !== cart) { cart.appendChild(cartLink.parentNode); cartLink.parentNode.classList.add("rs-hcart"); }
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
  /* A product card copied into a tab or rail: its photos load only when they come near the screen (the ones in hidden tabs, never until the
     tab opens), and the thumbnail Zid sends for sliders (235px) is swapped for a 480px one. loading is set first, so the swap itself is lazy. */
  function lazyCard(card) {
    $$("img", card).forEach(function (im) {
      if (/spinner/.test(im.getAttribute("src") || "")) return;
      im.loading = "lazy"; im.decoding = "async";
      if (/^product-card-img/.test(im.id)) im.src = sized(im.getAttribute("src"), 480);
    });
  }
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
    var S = { hero: null, heroes: [], cats: [], sections: [], cards: [], used: [], banners: [], tiles: [], strip: [] };
    var ss = $$("section.ss", root);
    S.heroes = [];
    if (ss[0]) {
      live($$("img", ss[0])).forEach(function (hi) {
        var ha = hi.closest("a"), src = (hi.getAttribute("src") || hi.getAttribute("data-src") || "").trim() || (hi.currentSrc || "") || (hi.getAttribute("srcset") || hi.getAttribute("data-srcset") || "").split(",").pop().trim().split(" ")[0];
        if (src && !S.heroes.some(function (h) { return h.src === src; })) S.heroes.push({ src: src, url: ha ? ha.getAttribute("href") : "", alt: hi.getAttribute("alt") || "" });
      });
      S.hero = S.heroes[0] || null;
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

    function buildHero(list) {
      var hero;
    if (list.length > 1) {
      hero = el('<section class="rs-hero rs-hero--multi" aria-label="العرض الرئيسي" aria-roledescription="carousel"><div class="rs-hero__track">' + list.slice(0, 8).map(function (h, i) {
        var im = '<img class="rs-hero__img" src="' + esc(h.src) + '" alt="' + esc(h.alt || "العرض " + (i + 1)) + '"' + (i ? ' loading="lazy"' : ' fetchpriority="high"') + ">";
        return '<div class="rs-hero__slide" role="group" aria-roledescription="slide" aria-label="' + (i + 1) + " / " + Math.min(8, list.length) + '">' + (h.url ? '<a href="' + esc(h.url) + '">' + im + "</a>" : im) + "</div>";
      }).join("") + '</div><div class="rs-hero__dots">' + list.slice(0, 8).map(function (h, i) { return '<button type="button" aria-label="العرض ' + (i + 1) + '"' + (i ? "" : ' aria-current="true"') + "></button>"; }).join("") + "</div></section>");
      (function (sec) {
        var track = $(".rs-hero__track", sec), dots = $$(".rs-hero__dots button", sec), n = dots.length, cur = 0, timer = null;
        function width() { return track.clientWidth || 1; }
        function show(i) { cur = (i + n) % n; track.scrollTo({ left: (window.appDirection === "ltr" ? 1 : -1) * cur * width(), behavior: "smooth" }); }
        function mark() { var i = Math.round(Math.abs(track.scrollLeft) / width()); dots.forEach(function (d, k) { if (k === i) d.setAttribute("aria-current", "true"); else d.removeAttribute("aria-current"); }); cur = i; }
        dots.forEach(function (d, i) { d.addEventListener("click", function () { show(i); }); });
        track.addEventListener("scroll", mark, { passive: true });
        function play() { if (reduce || timer) return; timer = setInterval(function () { show(cur + 1); }, 5500); }
        function stop() { clearInterval(timer); timer = null; }
        sec.addEventListener("mouseenter", stop); sec.addEventListener("mouseleave", play); sec.addEventListener("focusin", stop); sec.addEventListener("focusout", play); sec.addEventListener("touchstart", stop, { passive: true });
        sec.__stop = stop;
        play();
      })(hero);
    } else if (list[0]) {
      var himg = '<img class="rs-hero__img" src="' + esc(list[0].src) + '" alt="' + esc(list[0].alt || "العرض الرئيسي") + '" fetchpriority="high">';
      hero = el('<section class="rs-hero" aria-label="العرض الرئيسي">' + (list[0].url ? '<a href="' + esc(list[0].url) + '">' + himg + "</a>" : himg) + "</section>");
    } else {
      hero = el('<section class="rs-hero" aria-label="العرض الرئيسي"><img class="rs-hero__img" src="' + esc(RESAS.bannerFallback) + '" width="1280" height="494" alt="" fetchpriority="high"></section>');
    }
    $$("img", hero).forEach(function (im) { var f = function () { if (im.naturalWidth && Math.abs(im.naturalWidth / im.naturalHeight - 2.59) < 0.12) im.setAttribute("data-crop", ""); }; if (im.complete) f(); else im.addEventListener("load", f); });
      return hero;
    }
    var hero = buildHero(S.heroes);
    /* One slider, two shapes: upload portrait banners (taller than wide) and landscape banners in the same dashboard slider; phones show the
       portrait ones, bigger screens the landscape ones. With only one kind, every slide shows everywhere as before. */
    if (S.heroes.length > 1) {
      var shown = S.heroes, mq = window.matchMedia ? window.matchMedia("(max-width: 767px)") : null;
      hero.style.visibility = "hidden"; /* until the slides are measured, so the wrong banner never flashes */
      var phoneNow = function () { return mq ? mq.matches : window.innerWidth < 768; };
      var refreshHero = function () {
        var ps = S.heroes.filter(function (h) { return h.ar && h.ar < 1.15; }), ls = S.heroes.filter(function (h) { return h.ar && h.ar >= 1.15; });
        if (!ps.length || !ls.length) return;
        var want = phoneNow() ? ps : ls;
        if (want.length === shown.length && want.every(function (h, i) { return h === shown[i]; })) return;
        var next = buildHero(want);
        if (hero.__stop) hero.__stop();
        if (hero.parentNode) hero.parentNode.replaceChild(next, hero);
        hero = next; shown = want;
      };
      Promise.all(S.heroes.map(function (h) {
        return new Promise(function (res) { var im = new Image(); im.onload = function () { h.ar = im.naturalWidth / (im.naturalHeight || 1); res(); }; im.onerror = res; im.src = h.src; setTimeout(res, 2500); });
      })).then(function () { refreshHero(); hero.style.visibility = ""; if (mq && mq.addListener) mq.addListener(refreshHero); });
    }

    var CHEV = function (d) { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + d + '"/></svg>'; };
    var arches = S.cats.length ? el('<section class="rs-sec" aria-labelledby="rs-cat-title"><div class="rs-wrap"><div class="rs-sec__head"><h2 class="rs-title rs-sec__title" id="rs-cat-title"' + rise(0) + '>تسوّق حسب القسم</h2>' +
      '<a class="rs-link" href="/categories"' + rise(80) + '>عرض كل الأقسام</a></div><div class="rs-rail"' + rise(60) + '><ul class="rs-arches">' +
      S.cats.slice(0, 16).map(function (a, i) {
        return '<li><a class="rs-arch-link" href="' + esc(a.url) + '"><span class="rs-arch-link__frame"><img src="' + esc(sized(a.image, 420)) + '" alt="" loading="lazy"></span><span class="rs-arch-link__name">' + esc(a.name) + "</span></a></li>";
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
    var about = !EX.about ? null : el('<section class="rs-sec" aria-labelledby="rs-about-title"><div class="rs-wrap"><div class="rs-about__panel"><div class="rs-about__body"><span class="rs-about__kicker"' + rise(0) + '>عن رساس</span>' +
      '<h2 class="rs-title rs-about__title" id="rs-about-title"' + rise(60) + ">" + esc(A.title) + "</h2><p class=\"rs-about__text\"" + rise(120) + ">" + esc(A.text) + "</p>" +
      '<div class="rs-about__cta"' + rise(180) + '><a class="rs-btn" href="' + esc((S.cats[1] || S.cats[0] || { url: "/categories" }).url) + '">' + esc(A.cta) + "</a></div></div>" +
      '<div class="rs-about__media"' + rise(120) + '><img src="' + esc(sized(aimg, 900)) + '" alt=""></div></div></div></section>');

    /* Tabs: one per product section of the home page, in the dashboard order. */
    /* Product tabs, in two groups of the same design: the first RESAS.tabCount sections, then the rest right below. */
    var tabSecs = S.sections.slice(0, RESAS.tabCount || 4), restSecs = S.sections.slice(RESAS.tabCount || 4);
    function makePicks(secs, heading, pfx) {
      var tabs = secs.map(function (sec) {
        var cat = catFor(S, sec.title);
        return { label: sec.title, url: cat ? cat.url : "", cards: sec.cards.slice(0, RESAS.tabLimit).map(function (c) { return c.node; }) };
      });
      var picks = el('<section class="rs-sec" aria-labelledby="rs-pop-title' + pfx + '"><div class="rs-wrap"><div class="rs-sec__head"><h2 class="rs-title rs-sec__title" id="rs-pop-title' + pfx + '"' + rise(0) + '>' + esc(heading) + '</h2>' +
        '<div class="rs-tabs" role="tablist" aria-label="' + esc(heading) + '"' + rise(80) + '></div></div><div class="rs-panels"></div></div></section>');
      var bar = $(".rs-tabs", picks), panels = $(".rs-panels", picks);
      tabs.forEach(function (t, i) {
        var tid = "rs-tab-" + pfx + i, pid = "rs-panel-" + pfx + i;
        bar.appendChild(el('<button type="button" role="tab" id="' + tid + '" aria-controls="' + pid + '" aria-selected="' + (i ? "false" : "true") + '"' + (i ? ' tabindex="-1"' : "") + ">" + esc(t.label) + "</button>"));
        var panel = el('<div role="tabpanel" id="' + pid + '" aria-labelledby="' + tid + '"' + (i ? " hidden" : "") + '><div class="rs-grid rs-grid--five"></div></div>');
        var grid = $(".rs-grid", panel);
        t.cards.forEach(function (c, k) {
          var li = document.createElement("div");
          li.setAttribute("data-rise", ""); li.style.setProperty("--d", (k % 5) * 70 + "ms");
          var card = c.cloneNode(true);
          lazyCard(card);
          li.appendChild(card); grid.appendChild(li);
        });
        if (t.url) panel.appendChild(el('<p class="rs-more"><a class="rs-btn rs-btn--tone" href="' + esc(t.url) + '">عرض الكل</a></p>'));
        panels.appendChild(panel);
      });
      var btns = $$("[role=tab]", bar), panelEls = $$("[role=tabpanel]", panels);
      var select = function (i, focus) {
        btns.forEach(function (b, j) { b.setAttribute("aria-selected", j === i ? "true" : "false"); b.tabIndex = j === i ? 0 : -1; panelEls[j].hidden = j !== i; });
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
      return picks;
    }
    var picks = makePicks(tabSecs, "اختيارات رساس", "");
    var picks2 = restSecs.length ? makePicks(restSecs, "المزيد من رساس", "b") : null;

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
    var picked = EX.featured ? top.slice(0, RESAS.featuredCount) : [];
    var featured = !EX.featured ? null : el('<section class="rs-sec" aria-labelledby="rs-mini-title"><div class="rs-wrap"><div class="rs-sec__head"><h2 class="rs-title rs-sec__title" id="rs-mini-title"' + rise(0) + '>منتجات مختارة</h2></div><div class="rs-mini">' +
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
    var brazier = S.cards.filter(function (c) { return /مبخر/.test(c.name); })[0] || top[0] || S.cards[0];
    var duoItems = [];
    if (gifts) duoItems.push({ kicker: "للمناسبات", title: gifts.name, text: "اختر الأنسب لمن تحب.", cta: "تسوّق " + gifts.name, url: gifts.url, image: brazier.image });
    duoItems.push({ kicker: "محتار في اختيار عطرك؟", title: "نساعدك تختار عطرك المناسب", text: "فريق رساس يرد عليك على واتساب، لك أو لهديتك.", cta: "تحدّث معنا على واتساب", url: "https://wa.me/" + RESAS.whatsapp, image: (top[1] || top[0] || S.cards[0]).image });
    var duo = !EX.duo ? null : el('<section class="rs-sec" aria-label="هدايا ومساعدة"><div class="rs-wrap"><div class="rs-duo">' + duoItems.map(function (d, i) {
      var ext = /^https?:/.test(d.url);
      return '<a class="rs-duo__item"' + rise(i * 90) + ' href="' + esc(d.url) + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + '><span class="rs-duo__body"><span class="rs-duo__kicker">' + esc(d.kicker) + '</span><span class="rs-title rs-duo__title">' + esc(d.title) + '</span><span class="rs-duo__text">' + esc(d.text) + '</span><span class="rs-link">' + esc(d.cta) + '</span></span><span class="rs-duo__img"><img src="' + esc(sized(d.image, 720)) + '" alt="" loading="lazy"></span></a>';
    }).join("") + "</div></div></section>");

    /* Blog: the newest posts of the store blog, read from the blog itself. */
    var blog = !EX.blog ? null : el('<section class="rs-sec" aria-labelledby="rs-blog-title" hidden><div class="rs-wrap"><div class="rs-sec__head"><h2 class="rs-title rs-sec__title" id="rs-blog-title">من مدونة رساس</h2></div><div class="rs-posts"></div><div class="rs-posts__more"><a class="rs-link" href="/blogs/المدونة">كل المقالات</a></div></div></section>');
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
    var insta = !EX.instagram ? null : el('<section class="rs-insta" aria-labelledby="rs-insta-title"><div class="rs-wrap rs-insta__head"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".6"/></svg>' +
      '<h2 class="rs-title rs-sec__title" id="rs-insta-title"' + rise(0) + '>تابعنا على إنستغرام</h2><a class="rs-insta__handle" href="https://www.instagram.com/' + RESAS.instagram + '" target="_blank" rel="noopener">@' + RESAS.instagram + '</a></div><ul class="rs-insta__grid">' +
      igPics.map(function (m) { return '<li><a href="https://www.instagram.com/' + RESAS.instagram + '" target="_blank" rel="noopener" aria-label="رساس على إنستغرام"><img src="' + esc(sized(m, 480)) + '" alt="" loading="lazy"></a></li>'; }).join("") + "</ul></section>");

    /* A second product row right under the tabs: the best rated products of the page (the stars come from the store's reviews). */
    var topRail = null, topList = top.filter(function (c) { return c.rating > 0; }).slice(0, 8);
    if (topList.length >= 4) {
      topRail = el('<section class="rs-sec" aria-labelledby="rs-top-title"><div class="rs-wrap"><div class="rs-sec__head"><h2 class="rs-title rs-sec__title" id="rs-top-title"' + rise(0) + '>الأعلى تقييماً</h2><a class="rs-link" href="/products"' + rise(80) + '>عرض كل المنتجات</a></div><div class="rs-more__rail"></div></div></section>');
      var trail = $(".rs-more__rail", topRail);
      topList.forEach(function (c) {
        var slot = document.createElement("div"); slot.className = "rs-more__slot";
        var card = c.node.cloneNode(true);
        lazyCard(card);
        slot.appendChild(card); trail.appendChild(slot);
      });
    }

    /* Order: banner, categories, product tabs, best rated, sale band, tiles, banners, "about", then the dashboard's other sections in their own order, then the store's reviews.
       The optional extras (RESAS.extras) go in the places the first design gave them. */
    var after = anchor;
    function put(node) { if (!node) return; after.parentNode.insertBefore(node, after.nextSibling); after = node; }
    anchor.parentNode.insertBefore(hero, anchor);
    /* The "about" panel made with Zid's generator now comes after the product rows and banners. */
    var aboutSec = $$(".aigc-section", root).filter(function (s) { return /عن رساس/.test(s.textContent); })[0];
    /* Tile photos come from the products: the first product of the category (or the product) each card links to. The card's own image stays only as the placeholder until then. */
    if (tiles) $$("a.rs-tile", tiles).forEach(function (a) {
      var im = $("img", a), u = a.getAttribute("href");
      if (!im || !u || u === "/") return;
      firstPhoto(u).then(function (src) { if (src) { im.removeAttribute("srcset"); im.src = sized(src.trim(), 700); } });
    });
    put(arches); put(EX.about ? about : null); put(picks); put(picks2); put(topRail); put(EX.deals ? deals : null); put(EX.tiles ? tiles : null); put(banners); put(aboutSec || null);
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

  /* ---------- phone bars ----------
     A floating tab bar at the bottom of every page on phones (home, categories, account, favourites, cart) and, on a product page, a sticky
     add-to-cart bar above it that appears while the real button is off screen. The sticky bar only forwards to Soft's own button, so options,
     stock checks and the cart count behave exactly as before. Set RESAS.phoneBars to false to turn both off. */
  var TAB_ICONS = {
    home: '<path d="M4 11.2 12 4l8 7.2V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z"/>',
    cats: '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5c.7-3.6 3.6-5.5 7.5-5.5s6.8 1.9 7.5 5.5z"/>',
    heart: '<path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z"/>',
    cart: '<path d="M6 8h12l1 12.5H5z"/><path d="M9 8V7a3 3 0 0 1 6 0v1"/>'
  };
  function phoneBars() {
    if (RESAS.phoneBars === false || $(".rs-tabbar")) return;
    var path = location.pathname, dec = path; try { dec = decodeURIComponent(path); } catch (e) {}
    if (/^\/(checkout|payment)/.test(dec)) return;
    var tabs = [
      { k: "home", href: "/", label: "الرئيسية", on: dec === "/" },
      { k: "cats", href: "/categories", label: "التصنيفات", on: /^\/categories/.test(dec) },
      { k: "user", href: "/account-profile", label: "حسابي", on: /^\/account/.test(dec) && !/wishlist/.test(dec) },
      { k: "heart", href: "/account-wishlist", label: "المفضلة", on: /wishlist/.test(dec) },
      { k: "cart", href: "/cart", label: "السلة", on: dec === "/cart" }
    ];
    var bar = el('<nav class="rs-tabbar" aria-label="التنقل السريع">' + tabs.map(function (t) {
      return '<a class="rs-tab rs-tab--' + t.k + '" href="' + t.href + '" aria-label="' + t.label + '"' + (t.on ? ' aria-current="page"' : "") + '><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + TAB_ICONS[t.k] + "</svg>" + (t.k === "cart" ? '<span class="rs-tab__count" hidden></span>' : "") + "</a>";
    }).join("") + "</nav>");
    document.body.appendChild(bar);
    document.body.classList.add("rs-has-tabbar");
    /* "Categories" opens the side menu (the same one the header's menu button opens) instead of leaving the page. */
    $(".rs-tab--cats", bar).addEventListener("click", function (e) {
      var m = $(".icon-menu-top");
      if (m) { e.preventDefault(); m.click(); }
    });

    /* The cart count: total pieces in the cart (Zid's header badge counts lines, so 8 of one product showed 1). The badge value is shown
       first, then replaced by the cart's real total. */
    var count = $(".rs-tab__count", bar), badge = $(".cart-badge"), timer = 0;
    function paint(n) { count.textContent = n > 99 ? "99+" : String(n); count.hidden = n < 1; }
    function pieces() {
      return fetch("/api/v1/cart", { credentials: "same-origin" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (c) {
        return c && c.products ? c.products.reduce(function (n, p) { return n + (parseInt(p.quantity, 10) || 0); }, 0) : null;
      }).catch(function () { return null; });
    }
    function syncCount() {
      badge = $(".cart-badge") || badge;
      paint(badge ? parseInt(badge.textContent.replace(/\D/g, ""), 10) || 0 : 0);
      clearTimeout(timer);
      timer = setTimeout(function () { pieces().then(function (n) { if (n !== null) paint(n); }); }, 250);
    }
    syncCount();
    if (badge && "MutationObserver" in window) new MutationObserver(syncCount).observe(badge, { childList: true, characterData: true, subtree: true });

    /* The WhatsApp button sits where the bars are: lift it above them while the phone layout is on. */
    var mq = window.matchMedia ? window.matchMedia("(max-width: 767px)") : null, tries = 0;
    function lift() {
      var w = $("[id^='gb-widget']");
      if (!w) return tries++ < 40 ? setTimeout(lift, 500) : null;
      var phone = !mq || mq.matches, buy = document.body.classList.contains("rs-has-buy");
      if (phone) w.style.setProperty("bottom", (buy ? 176 : 96) + "px", "important"); else w.style.setProperty("bottom", "14px", "important");
      /* On phones keep just the round button: the "message us" label covered the text. */
      function hideLabel() { $$("a", w).forEach(function (l) { if (l.textContent.trim().length < 12 && /راسلنا/.test(l.textContent)) l.style.display = (!mq || mq.matches) ? "none" : ""; }); }
      hideLabel();
      /* The widget draws its inside a moment after its box exists, so keep watching. */
      if (!w.__rs && "MutationObserver" in window) { w.__rs = 1; new MutationObserver(hideLabel).observe(w, { childList: true, subtree: true }); }
    }
    lift();
    if (mq && mq.addListener) mq.addListener(lift);
    document.addEventListener("rs-buy-change", lift);
    document.addEventListener("rs-cart-change", function () { setTimeout(syncCount, 400); });

    try { stickyCart(); } catch (e) { console.error("Resas sticky cart:", e); }
  }

  function stickyCart() {
    var btn = $(".col-product-info .btn-add-to-cart") || $(".product-buttons .btn-add-to-cart");
    if (!btn || btn.disabled) return;
    var sel = $("#product-quantity"), max = sel ? sel.options.length : 1, qty = 1;
    var label = btn.textContent.replace(/\s+/g, " ").trim() || "أضف إلى السلة";
    if (label === "أضف إلى السلة") label = "أضف للسلة";
    /* The price (and this product's offer line) on top of the bar, so it is on the first screen; it follows Soft's price if an option changes it. */
    var pEl = $(".col-product-info .product-formatted-price"), oEl = $(".col-product-info .product-formatted-price-old"), note = pageNotes()[0] || "";
    function priceRow() {
      var p = pEl ? num(txt(pEl)) : 0, o = oEl ? num(txt(oEl)) : 0;
      return p > 0 ? "<strong>" + esc(money(p)) + "</strong>" + (o > p ? "<del>" + esc(money(o)) + "</del>" : "") + (note ? "<span>" + esc(note) + "</span>" : "") : "";
    }
    var buy = el('<div class="rs-buy" role="group" aria-label="إضافة إلى السلة">' + (pEl ? '<div class="rs-buy__price">' + priceRow() + "</div>" : "") + (sel ? '<div class="rs-buy__qty" dir="ltr"><button type="button" data-d="-1" aria-label="إنقاص الكمية">&minus;</button><output aria-live="polite">1</output><button type="button" data-d="1" aria-label="زيادة الكمية">+</button></div>' : "") + '<button type="button" class="rs-buy__btn">' + esc(label) + '</button><button type="button" class="rs-buy__now">اشترِ الآن</button></div>');
    document.body.appendChild(buy);
    var pRow = $(".rs-buy__price", buy);
    if (pRow && "MutationObserver" in window) new MutationObserver(function () { pRow.innerHTML = priceRow(); }).observe(pEl, { childList: true, characterData: true, subtree: true });
    var out = $("output", buy);
    function show() { if (out) out.textContent = String(qty); }
    function setQty(n) {
      qty = Math.max(1, Math.min(max, n)); show();
      if (sel) { sel.value = String(qty); sel.dispatchEvent(new Event("change", { bubbles: true })); }
    }
    if (sel) {
      sel.addEventListener("change", function () { var n = parseInt(sel.value, 10); if (n && n !== qty) { qty = n; show(); } });
      buy.addEventListener("click", function (e) { var b = e.target.closest("[data-d]"); if (b) setQty(qty + parseInt(b.getAttribute("data-d"), 10)); });
    }
    /* Zid's own button adds to the cart silently on phones, so the bar confirms it: it reads the cart before and after
       and shows "added" (or an error) on the button for a moment. */
    var go = $(".rs-buy__btn", buy), now = $(".rs-buy__now", buy), busy = false, thenBuy = false;
    /* "Buy now": add, then go straight to the checkout button's address (taken from the cart page) or to the cart. */
    function goCheckout() {
      go.textContent = "جارٍ التحويل…";
      fetch("/cart", { credentials: "same-origin" }).then(function (r) { return r.text(); }).then(function (h) {
        var d = new DOMParser().parseFromString(h, "text/html"), a = $$("a", d).filter(function (x) { return /إتمام الطلب/.test(x.textContent) && x.getAttribute("href"); })[0];
        location.href = a ? a.getAttribute("href") : "/cart";
      }).catch(function () { location.href = "/cart"; });
    }
    function units() {
      return fetch("/api/v1/cart", { credentials: "same-origin" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (c) {
        return c && c.products ? c.products.reduce(function (n, p) { return n + (parseInt(p.quantity, 10) || 0); }, 0) : null;
      }).catch(function () { return null; });
    }
    function done(ok, n) {
      if (ok && thenBuy) { document.dispatchEvent(new Event("rs-cart-change")); return goCheckout(); }
      go.textContent = ok ? "تمت الإضافة ✓" + (n ? " (" + n + ")" : "") : "تعذّرت الإضافة، تحقق من خيارات المنتج";
      go.classList.toggle("rs-buy__btn--ok", ok); go.classList.toggle("rs-buy__btn--err", !ok);
      document.dispatchEvent(new Event("rs-cart-change"));
      setTimeout(function () { go.textContent = label; go.classList.remove("rs-buy__btn--ok", "rs-buy__btn--err"); go.disabled = now.disabled = false; busy = false; }, ok ? 1800 : 3000);
    }
    function run(buyNow) {
      if (busy) return;
      busy = true; thenBuy = buyNow; go.disabled = now.disabled = true;
      if (sel && String(qty) !== sel.value) setQty(qty);
      var added = qty;
      units().then(function (before) {
        btn.click();
        go.textContent = "جارٍ الإضافة…";
        var tries = 0;
        (function check() {
          setTimeout(function () {
            units().then(function (now) {
              tries++;
              if (before === null || now === null) return tries >= 2 ? done(true, added) : check();
              if (now > before) return done(true, added);
              if (tries >= 7) return done(false);
              check();
            });
          }, 500);
        })();
      });
    }
    go.addEventListener("click", function () { run(false); });
    now.addEventListener("click", function () { run(true); });
    /* Always on screen on a product page (the real button is further down the page). */
    buy.classList.add("rs-buy--on");
    document.body.classList.add("rs-has-buy");
    document.dispatchEvent(new Event("rs-buy-change"));
  }

  /* ---------- product page: trust strip ----------
     Sits right under Soft's add-to-cart button, where the buying decision is made. Only facts the store already states elsewhere
     (the shipping page, the tabby/tamara widgets); nothing about free shipping or delivery days until RESAS.trust.extra says so. */
  var TRUST_ICON = {
    shield: '<path d="M12 3 5 6v5.5c0 4.3 2.9 7.6 7 9.5 4.1-1.9 7-5.2 7-9.5V6z"/><path d="m9 12 2 2 4-4"/>',
    card: '<rect x="3" y="6" width="18" height="12" rx="2.5"/><path d="M3 10.5h18M7 15h3"/>',
    truck: '<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    tag: '<path d="m4 12.5 8-8h7v7l-8 8z"/><circle cx="15.5" cy="8.5" r="1"/>'
  };
  /* The lines of RESAS.trust.byProduct that belong to this product page and have not passed their date. */
  function pageNotes() {
    var cfg = RESAS.trust || {}, here = location.pathname; try { here = decodeURIComponent(here); } catch (e) {}
    return (cfg.byProduct || []).filter(function (b) { return here.indexOf(b.match) > -1 && (!b.until || Date.now() <= Date.parse(b.until + "T23:59:59+03:00")); }).map(function (b) { return b.text; });
  }

  /* ---------- product page: the price first ----------
     Soft puts the short description between the name and the price, so on a phone the price sat under the first screen. The price row
     moves right under the name and the rating (the same element, nothing copied), with this product's own offer line under it. */
  function priceFirst() {
    var sec = $(".col-product-info > section"), price = sec && $(".product-formatted-price", sec);
    if (!price || sec.getAttribute("data-rs-price") === "1") return;
    var row = price.closest(".d-flex"), after = $(".product-features", sec) || $("h1", sec);
    if (!row || row.parentNode !== sec || !after || after.parentNode !== sec) return;
    sec.setAttribute("data-rs-price", "1");
    after.insertAdjacentElement("afterend", row);
    var notes = pageNotes();
    if (notes.length) row.insertAdjacentElement("afterend", el('<p class="rs-pnote">' + esc(notes[0]) + "</p>"));
  }

  function productTrust() {
    var cfg = RESAS.trust;
    if (cfg === false || $(".rs-trust")) return;
    var anchor = $(".col-product-info .product-buttons");
    if (!anchor || !$(".col-product-info .btn-add-to-cart")) return;
    cfg = cfg || {};
    var own = pageNotes();
    var lines = own.concat(cfg.extra || []).map(function (t) { return ["tag", t]; }).concat((cfg.items || []).map(function (t, i) { return [["shield", "card", "truck"][i % 3], t]; }));
    var left = 0, sel = $("#product-quantity"), out = $(".section-out-of-stock-notify-me");
    if (sel && (!out || out.classList.contains("d-none")) && sel.options.length > 0 && sel.options.length <= 5) left = sel.options.length;
    var html = '<div class="rs-trust">' + (left ? '<p class="rs-trust__low">' + (left === 1 ? "بقيت قطعة واحدة فقط" : "متبقي " + left + " قطع فقط") + "</p>" : "") +
      "<ul>" + lines.map(function (l) { return '<li><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + TRUST_ICON[l[0]] + "</svg><span>" + esc(l[1]) + "</span></li>"; }).join("") + "</ul>" +
      ((cfg.links || []).length ? '<p class="rs-trust__links">' + cfg.links.map(function (k) { return '<a href="' + esc(k[1]) + '">' + esc(k[0]) + "</a>"; }).join("") + "</p>" : "") + "</div>";
    anchor.insertAdjacentElement("afterend", el(html));
  }

  /* ---------- category pages: products first ----------
     Soft prints the whole SEO paragraph under the title, which pushes the products below the first phone screen. The paragraph moves
     under the product list (same text, still on the page); the title stays on top. */
  function categoryTop() {
    var p = $(".subTitle-detail .bread-text"), list = $(".products-container");
    if (!p || !list || $(".rs-cat-seo") || p.textContent.trim().length < 40) return;
    var host = list.closest(".container") || list;
    var box = el('<section class="rs-cat-seo"><div class="container"></div></section>');
    $(".container", box).appendChild(p);
    host.insertAdjacentElement("afterend", box);
  }

  /* ---------- small fixes ----------
     The footer line says 2023: show the current year instead. */
  function footerYear() {
    var y = String(new Date().getFullYear());
    $$(".footer-copyrights").forEach(function (n) { if (!n.children.length && /2023/.test(n.textContent)) n.textContent = n.textContent.replace(/2023/g, y); });
  }

  /* Zid keeps a "signed in" flag cookie (zid_customer_auth=1). When the real session has expired the flag stays at 1, and the hosted
     checkout then asks for the account, gets a 401 and shows its "could not load" error. If the flag says signed in but the server says
     not, drop the flag so checkout starts as a guest. Only touches the flag, only when the server confirms the visitor is signed out. */
  function staleLogin() {
    if (!/(?:^|;\s*)zid_customer_auth=1(?:;|$)/.test(document.cookie)) return;
    fetch("/api/v1/auth/login-status", { credentials: "include" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
      if (!j || j.is_authenticated !== false) return;
      var host = location.hostname, parts = host.split("."), root = parts.length > 2 ? parts.slice(-2).join(".") : host;
      ["", "; domain=" + host, "; domain=." + host, "; domain=." + root].forEach(function (d) {
        document.cookie = "zid_customer_auth=; Max-Age=0; path=/" + d + "; secure";
      });
    }).catch(function () {});
  }

  /* Zid's own script calls $(".s-slider").slick("resize") on every window resize. Once the home page is rebuilt there is no slider under that
     name, and slick throws "Cannot read properties of undefined (reading 'resize')" into the console each time. The wrapper swallows that
     one failure and leaves everything else about slick alone. */
  function slickGuard() {
    var jq = window.jQuery;
    if (!jq || !jq.fn || typeof jq.fn.slick !== "function" || jq.fn.slick.rsGuard) return;
    var orig = jq.fn.slick;
    var safe = function () { try { return orig.apply(this, arguments); } catch (e) { return this; } };
    safe.rsGuard = true;
    jq.fn.slick = safe;
  }

  /* Pictures with no alt attribute at all (about 150 on the home page, 40 on a category): a product card photo gets the product's name, anything
     else gets an empty alt (marked decorative) so readers and search engines skip it instead of reading the file name. Zid draws part of the page
     late, so it runs again a few times. */
  function altFix() {
    function run() {
      $$("img:not([alt])").forEach(function (im) {
        var card = im.closest(".product-item, .rs-card, .rs-mini__item, article"), name = card ? txt($(".product-title, .rs-card__name, h3", card)) : "";
        im.setAttribute("alt", name);
      });
    }
    run();
    [1500, 4000, 9000].forEach(function (ms) { setTimeout(run, ms); });
  }

  /* Cart page: Zid's quantity is a list from 0 to 145. Show − / + buttons instead; they set the real list and fire its change event, so
     Zid updates the cart and the totals exactly as before. The list is only hidden. Re-applied when Zid redraws the cart. */
  function cartQty() {
    if (!/^\/cart/.test(location.pathname)) return;
    function enhance() {
      $$(".cart-product-quantity-dropdown").forEach(function (box) {
        var sel = $("select", box);
        if (!sel || box.getAttribute("data-rs-qty") === "1" || !sel.options.length) return;
        box.setAttribute("data-rs-qty", "1");
        var max = parseInt(sel.options[sel.options.length - 1].value, 10) || 1;
        var step = el('<div class="rs-cqty" dir="ltr"><button type="button" data-d="-1" aria-label="إنقاص الكمية">&minus;</button><output aria-live="polite"></output><button type="button" data-d="1" aria-label="زيادة الكمية">+</button></div>');
        var out = $("output", step), minus = $("[data-d='-1']", step), plus = $("[data-d='1']", step);
        function show() { var n = parseInt(sel.value, 10) || 1; out.textContent = String(n); minus.disabled = n <= 1; plus.disabled = n >= max; }
        step.addEventListener("click", function (e) {
          var b = e.target.closest("[data-d]"); if (!b || b.disabled) return;
          var n = Math.max(1, Math.min(max, (parseInt(sel.value, 10) || 1) + parseInt(b.getAttribute("data-d"), 10)));
          if (String(n) === sel.value) return;
          sel.value = String(n); sel.dispatchEvent(new Event("change", { bubbles: true })); show();
        });
        sel.addEventListener("change", show);
        show();
        sel.insertAdjacentElement("afterend", step);
      });
    }
    enhance();
    if ("MutationObserver" in window) {
      var t = null;
      new MutationObserver(function () { clearTimeout(t); t = setTimeout(enhance, 150); }).observe(document.body, { childList: true, subtree: true });
    }
  }

  /* ---------- cart page on phones: a fixed bar with the total and the checkout button, and "recommended for you" under the cart ---------- */
  function cartBar(view) {
    if ($(".rs-cartbar")) return;
    var bar = el('<div class="rs-cartbar" hidden><div class="rs-cartbar__sum"><span class="rs-cartbar__lbl">الإجمالي</span><strong class="rs-cartbar__total"></strong></div><a class="rs-cartbar__go" href="/cart">إتمام الطلب</a></div>');
    document.body.appendChild(bar);
    var go = $(".rs-cartbar__go", bar), tot = $(".rs-cartbar__total", bar), lbl = $(".rs-cartbar__lbl", bar), timer = 0;
    function paint() {
      cartData().then(function (c) {
        var any = c && c.products && c.products.length;
        bar.hidden = !any;
        document.body.classList.toggle("rs-has-cartbar", !!any);
        document.body.classList.toggle("rs-has-buy", !!any);
        document.dispatchEvent(new Event("rs-buy-change"));
        if (!any) return;
        tot.textContent = money(Number(c.total_value) || 0);
        lbl.textContent = "الإجمالي (" + cartPieces(c) + " قطعة)";
        var a = $$("a", view).filter(function (x) { return /إتمام الطلب/.test(x.textContent) && x.getAttribute("href") && x.getAttribute("href") !== "#"; })[0];
        if (a) go.setAttribute("href", a.getAttribute("href"));
      });
    }
    paint();
    document.addEventListener("rs-cart-change", function () { setTimeout(paint, 500); });
    var body = $(".cart-products-with-totals", view);
    if (body && "MutationObserver" in window) new MutationObserver(function () { clearTimeout(timer); timer = setTimeout(paint, 700); }).observe(body, { childList: true, subtree: true });
  }
  function cartRecs(view) {
    if ($(".rs-more--cart")) return;
    cartData().then(function (c) {
      if (!c || !c.products || !c.products.length) return;
      var inCart = {};
      c.products.forEach(function (p) { try { inCart[decodeURIComponent(String(p.url || "").replace(location.origin, "").split("?")[0])] = 1; } catch (e) {} });
      cardsOf("/", "").then(function (home) {
        var list = home.filter(function (x) { return !inCart[hrefKey(x)]; }).sort(function (a, b) { return ratingOf(b) - ratingOf(a); });
        var sec = moreSection("موصى به لك", list, "rs-more--cart");
        if (sec && !$(".rs-more--cart")) view.parentNode.insertBefore(sec, view.nextSibling);
      });
    });
  }

  /* ---------- free-shipping meter + "complete your order" bundle ----------
     The meter reads the store's own free-shipping rule (Zid dashboard: shipping settings); with no rule it stays hidden unless
     RESAS.freeShippingFrom is set. The bundle offers two top-rated products from other categories next to the one being viewed. */
  function cartData() {
    return fetch("/api/v1/cart", { credentials: "same-origin" }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  }
  function cartPieces(c) { return c && c.products ? c.products.reduce(function (n, p) { return n + (parseInt(p.quantity, 10) || 0); }, 0) : null; }
  function money(n) { return (Math.round(n * 100) % 100 ? n.toFixed(2) : String(Math.round(n))) + " ريال"; }
  function shipMeter(host, where) {
    if (!host) return;
    var box = $(".rs-ship", host.parentNode) || el('<div class="rs-ship" hidden></div>');
    if (!box.isConnected) { if (where === "before") host.parentNode.insertBefore(box, host); else host.parentNode.insertBefore(box, host.nextSibling); }
    function paint() {
      cartData().then(function (c) {
        if (!c) return;
        var rule = c.free_shipping_rule && c.free_shipping_rule.subtotal_condition || {}, min = Number(rule.min) || 0, total = Number(c.total_value) || 0, left, pct;
        if (min > 0 && rule.remaining != null) { left = Number(rule.remaining) || 0; pct = Math.max(0, Math.min(100, Number(rule.products_subtotal_percentage_from_min) || (min ? 100 * (1 - left / min) : 0))); }
        else { min = Number(RESAS.freeShippingFrom) || 0; if (!min) { box.hidden = true; return; } left = Math.max(0, min - total); pct = Math.min(100, 100 * total / min); }
        var empty = !(c.products && c.products.length);
        box.hidden = false;
        box.innerHTML = (left > 0 ? "<p>" + (empty ? "شحن مجاني للطلبات فوق <strong>" + money(min) + "</strong>" : "أضف <strong>" + money(left) + "</strong> إلى سلتك للحصول على شحن مجاني") + "</p>" : "<p class=\"rs-ship__ok\">✓ طلبك مؤهل للشحن المجاني</p>") + '<div class="rs-ship__bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + Math.round(empty ? 0 : pct) + '"><span style="width:' + (empty ? 0 : pct) + '%"></span></div>';
      });
    }
    paint();
    document.addEventListener("rs-cart-change", function () { setTimeout(paint, 500); });
    return paint;
  }
  function cartPage() {
    var view = $(".cart-view");
    if (!view || $(".rs-ship", view.parentNode)) return;
    /* clearer headings than Zid's table captions */
    $$(".section-title", view).forEach(function (h) { var t = h.textContent.trim(); if (t === "المنتجات") h.textContent = "سلة التسوق"; else if (t === "ملخص الإجمالي") h.textContent = "ملخص الطلب"; });
    try { cartBar(view); cartRecs(view); } catch (e) { console.error("Resas cart extras:", e); }
    /* Most visitors who open checkout leave at its first field, the phone number. One line above the button says what the number is for and
       that payment comes last. Put back if Zid redraws the totals. */
    function assure() {
      var go = $$("a", view).filter(function (a) { return /إتمام الطلب/.test(a.textContent); })[0];
      if (!go || $(".rs-assure", view)) return;
      go.parentNode.insertBefore(el('<p class="rs-assure"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/></svg><span>رقم جوالك للتوصيل فقط، والدفع في آخر خطوة: <bdi>Apple Pay</bdi> والبطاقات وتابي وتمارا.</span></p>'), go);
    }
    assure();
    if ("MutationObserver" in window) { var ta = 0; new MutationObserver(function () { clearTimeout(ta); ta = setTimeout(assure, 300); }).observe(view, { childList: true, subtree: true }); }
    var paint = shipMeter(view, "before");
    var body = $(".cart-products-with-totals", view);
    if (paint && body && "MutationObserver" in window) { var t = 0; new MutationObserver(function () { clearTimeout(t); t = setTimeout(paint, 700); }).observe(body, { childList: true, subtree: true }); }
  }
  function bundle(page, box, title, priceEl, img, pool) {
    if ($(".rs-bundle", box)) return;
    var anchor = $(".rs-ask", box) || $(".product-buttons", box), main = $(".col-product-info .btn-add-to-cart", box);
    if (!anchor || !main) return;
    var picks = (pool ? $$(".rs-more__slot", pool) : []).map(function (slot) {
      var c = $(".product-item", slot), b = c && $(".product-card-add-to-cart", c), im = c && $("img[id^='product-card-img']", c), pr = c && $(".product-price span", c);
      return c && b && pr ? { name: txt($(".product-title", c)), price: num(txt(pr)), img: im ? (im.getAttribute("src") || im.getAttribute("data-src") || "") : "", btn: b } : null;
    }).filter(function (p) { return p && p.price > 0 && p.name; }).slice(0, 2);
    if (!picks.length) return;
    var mainPrice = priceEl ? num(txt(priceEl)) : 0;
    function row(p, i, fixed) {
      return '<li class="rs-bundle__row"><label><input type="checkbox" data-i="' + i + '" checked' + (fixed ? " disabled" : "") + '><span class="rs-bundle__img">' + (p.img ? '<img src="' + esc(p.img) + '" alt="" loading="lazy">' : "") + '</span><span class="rs-bundle__name">' + esc(p.name) + '</span><span class="rs-bundle__price">' + money(p.price) + "</span></label></li>";
    }
    var all = [{ name: title, price: mainPrice, img: img }].concat(picks);
    var sec = el('<section class="rs-bundle" aria-label="يكمل طلبك"><h3 class="rs-bundle__title">يكمل طلبك</h3><ul class="rs-bundle__list">' + all.map(function (p, i) { return row(p, i, i === 0); }).join("") + '</ul><div class="rs-bundle__foot"><span class="rs-bundle__total">المجموع <strong></strong></span><button type="button" class="rs-bundle__go"></button></div></section>');
    anchor.parentNode.insertBefore(sec, anchor.nextSibling);
    var total = $(".rs-bundle__total strong", sec), go = $(".rs-bundle__go", sec), busy = false;
    function chosen() { return all.filter(function (p, i) { return $('input[data-i="' + i + '"]', sec).checked; }); }
    function refresh() {
      var list = chosen(), sum = list.reduce(function (n, p) { return n + p.price; }, 0);
      total.textContent = money(sum); go.textContent = list.length > 1 ? "أضف " + list.length + " منتجات للسلة" : "أضف للسلة";
    }
    sec.addEventListener("change", refresh); refresh();
    go.addEventListener("click", function () {
      if (busy) return; busy = true; go.disabled = true;
      var list = chosen(), sel = $("#product-quantity"), want = 1 + list.length - 1;
      cartData().then(function (c0) {
        var before = cartPieces(c0), i = 0; go.textContent = "جارٍ الإضافة…";
        (function next() {
          if (i >= list.length) return verify(0);
          var p = list[i++]; if (p === all[0]) main.click(); else p.btn.click();
          setTimeout(next, 900);
        })();
        function verify(n) {
          setTimeout(function () {
            cartData().then(function (c1) {
              var now = cartPieces(c1);
              if (before !== null && now !== null && now >= before + want) return finish(true);
              if (n >= 6) return finish(before === null || now === null);
              verify(n + 1);
            });
          }, 500);
        }
      });
      function finish(ok) {
        go.textContent = ok ? "تمت الإضافة ✓" : "تعذّرت الإضافة، حاول مرة ثانية";
        document.dispatchEvent(new Event("rs-cart-change"));
        setTimeout(function () { refresh(); go.disabled = false; busy = false; }, 2200);
      }
    });
  }

  /* ---------- long product descriptions: show a part, "show more" for the rest ---------- */
  function descMore() {
    var d = $(".description-paragrah");
    if (!d || $(".rs-readmore")) return;
    var limit = window.innerWidth < 768 ? 280 : 320, btn = null;
    function apply() {
      if (btn || d.scrollHeight <= limit + 120) return;
      d.classList.add("rs-clamp"); d.style.setProperty("--rs-clamp", limit + "px");
      btn = el('<button type="button" class="rs-readmore" aria-expanded="false">عرض المزيد</button>');
      d.parentNode.insertBefore(btn, d.nextSibling);
      btn.addEventListener("click", function () {
        var open = d.classList.toggle("is-open");
        btn.textContent = open ? "عرض أقل" : "عرض المزيد"; btn.setAttribute("aria-expanded", open ? "true" : "false");
        if (!open) d.parentNode.scrollIntoView({ block: "start", behavior: "smooth" });
      });
    }
    apply(); window.addEventListener("load", apply); setTimeout(apply, 1500);
  }

  /* ---------- product page: things that help the sale ----------
     Under the buy box: "you may also like" (same category), at the end: highest rated and recently viewed. Plus a savings line next to
     the discount and an "ask on WhatsApp" button. All of it is read from the store's own pages, nothing is typed in here. */
  function jsonLd(type) {
    var out = [];
    $$('script[type="application/ld+json"]').forEach(function (sc) { try { var j = JSON.parse(sc.textContent); (Array.isArray(j) ? j : [j]).forEach(function (x) { if (x && x["@type"] === type) out.push(x); }); } catch (e) {} });
    return out;
  }
  function hrefKey(c) { var a = $('a[href*="/products/"]', c); if (!a) return ""; try { return decodeURIComponent((a.getAttribute("href") || "").split("?")[0]); } catch (e) { return a.getAttribute("href") || ""; } }
  function cardsOf(url, here) {
    return fetch(url, { credentials: "same-origin" }).then(function (r) { return r.ok ? r.text() : ""; }).then(function (html) {
      if (!html) return [];
      var d = new DOMParser().parseFromString(html, "text/html"), seen = {}, list = [];
      $$(".product-item", d).forEach(function (c) {
        var key = hrefKey(c);
        if (!key || seen[key] || key === here || $(".btn-product-card-out-of-stock", c)) return;
        seen[key] = 1; list.push(c);
      });
      return list;
    }).catch(function () { return []; });
  }
  function ratingOf(c) { var r = $(".product-card-rating", c), n = $(".product-card-rating-count", c); return (r ? parseFloat(r.getAttribute("data-rating")) || 0 : 0) * 10 + (n ? num(n.textContent) / 100 : 0); }
  function moreSection(title, nodes, cls) {
    if (!nodes.length) return null;
    var sec = el('<section class="rs-more ' + (cls || "") + '" aria-label="' + esc(title) + '"><div class="rs-more__head"><h2 class="rs-more__title">' + esc(title) + '</h2></div><div class="rs-more__rail"></div></section>');
    var rail = $(".rs-more__rail", sec);
    /* Zid's script turns each heart into a login link for visitors who are not signed in; cards fetched as plain HTML have not been through
       it, so do the same here (signed-in visitors simply get no heart on these cards). */
    var wl = $(".col-product-info .add-to-wishlist a.icon-heart-mask");
    nodes.slice(0, 8).forEach(function (c) {
      var slot = document.createElement("div"); slot.className = "rs-more__slot"; slot.appendChild(document.importNode(c, true));
      $$(".add-to-wishlist", slot).forEach(function (h) { if (wl) h.innerHTML = '<a class="icon-heart-mask" href="' + esc(wl.getAttribute("href")) + '"></a>'; else h.parentNode.removeChild(h); });
      rail.appendChild(slot);
    });
    return sec;
  }
  function productPage() {
    var page = $(".products-details-page");
    try { descMore(); } catch (e) { console.error("Resas description:", e); }
    if (!page || $(".rs-more", page) || RESAS.productExtras === false) return;
    var box = $("section.products-details", page), here = decodeURIComponent(location.pathname);
    if (!box) return;
    var title = txt($("h1", box)) || document.title, ld = jsonLd("Product")[0] || {}, img = Array.isArray(ld.image) ? ld.image[0] : ld.image || "";
    var priceEl = $(".product-formatted-price", box), oldEl = $(".product-formatted-price-old", box), discEl = $(".product-formatted-price-discount", box);

    /* the saving in riyals, beside the percentage */
    if (priceEl && oldEl && discEl && !$(".rs-save", box)) {
      var diff = num(txt(oldEl)) - num(txt(priceEl));
      if (diff > 0) { var sv = document.createElement("span"); sv.className = "rs-save"; sv.textContent = "وفّرت " + (Math.round(diff * 100) % 100 ? diff.toFixed(2) : Math.round(diff)) + " ريال"; discEl.parentNode.insertBefore(sv, discEl.nextSibling); }
    }
    /* ask on WhatsApp, with the product in the message */
    var buttons = $(".product-buttons", box);
    if (buttons && RESAS.whatsapp && !$(".rs-ask", box)) {
      var msg = "مرحباً، أريد الاستفسار عن: " + title + "\n" + location.origin + location.pathname;
      var ask = el('<a class="rs-ask" href="https://wa.me/' + esc(RESAS.whatsapp) + "?text=" + encodeURIComponent(msg) + '" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5a8.5 8.5 0 0 0-7.3 12.9L3.5 20.5l4.2-1.1A8.5 8.5 0 1 0 12 3.5z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M9 8.6c.2 2.6 2.8 5.2 5.4 5.4l1.3-1.2-1.9-1.1-.8.6c-.9-.4-1.7-1.2-2.1-2.1l.6-.8-1.1-1.9z" fill="currentColor"/></svg><span>اسأل عن هذا العطر على واتساب</span></a>');
      buttons.parentNode.insertBefore(ask, buttons.nextSibling);
    }

    /* recently viewed (this browser only) */
    var recent = [];
    try { recent = JSON.parse(localStorage.getItem("rs-recent") || "[]").filter(function (r) { return r && r.u && decodeURIComponent(r.u) !== here; }); } catch (e) {}
    try { localStorage.setItem("rs-recent", JSON.stringify([{ u: location.pathname, t: title, i: img, p: priceEl ? txt(priceEl) : "" }].concat(recent).slice(0, 9))); } catch (e) {}

    var cat = "", crumbs = jsonLd("BreadcrumbList")[0];
    if (crumbs && crumbs.itemListElement) crumbs.itemListElement.forEach(function (it) { var u = String((it.item && it.item["@id"]) || it.item || ""); if (/\/categories\//.test(u)) cat = u; });
    (cat ? cardsOf(cat, here) : Promise.resolve([])).then(function (rel) {
      var used = {}; rel.forEach(function (c) { used[hrefKey(c)] = 1; });
      var s1 = moreSection("قد يعجبك أيضاً", rel, "rs-more--related");
      /* After the description and the reviews, inside the page container (same width as the rest). */
      var host = box.parentNode;
      if (s1) host.appendChild(s1);
      return cardsOf("/", here).then(function (home) {
        var best = home.filter(function (c) { return !used[hrefKey(c)]; }).sort(function (a, b) { return ratingOf(b) - ratingOf(a); });
        var s2 = moreSection(best[0] && ratingOf(best[0]) >= 10 ? "الأعلى تقييماً" : "اختيارات رساس", best, "rs-more--best");
        /* s2 is not shown on the page: it only gives the "complete your order" bundle its two products. */
        try { bundle(page, box, title, priceEl, img, s2); shipMeter($(".rs-bundle", box) || $(".rs-ask", box) || $(".product-buttons", box), "after"); } catch (e) { console.error("Resas bundle:", e); }
        if (recent.length) {
          var s3 = el('<section class="rs-more rs-more--recent" aria-label="شاهدتها مؤخراً"><div class="rs-more__head"><h2 class="rs-more__title">شاهدتها مؤخراً</h2></div><div class="rs-more__rail">' + recent.slice(0, 8).map(function (r) {
            return '<div class="rs-more__slot"><a class="rs-recent" href="' + esc(r.u) + '">' + (r.i ? '<img src="' + esc(r.i) + '" alt="" loading="lazy">' : "") + '<span class="rs-recent__name">' + esc(r.t) + '</span><span class="rs-recent__price">' + esc(r.p) + "</span></a></div>";
          }).join("") + "</div></section>");
          host.appendChild(s3);
        }
      });
    });
  }

  /* ---------- back to the top ---------- */
  function backToTop() {
    if (RESAS.backToTop === false || $(".rs-top")) return;
    var b = el('<button type="button" class="rs-top" aria-label="العودة إلى أعلى الصفحة"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5"/></svg></button>');
    document.body.appendChild(b);
    var shown = false;
    function sync() { var on = (window.pageYOffset || document.documentElement.scrollTop) > 700; if (on !== shown) { shown = on; b.classList.toggle("rs-top--on", on); } }
    window.addEventListener("scroll", sync, { passive: true }); sync();
    b.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); });
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
    try { phoneBars(); } catch (e) { console.error("Resas phone bars:", e); }
    try { priceFirst(); } catch (e) { console.error("Resas price first:", e); }
    try { productPage(); } catch (e) { console.error("Resas product page:", e); }
    try { cartPage(); } catch (e) { console.error("Resas cart page:", e); }
    try { backToTop(); } catch (e) { console.error("Resas back to top:", e); }
    try { productTrust(); } catch (e) { console.error("Resas trust strip:", e); }
    try { categoryTop(); } catch (e) { console.error("Resas category top:", e); }
    try { footerYear(); } catch (e) { console.error("Resas footer year:", e); }
    try { cartQty(); } catch (e) { console.error("Resas cart quantity:", e); }
    try { staleLogin(); } catch (e) { console.error("Resas stale login:", e); }
    try { slickGuard(); } catch (e) { console.error("Resas slick guard:", e); }
    try { altFix(); } catch (e) { console.error("Resas alt text:", e); }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
