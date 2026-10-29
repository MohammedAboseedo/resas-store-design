/* Resas on Zid's Soft theme, v2: the approved luxury homepage, built around the store's own product sections.
   Replaces the store's previous custom JS (backup: zid-theme/backup-2026-10-26/custom-scripts.js).
   Paste the whole file into Zid: المظهر ← تخصيص الثيم ← JavaScript مخصص.
   Everything editable is in RESAS below. Product cards, prices, stock and add to cart come live from Zid. */
(function () {
  "use strict";

  var M = "640fc833-23b0-408d-8400-ab3e292a7099/";
  var RESAS = {
    announcement: "قسّم مشترياتك على 4 دفعات مع تمارا وتابي، بدون فوائد",
    whatsapp: "966590000902",
    /* Banner: one image across the page. Upload it to Zid (Files) and paste its address here to host it on the store. */
    banner: { image: "https://mohammedaboseedo.github.io/resas-store-design/storefront/assets/img/banner.webp", alt: "رساس: كل زجاجة تحمل قصة وكل رائحة توقيع" },
    arches: [
      { title: "الأكثر مبيعاً", url: "/categories/1385910/الاكثر-مبيعا", image: M + "7f45bf7f-b2ae-4e43-a751-079cac07c99d.jpeg" },
      { title: "عطور", url: "/categories/358519/عطور", image: M + "dc857f06-41cd-4df4-940a-4938a84ae9d0.jpeg" },
      { title: "عطور خاصة", url: "/categories/1162806/عطور-خاصة", image: M + "7964b07d-82a5-49ae-94d9-27a8ce1b5364.jpeg" },
      { title: "البخور والعود", url: "/categories/218590/أجود-أنواع-البخور-والعود-20-70", image: M + "4ddff223-1e42-46c9-9d42-307d89e719d6.jpg" },
      { title: "الهدايا الملكية", url: "/categories/265764/الهدايا-الملكية", image: M + "d27754d3-1a8c-4b49-b5e8-b9d7d1723dc9.jpeg" },
      { title: "توزيعات", url: "/categories/673261/توزيعات", image: M + "5bf99d88-4231-4c30-b3c4-bd7bdc7549fd.jpeg" },
      { title: "عطور جو ومفارش", url: "/categories/141977/عطور-جو-ومفارش", image: M + "53c10af0-3ea9-41ec-b792-3766ad9a2d79.jpeg" },
      { title: "فواحات اعواد", url: "/categories/141504/فواحات", image: M + "b78ad718-252d-4c22-98d8-7752b4f0d245.jpg" }
    ],
    about: { title: "ثمانية عشر عاماً في صناعة الرائحة", text: "نشأت رساس في المملكة العربية السعودية عام 2008، لتقدم عطوراً فرنسية وشرقية بأسلوب دافئ وأنيق، وبخوراً وعوداً من أجود الأنواع.", image: M + "d227b714-bf96-4d10-b8a0-519b70c57270.jpg", cta: { label: "تسوّق عطور رساس", url: "/categories/358519/عطور" } },
    /* Tabs over the store's own product sections (Zid section ids), in this order. */
    tabs: [
      { section: "a5461952-4f19-4a03-858a-6270c84858f6", url: "/categories/1162806/عطور-خاصة" },
      { section: "508d303b-2adf-42b0-aea6-3b3b71461f5b" },
      { section: "8d250eae-5a8d-4c8a-befa-67f7ebea301a" },
      { section: "22d7da3a-1c52-4096-b53d-2786a4077918", url: "/categories/218590/أجود-أنواع-البخور-والعود-20-70" },
      { section: "5ad035fa-0854-410e-8f83-9cc9d86b68a2", url: "/categories/673261/توزيعات" }
    ],
    tabLimit: 10,
    tiles: [
      { kind: "photo a", title: "عطور رساس\nالخاصة", text: "تراكيب لا تجدها في مكان آخر.", image: M + "6ea3fd1d-aee6-44d5-a229-70ebd8e50d4c.jpg", url: "/categories/1162806/عطور-خاصة" },
      { kind: "sand", title: "صُنعت\nبعناية", text: "خبرة رساس منذ 2008.", image: M + "3779b10e-8d49-4290-9825-106a2c8a019a.jpeg", url: "/categories/358519/عطور" },
      { kind: "dark", title: "قسّمها على\n4 دفعات", text: "مع تمارا وتابي، بدون فوائد.", image: M + "a24d71a3-9fa6-43ff-ba9e-b712bc742342.jpeg", url: "/categories/673261/توزيعات" },
      { kind: "photo d", title: "الهدايا\nالملكية", text: "مباخر وأطقم لمن تحب.", image: M + "d27754d3-1a8c-4b49-b5e8-b9d7d1723dc9.jpeg", url: "/categories/265764/الهدايا-الملكية" }
    ],
    /* Deals: these product pages are read; only those that really show an old price appear. The section hides itself when none do. */
    deals: ["/products/رساس", "/products/مجموعة-سجى-saja-perfumes", "/products/ربع-تولة", "/products/5-كريمات-لليدين"],
    /* Featured: six small cards. Prices are read live from each product page. */
    featured: [
      { name: "عود كمبودي", id: "d980e779-7321-4a39-97cb-c5461a3efc1c", rating: [5, 1], url: "/products/عود-كمبودي", image: M + "8ed99edd-2a52-4268-b0ac-ecaeb9145066.jpg" },
      { name: "سوفاج 100 مل", id: "75c11848-018b-47fd-90a6-79766675ca2d", rating: [0, 0], url: "/products/سوفاج", image: M + "995e6258-0fb6-4bf5-9ad9-0b23287dd7b1.jpg" },
      { name: "سوسبيرو 100 مل", id: "2b2a99aa-3130-4265-a629-2c6c329cc6a9", rating: [0, 0], url: "/products/dg-femme", image: M + "db679ab0-6a3b-4925-b53c-f129107f2cb4.jpg" },
      { name: "ليدي عنبر", id: "40e0c2ee-cd22-49e8-83dc-a0dfb62aa212", rating: [5, 4], url: "/products/ليدي-عنبر", image: M + "ae0cd722-6462-47a3-96d0-ac22188a9f32.jpg" },
      { name: "Hair Mist مسك", id: "2ec42122-dbb3-4afe-947f-c603c24524e2", rating: [5, 1], url: "/products/مسك", image: M + "ac695418-4e04-4005-818b-7c0e0e71d9c4.jpg" },
      { name: "مبخرة اعواد العود", id: "608761f1-a369-41d6-b52b-e50fdaddf57c", rating: [0, 0], url: "/products/مبخرة-اعواد-العود", image: M + "46e78547-cc7f-458a-a11c-9cea3184105c.jpg" }
    ],
    duo: [
      { kicker: "للمناسبات", title: "الهدايا\nالملكية", text: "مباخر وأطقم تليق بمن تحب.", cta: "تسوّق الهدايا", url: "/categories/265764/الهدايا-الملكية", image: M + "d27754d3-1a8c-4b49-b5e8-b9d7d1723dc9.jpeg" },
      { kicker: "محتار في اختيار عطرك؟", title: "نساعدك تختار\nعطرك المناسب", text: "فريق رساس يرد عليك على واتساب، لك أو لهديتك.", cta: "تحدّث معنا على واتساب", url: "https://wa.me/966590000902", image: M + "94736846-a84f-4b46-b140-b0d4f21ed080.jpg" }
    ],
    /* Blog: the store's three posts, with product photos until they get covers. */
    posts: [
      { title: "كيف تختار العطر المناسب لك", text: "دليل يساعدك تختار عطراً يدوم ويعبّر عنك، حسب شخصيتك ونوع بشرتك والمناسبة.", url: "/blogs/كيفية-اختيار-العطر-المناسب-دليل-شامل-لاختيار-عطرك-المثالي", image: M + "dc857f06-41cd-4df4-940a-4938a84ae9d0.jpeg" },
      { title: "أنواع العطور الرجالية", text: "الشرقية والخشبية والمنعشة: كيف تختار منها ما يناسب شخصيتك ومناسباتك.", url: "/blogs/أنواع-العطور-الرجالية-دليل-شامل-لاختيار-أفضل-عطر-يناسبك", image: M + "3779b10e-8d49-4290-9825-106a2c8a019a.jpeg" },
      { title: "5 عطور نسائية من رساس", text: "عطور تجمع الأناقة والثبات العالي، تناسب كل الأذواق والمناسبات.", url: "/blogs/أفضل-عطور-نسائية-5-عطور-من-رساس-يجب-أن-تجربها", image: M + "d227b714-bf96-4d10-b8a0-519b70c57270.jpg" }
    ],
    instagram: { handle: "resas_perfume", images: [M + "8ed99edd-2a52-4268-b0ac-ecaeb9145066.jpg", M + "ae0cd722-6462-47a3-96d0-ac22188a9f32.jpg", M + "a24d71a3-9fa6-43ff-ba9e-b712bc742342.jpeg", M + "bdca83c2-3fcf-4ad2-a89a-879141c7e86d.jpg", M + "6ea3fd1d-aee6-44d5-a229-70ebd8e50d4c.jpg", M + "9f5f127f-2c9c-4e28-8ffb-5dd3240254b9.jpeg"] }
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
    var lang = $(".account-lang-currency");
    if (lang) lang.style.display = "none";
  }

  /* ---------- homepage ---------- */
  function home() {
    var root = $(".home");
    if (!root || root.classList.contains("rs-ready")) return;
    var soft = $('[section-id="df0d438a-b345-41db-a20e-65838c8b4a43"]', root);
    var anchor = soft || root.firstElementChild;

    var hero = el('<section class="rs-hero" aria-label="العرض الرئيسي"><img class="rs-hero__img" src="' + esc(RESAS.banner.image) + '" width="1280" height="494" alt="' + esc(RESAS.banner.alt) + '" fetchpriority="high"></section>');

    var arches = el('<section class="rs-sec" aria-labelledby="rs-cat-title"><div class="rs-wrap"><div class="rs-sec__head"><h2 class="rs-title rs-sec__title" id="rs-cat-title"' + rise(0) + '>تسوّق حسب القسم</h2>' +
      '<a class="rs-link" href="/categories"' + rise(80) + '>عرض كل الأقسام</a></div><ul class="rs-arches">' +
      RESAS.arches.map(function (a, i) {
        return '<li' + rise(i * 55) + '><a class="rs-arch-link" href="' + esc(a.url) + '"><span class="rs-arch-link__frame"><img src="' + esc(img(a.image, 420)) + '" alt="" loading="lazy"></span><span class="rs-arch-link__name">' + esc(a.title) + "</span></a></li>";
      }).join("") + "</ul></div></section>");

    var A = RESAS.about;
    var about = el('<section class="rs-sec" aria-labelledby="rs-about-title"><div class="rs-wrap"><div class="rs-about__panel"><div class="rs-about__body"><span class="rs-about__kicker"' + rise(0) + '>عن رساس</span>' +
      '<h2 class="rs-title rs-about__title" id="rs-about-title"' + rise(60) + ">" + esc(A.title) + "</h2><p class=\"rs-about__text\"" + rise(120) + ">" + esc(A.text) + "</p>" +
      '<div class="rs-about__cta"' + rise(180) + '><a class="rs-btn" href="' + esc(A.cta.url) + '">' + esc(A.cta.label) + "</a></div></div>" +
      '<div class="rs-about__media"' + rise(120) + '><img src="' + esc(img(A.image, 900)) + '" alt=""></div></div></div></section>');

    /* Tabs: each tab is one of the store's product sections, shown as a grid of its first cards. */
    var tabs = RESAS.tabs.map(function (t) {
      var sec = $('[section-id="' + t.section + '"]', root);
      if (!sec) return null;
      var title = $(".section-title", sec);
      var cards = $$(".product-item", sec).filter(function (c) { return !c.closest(".slick-cloned"); }).slice(0, RESAS.tabLimit);
      if (!cards.length) return null;
      return { label: title ? title.textContent.trim() : "", url: t.url, cards: cards };
    }).filter(Boolean);
    var picks = null;
    if (tabs.length) {
      picks = el('<section class="rs-sec" aria-labelledby="rs-pop-title"><div class="rs-wrap"><div class="rs-sec__head"><h2 class="rs-title rs-sec__title" id="rs-pop-title"' + rise(0) + '>اختيارات رساس</h2>' +
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
          $$("img[id^='product-card-img']", card).forEach(function (im) { im.src = im.getAttribute("src").trim().replace(/w=\d+/, "w=600"); });
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
    }

    var tiles = el('<section class="rs-sec" aria-label="أقسام مختارة"><div class="rs-wrap"><ul class="rs-tiles">' + RESAS.tiles.map(function (t, i) {
      var k = t.kind.split(" ");
      var cls = "rs-tile rs-tile--" + k[0] + (k[1] ? " rs-tile--" + k[1] : "");
      var text = '<span class="rs-tile__title">' + esc(t.title) + '</span><span class="rs-tile__text">' + esc(t.text) + "</span>";
      var pic = '<img src="' + esc(img(t.image, 700)) + '" alt="" loading="lazy">';
      return '<li' + rise(i * 90) + '><a class="' + cls + '" href="' + esc(t.url) + '">' + (k[0] === "photo" ? pic + text : text + pic) + "</a></li>";
    }).join("") + "</ul></div></section>");

    /* Sale band: read from the product pages; it appears only when a product really shows an old price. */
    var deals = el('<section class="rs-sec" aria-labelledby="rs-deals-title" hidden><div class="rs-wrap"><div class="rs-dband"></div></div></section>');
    Promise.all(RESAS.deals.map(loadProduct)).then(function (list) {
      var on = list.filter(function (p) { return p && p.old && num(p.old) > num(p.price) && p.image; });
      if (!on.length) return;
      var pct = function (p) { return Math.round((1 - num(p.price) / num(p.old)) * 100); };
      var max = on.reduce(function (m, p) { return Math.max(m, pct(p)); }, 0);
      var lead = on.filter(function (p) { return /saja/i.test(p.url); })[0] || on[0];
      $(".rs-dband", deals).innerHTML = '<div class="rs-dband__text"><span class="rs-dband__kicker"' + rise(0) + '>عروض رساس</span><h2 class="rs-title rs-dband__title" id="rs-deals-title"' + rise(60) + ">وفّر حتى " + max + "%</h2>" +
        '<p class="rs-dband__lede"' + rise(120) + ">تخفيضات على " + on.length + " منتجات مختارة من رساس، والأسعار شاملة الضريبة.</p>" +
        '<div class="rs-dband__list">' + on.map(function (p, i) {
          return '<a class="rs-drow"' + rise(180 + i * 70) + ' href="' + esc(p.url) + '"><img src="' + esc(img(p.image, 200)) + '" alt="" loading="lazy"><span><span class="rs-drow__name">' + esc(p.title) + '</span><span class="rs-drow__price"><strong>' + esc(p.price) + "</strong><del>" + esc(p.old) + '</del></span></span><span class="rs-drow__off">' + pct(p) + "%</span></a>";
        }).join("") + "</div></div>" +
        '<div class="rs-dband__media"><img src="' + esc(img(lead.image, 1000)) + '" alt="' + esc(lead.title) + '" loading="lazy"></div>';
      deals.hidden = false;
      observe(deals);
    });

    var STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>';
    function stars(avg) { var o = ""; for (var k = 1; k <= 5; k++) o += STAR.replace("<svg", '<svg class="' + (k <= Math.round(avg) ? "on" : "") + '"'); return o; }
    var featured = el('<section class="rs-sec" aria-labelledby="rs-mini-title"><div class="rs-wrap"><div class="rs-sec__head"><h2 class="rs-title rs-sec__title" id="rs-mini-title"' + rise(0) + '>منتجات مختارة</h2></div><div class="rs-mini">' +
      RESAS.featured.map(function (f, i) {
        var r = f.rating || [0, 0];
        return '<article class="rs-mini__item"' + rise((i % 3) * 70) + '><a class="rs-mini__img" href="' + esc(f.url) + '" tabindex="-1" aria-hidden="true"><img src="' + esc(img(f.image, 240)) + '" alt="" loading="lazy"></a>' +
          '<div class="rs-mini__body"><h3 class="rs-mini__name"><a href="' + esc(f.url) + '">' + esc(f.name) + '</a></h3>' +
          '<div class="rs-mini__rate"><span class="rs-mini__stars" role="img" aria-label="' + (r[1] ? "التقييم " + r[0] + " من 5" : "لا تقييمات بعد") + '">' + stars(r[0]) + "</span>" + (r[1] ? "<span>(" + r[1] + ")</span>" : "") + "</div>" +
          '<p class="rs-mini__price" data-mini-price="' + i + '"></p></div>' +
          '<a class="btn btn-primary product-card-add-to-cart rs-mini__add" href="' + esc(f.url) + '" onclick="event.preventDefault(); event.stopPropagation(); productCartAddToCart(this,\'' + esc(f.id) + '\')"><img class="add-to-cart-progress d-none" src="https://static.zid.store/00e1f94e/spinner.gif?v=v2.55.0" width="20" height="20" alt="">أضف إلى السلة</a></article>';
      }).join("") + "</div></div></section>");
    RESAS.featured.forEach(function (f, i) {
      loadProduct(f.url).then(function (p) { var e = $('[data-mini-price="' + i + '"]', featured); if (e && p && p.price) e.textContent = p.price; });
    });

    var duo = el('<section class="rs-sec" aria-label="هدايا ومساعدة"><div class="rs-wrap"><div class="rs-duo">' + RESAS.duo.map(function (d, i) {
      var ext = /^https?:/.test(d.url);
      return '<a class="rs-duo__item"' + rise(i * 90) + ' href="' + esc(d.url) + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + '><span class="rs-duo__body"><span class="rs-duo__kicker">' + esc(d.kicker) + '</span><span class="rs-title rs-duo__title">' + esc(d.title) + '</span><span class="rs-duo__text">' + esc(d.text) + '</span><span class="rs-link">' + esc(d.cta) + '</span></span><span class="rs-duo__img"><img src="' + esc(img(d.image, 720)) + '" alt="" loading="lazy"></span></a>';
    }).join("") + "</div></div></section>");

    var blog = el('<section class="rs-sec" aria-labelledby="rs-blog-title"><div class="rs-wrap"><div class="rs-sec__head"><h2 class="rs-title rs-sec__title" id="rs-blog-title"' + rise(0) + '>من مدونة رساس</h2></div><div class="rs-posts">' +
      RESAS.posts.map(function (b, i) {
        return '<a class="rs-post"' + rise(i * 90) + ' href="' + esc(b.url) + '"><span class="rs-post__img"><img src="' + esc(img(b.image, 800)) + '" alt="" loading="lazy"></span><h3 class="rs-post__title">' + esc(b.title) + '</h3><p class="rs-post__text">' + esc(b.text) + '</p><span class="rs-link">اقرأ المزيد</span></a>';
      }).join("") + '</div><div class="rs-posts__more"><a class="rs-link" href="/blogs/المدونة">كل المقالات</a></div></div></section>');

    var I = RESAS.instagram;
    var insta = el('<section class="rs-insta" aria-labelledby="rs-insta-title"><div class="rs-wrap rs-insta__head"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".6"/></svg>' +
      '<h2 class="rs-title rs-sec__title" id="rs-insta-title"' + rise(0) + '>تابعنا على إنستغرام</h2><a class="rs-insta__handle" href="https://www.instagram.com/' + I.handle + '" target="_blank" rel="noopener">@' + I.handle + '</a></div><ul class="rs-insta__grid">' +
      I.images.map(function (m) { return '<li><a href="https://www.instagram.com/' + I.handle + '" target="_blank" rel="noopener" aria-label="رساس على إنستغرام"><img src="' + esc(img(m, 480)) + '" alt="" loading="lazy"></a></li>'; }).join("") + "</ul></section>");

    /* Order after the banner: categories, about, product tabs, tiles, sale band, the store's reviews, featured, two banners, blog, Instagram. */
    var after = anchor;
    function put(node) { if (!node) return; after.parentNode.insertBefore(node, after.nextSibling); after = node; }
    anchor.parentNode.insertBefore(hero, anchor);
    put(arches); put(about); put(picks); put(tiles); put(deals);
    var reviews = $('[section-id="bab059dc-abb8-477a-b2ed-2ec96d0fa81a"]', root);
    if (reviews) {
      /* The store left this section's title empty in the dashboard. */
      var rt = $(".section-title", reviews);
      if (rt && !rt.textContent.trim()) rt.textContent = "آراء عملائنا";
      after.parentNode.insertBefore(reviews, after.nextSibling);
      after = reviews;
    }
    put(featured); put(duo); put(blog); put(insta);
    /* Only now hide Soft's original sections, so a failure above never leaves the page empty. */
    if (picks) root.classList.add("rs-ready");
    observe(root);
  }

  /* Soft starts the reviews slider only on some loads (a known timing bug); start it here when it did not run. Phones keep Soft's stacked cards. */
  function reviewsSlider() {
    var jq = window.jQuery;
    var slider = $('[section-id="bab059dc-abb8-477a-b2ed-2ec96d0fa81a"] .testimonials-slider');
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
