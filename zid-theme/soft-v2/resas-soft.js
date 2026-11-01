/* Resas on Zid's Soft theme: the approved homepage design, built from the store's own dashboard sections.
   Paste the whole file into Zid: المظهر ← تخصيص الثيم ← JavaScript مخصص.
   What comes from the dashboard (change it there, the page follows):
     - the banner: the first banner section of the home page
     - the category row: the category sections (names, images, links)
     - the product tabs: every product section (its title and its first products)
     - the tiles, "featured products", sale band and Instagram photos: taken from those same products
     - the blog posts: the three newest posts of the store blog
     - reviews, menu, footer, store logo
   What is written here, in RESAS below: the top announcement, the WhatsApp number, the "about" text, and a few fallbacks. */
(function () {
  "use strict";

  var RESAS = {
    announcement: "قسّم مشترياتك على 4 دفعات مع تمارا وتابي، بدون فوائد",
    whatsapp: "966590000902",
    /* Header logo override. Better: upload the logo in Zid's store settings and leave this empty. */
    logo: "https://mohammedaboseedo.github.io/resas-store-design/storefront/assets/img/logo.svg",
    /* Shown only when the dashboard has no banner section. */
    bannerFallback: "https://mohammedaboseedo.github.io/resas-store-design/storefront/assets/img/banner.webp",
    about: { title: "ثمانية عشر عاماً في صناعة الرائحة", text: "نشأت رساس في المملكة العربية السعودية عام 2008، لتقدم عطوراً فرنسية وشرقية بأسلوب دافئ وأنيق، وبخوراً وعوداً من أجود الأنواع.", cta: "تسوّق عطور رساس" },
    tileText: "اكتشف المجموعة",
    tabLimit: 10,
    featuredCount: 6,
    /* Product pages checked for an old price when no product on the home page is on sale. Optional. */
    dealUrls: ["/products/رساس", "/products/مجموعة-سجى-saja-perfumes", "/products/ربع-تولة", "/products/5-كريمات-لليدين"],
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
    var lang = $(".account-lang-currency");
    if (lang) lang.style.display = "none";
  }

  /* ---------- reading the store's own sections ---------- */
  function sized(src, w) { src = String(src || "").trim(); return /cdn-cgi\/image\//.test(src) ? src.replace(/w=\d+/, "w=" + w) : src; }
  function txt(e) { return e ? e.textContent.replace(/\s+/g, " ").trim() : ""; }
  function live(list) { return list.filter(function (e) { return !e.closest(".slick-cloned"); }); }
  function cardInfo(c) {
    var a = $('a[href*="/products/"]', c), im = $("img[id^='product-card-img']", c), pr = $(".product-price span", c);
    var old = $(".product-price del, .product-price .old-price, .product-price [class*='old']", c);
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
    var S = { hero: null, cats: [], sections: [], cards: [], used: [] };
    var ss = $$("section.ss", root);
    if (ss[0]) {
      var hi = live($$("img", ss[0]))[0], ha = hi && hi.closest("a");
      if (hi) S.hero = { src: (hi.getAttribute("src") || "").trim() || (hi.currentSrc || ""), url: ha ? ha.getAttribute("href") : "", alt: hi.getAttribute("alt") || "" };
    }
    S.used = S.used.concat(ss, $$(".gallery-section", root));
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

    var arches = S.cats.length ? el('<section class="rs-sec" aria-labelledby="rs-cat-title"><div class="rs-wrap"><div class="rs-sec__head"><h2 class="rs-title rs-sec__title" id="rs-cat-title"' + rise(0) + '>تسوّق حسب القسم</h2>' +
      '<a class="rs-link" href="/categories"' + rise(80) + '>عرض كل الأقسام</a></div><ul class="rs-arches">' +
      S.cats.slice(0, 12).map(function (a, i) {
        return '<li' + rise(i * 55) + '><a class="rs-arch-link" href="' + esc(a.url) + '"><span class="rs-arch-link__frame"><img src="' + esc(sized(a.image, 420)) + '" alt="" loading="lazy"></span><span class="rs-arch-link__name">' + esc(a.name) + "</span></a></li>";
      }).join("") + "</ul></div></section>") : null;

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

    /* Tiles: the first four product sections, each with its first product photo. */
    var KINDS = ["photo a", "sand", "dark", "photo d"];
    var tiles = el('<section class="rs-sec" aria-label="أقسام مختارة"><div class="rs-wrap"><ul class="rs-tiles">' + S.sections.slice(0, 4).map(function (sec, i) {
      var k = KINDS[i].split(" "), first = sec.cards.filter(function (c) { return c.inStock; })[0] || sec.cards[0], cat = catFor(S, sec.title);
      var cls = "rs-tile rs-tile--" + k[0] + (k[1] ? " rs-tile--" + k[1] : "");
      var text = '<span class="rs-tile__title">' + esc(sec.title) + '</span><span class="rs-tile__text">' + esc(RESAS.tileText) + "</span>";
      var pic = '<img src="' + esc(sized(first.image, 700)) + '" alt="" loading="lazy">';
      return '<li' + rise(i * 90) + '><a class="' + cls + '" href="' + esc(cat ? cat.url : first.url) + '">' + (k[0] === "photo" ? pic + text : text + pic) + "</a></li>";
    }).join("") + "</ul></div></section>");

    /* Sale band: products on the home page that show an old price; if none do, the optional pages in RESAS.dealUrls are checked. */
    var deals = el('<section class="rs-sec" aria-labelledby="rs-deals-title" hidden><div class="rs-wrap"><div class="rs-dband"></div></div></section>');
    var onSale = S.cards.filter(function (c) { return c.oldNum > c.priceNum && c.priceNum > 0; }).map(function (c) {
      return { url: c.url, title: c.name, price: c.price, old: c.oldHtml, pct: Math.round((1 - c.priceNum / c.oldNum) * 100), image: c.image };
    });
    var dealsReady = onSale.length ? Promise.resolve(onSale) : Promise.all((RESAS.dealUrls || []).map(loadProduct)).then(function (list) {
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
    fetch("/blogs/المدونة", { credentials: "same-origin" }).then(function (r) { return r.ok ? r.text() : Promise.reject(); }).then(function (html) {
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

    /* Order: banner, categories, about, product tabs, tiles, sale band, the store's reviews, featured, two banners, blog, Instagram. */
    var after = anchor;
    function put(node) { if (!node) return; after.parentNode.insertBefore(node, after.nextSibling); after = node; }
    anchor.parentNode.insertBefore(hero, anchor);
    put(arches); put(about); put(picks); put(tiles); put(deals);
    var rv = $(".testimonials-slider", root), reviews = rv && rv.closest("[section-id]");
    if (reviews) {
      /* The store left this section's title empty in the dashboard. */
      var rt = $(".section-title", reviews);
      if (rt && !rt.textContent.trim()) rt.textContent = "آراء عملائنا";
      after.parentNode.insertBefore(reviews, after.nextSibling);
      after = reviews;
    }
    put(featured); put(duo); put(blog); put(insta);
    /* Only now hide the sections that were used, so a failure above never leaves the page empty. */
    S.used.forEach(function (n) { n.classList.add("rs-used"); });
    root.classList.add("rs-ready");
    observe(root);
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
    try { home(); } catch (e) { console.error("Resas home:", e); }
    try { reviewsSlider(); } catch (e) { console.error("Resas reviews:", e); }
    try { catCols(); window.addEventListener("resize", catCols); } catch (e) { console.error("Resas categories:", e); }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
