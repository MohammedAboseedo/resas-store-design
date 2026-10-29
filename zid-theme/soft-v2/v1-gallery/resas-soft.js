/* Resas on Zid's Soft theme: builds the approved homepage around the store's own
   banner and product sections, and arranges the header.
   Replaces the store's previous custom JS (backup: zid-theme/backup-2026-10-26/custom-scripts.js).
   Paste the whole file into Zid: المظهر ← تخصيص الثيم ← JavaScript مخصص.
   Everything editable is in RESAS below; product cards, prices and stock come live from Zid. */
(function () {
  "use strict";

  var RESAS = {
    announcement: "قسّم مشترياتك على 4 دفعات مع تمارا وتابي، بدون فوائد",
    whatsapp: "966590000902",
    instagram: "https://www.instagram.com/resas_perfume",
    /* Categories under the banner. The photo is a product photo from Zid. */
    arches: [
      { title: "الأكثر مبيعاً", url: "/categories/1385910/الاكثر-مبيعا", image: "640fc833-23b0-408d-8400-ab3e292a7099/7f45bf7f-b2ae-4e43-a751-079cac07c99d.jpeg" },
      { title: "عطور", url: "/categories/358519/عطور", image: "640fc833-23b0-408d-8400-ab3e292a7099/dc857f06-41cd-4df4-940a-4938a84ae9d0.jpeg" },
      { title: "عطور خاصة", url: "/categories/1162806/عطور-خاصة", image: "640fc833-23b0-408d-8400-ab3e292a7099/7964b07d-82a5-49ae-94d9-27a8ce1b5364.jpeg" },
      { title: "البخور والعود", url: "/categories/218590/أجود-أنواع-البخور-والعود-20-70", image: "640fc833-23b0-408d-8400-ab3e292a7099/4ddff223-1e42-46c9-9d42-307d89e719d6.jpg" },
      { title: "الهدايا الملكية", url: "/categories/265764/الهدايا-الملكية", image: "640fc833-23b0-408d-8400-ab3e292a7099/d27754d3-1a8c-4b49-b5e8-b9d7d1723dc9.jpeg" },
      { title: "توزيعات", url: "/categories/673261/توزيعات", image: "640fc833-23b0-408d-8400-ab3e292a7099/5bf99d88-4231-4c30-b3c4-bd7bdc7549fd.jpeg" },
      { title: "عطور جو ومفارش", url: "/categories/141977/عطور-جو-ومفارش", image: "640fc833-23b0-408d-8400-ab3e292a7099/53c10af0-3ea9-41ec-b792-3766ad9a2d79.jpeg" },
      { title: "فواحات اعواد", url: "/categories/141504/فواحات", image: "640fc833-23b0-408d-8400-ab3e292a7099/b78ad718-252d-4c22-98d8-7752b4f0d245.jpg" }
    ],
    /* Tabs over the store's own product sections (Zid section ids), in this order. */
    tabs: [
      { section: "a5461952-4f19-4a03-858a-6270c84858f6", url: "/categories/1162806/عطور-خاصة" },
      { section: "508d303b-2adf-42b0-aea6-3b3b71461f5b" },
      { section: "8d250eae-5a8d-4c8a-befa-67f7ebea301a" },
      { section: "22d7da3a-1c52-4096-b53d-2786a4077918", url: "/categories/218590/أجود-أنواع-البخور-والعود-20-70" },
      { section: "5ad035fa-0854-410e-8f83-9cc9d86b68a2", url: "/categories/673261/توزيعات" }
    ],
    tabLimit: 8,
    story: {
      eyebrow: "عطور رساس منذ 2008",
      title: "شغف بالعطر\nفي كل تفصيلة",
      text: "نشأت رساس في المملكة العربية السعودية عام 2008، لتقدم عطوراً فرنسية وشرقية بأسلوب دافئ وأنيق، وبخوراً وعوداً من أجود الأنواع.",
      image: "640fc833-23b0-408d-8400-ab3e292a7099/9e29ccd2-79c5-4a6f-817f-f94c19acc616.jpg",
      cta: { label: "تسوّق عطور رساس", url: "/categories/358519/عطور" }
    },
    duo: [
      { eyebrow: "للمناسبات", title: "الهدايا\nالملكية", text: "مباخر وأطقم تليق بمن تحب.", image: "640fc833-23b0-408d-8400-ab3e292a7099/d27754d3-1a8c-4b49-b5e8-b9d7d1723dc9.jpeg", cta: { label: "تسوّق الهدايا", url: "/categories/265764/الهدايا-الملكية" } },
      { eyebrow: "محتار في اختيار عطرك؟", title: "نساعدك تختار\nعطرك المناسب", text: "فريق رساس يرد عليك على واتساب، لك أو لهديتك.", image: "640fc833-23b0-408d-8400-ab3e292a7099/94736846-a84f-4b46-b140-b0d4f21ed080.jpg", cta: { label: "تحدّث معنا على واتساب", whatsapp: true } }
    ],
    posts: [
      { title: "كيف تختار العطر المناسب لك", text: "دليل يساعدك تختار عطراً يدوم ويعبّر عنك، حسب شخصيتك ونوع بشرتك والمناسبة.", url: "/blogs/كيفية-اختيار-العطر-المناسب-دليل-شامل-لاختيار-عطرك-المثالي", image: "640fc833-23b0-408d-8400-ab3e292a7099/dc857f06-41cd-4df4-940a-4938a84ae9d0.jpeg" },
      { title: "أنواع العطور الرجالية", text: "الشرقية والخشبية والمنعشة: كيف تختار منها ما يناسب شخصيتك ومناسباتك.", url: "/blogs/أنواع-العطور-الرجالية-دليل-شامل-لاختيار-أفضل-عطر-يناسبك", image: "640fc833-23b0-408d-8400-ab3e292a7099/3779b10e-8d49-4290-9825-106a2c8a019a.jpeg" },
      { title: "5 عطور نسائية من رساس", text: "عطور تجمع الأناقة والثبات العالي، تناسب كل الأذواق والمناسبات.", url: "/blogs/أفضل-عطور-نسائية-5-عطور-من-رساس-يجب-أن-تجربها", image: "640fc833-23b0-408d-8400-ab3e292a7099/d227b714-bf96-4d10-b8a0-519b70c57270.jpg" }
    ],
    instagramPhotos: [
      "640fc833-23b0-408d-8400-ab3e292a7099/9f5f127f-2c9c-4e28-8ffb-5dd3240254b9.jpeg",
      "640fc833-23b0-408d-8400-ab3e292a7099/6ea3fd1d-aee6-44d5-a229-70ebd8e50d4c.jpg",
      "640fc833-23b0-408d-8400-ab3e292a7099/bdca83c2-3fcf-4ad2-a89a-879141c7e86d.jpg",
      "640fc833-23b0-408d-8400-ab3e292a7099/a24d71a3-9fa6-43ff-ba9e-b712bc742342.jpeg",
      "640fc833-23b0-408d-8400-ab3e292a7099/ae0cd722-6462-47a3-96d0-ac22188a9f32.jpg",
      "640fc833-23b0-408d-8400-ab3e292a7099/8ed99edd-2a52-4268-b0ac-ecaeb9145066.jpg"
    ]
  };

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function img(path, w) { return "https://media.zid.store/cdn-cgi/image/w=" + w + ",q=82,f=auto/https://media.zid.store/" + path; }
  function link(c) { return c.whatsapp ? "https://wa.me/" + RESAS.whatsapp : c.url; }
  function el(html) { var t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstChild; }

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
    var cart = $(".header-cart");
    var account = $(".account-area");
    var cartLink = $(".a-shopping-cart");
    var mobileSearch = $(".sm-search-icon");
    var region = $(".header-cart .language-currency");
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
    var hero = $('[section-id="df0d438a-b345-41db-a20e-65838c8b4a43"]', root);
    var anchor = hero || root.firstElementChild;

    var arches = el('<section class="rs-arches" aria-label="تسوّق حسب القسم"><div class="rs-container"><ul class="rs-arches__list">' +
      RESAS.arches.map(function (a) {
        return '<li><a class="rs-arch" href="' + esc(a.url) + '"><span class="rs-arch__frame"><img src="' + esc(img(a.image, 400)) + '" alt="" loading="lazy"></span>' +
          '<span class="rs-arch__name">' + esc(a.title) + "</span></a></li>";
      }).join("") + "</ul></div></section>");

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
      picks = el('<section class="rs-section rs-container" aria-label="منتجات رساس"><div class="rs-pills" role="tablist" aria-label="منتجات رساس"></div><div class="rs-panels"></div></section>');
      var pills = $(".rs-pills", picks), panels = $(".rs-panels", picks);
      tabs.forEach(function (t, i) {
        pills.appendChild(el('<button type="button" role="tab" id="rs-tab-' + i + '" aria-controls="rs-panel-' + i + '" aria-selected="' + (i ? "false" : "true") + '"' + (i ? ' tabindex="-1"' : "") + ">" + esc(t.label) + "</button>"));
        var panel = el('<div role="tabpanel" id="rs-panel-' + i + '" aria-labelledby="rs-tab-' + i + '"' + (i ? " hidden" : "") + '><div class="rs-grid"></div></div>');
        var grid = $(".rs-grid", panel);
        t.cards.forEach(function (c) {
          var card = c.cloneNode(true);
          /* Zid sends 235px thumbnails for sliders; the grid needs larger photos. */
          $$("img[id^='product-card-img']", card).forEach(function (im) { im.src = im.getAttribute("src").trim().replace(/w=\d+/, "w=600"); });
          grid.appendChild(card);
        });
        if (t.url) panel.appendChild(el('<p class="rs-panel__more"><a href="' + esc(t.url) + '">عرض الكل</a></p>'));
        panels.appendChild(panel);
      });
      var btns = $$("[role=tab]", pills);
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
    }

    var s = RESAS.story;
    var story = el('<section class="rs-story" aria-labelledby="rs-story-title"><div class="rs-container rs-story__inner"><div class="rs-story__body">' +
      '<span class="rs-eyebrow">' + esc(s.eyebrow) + '</span><h2 class="rs-story__title" id="rs-story-title">' + esc(s.title) + "</h2><p>" + esc(s.text) + "</p>" +
      '<a class="rs-cta" href="' + esc(s.cta.url) + '">' + esc(s.cta.label) + "</a></div>" +
      '<img class="rs-story__img" src="' + esc(img(s.image, 1200)) + '" alt="" loading="lazy"></div></section>');

    var duo = el('<section class="rs-container rs-duo" aria-label="عروض"><ul class="rs-duo__list">' +
      RESAS.duo.map(function (d) {
        return '<li><a class="rs-duo__item" href="' + esc(link(d.cta)) + '"' + (d.cta.whatsapp ? ' target="_blank" rel="noopener"' : "") + ">" +
          '<span class="rs-duo__body"><span class="rs-eyebrow">' + esc(d.eyebrow) + '</span><span class="rs-duo__title">' + esc(d.title) + "</span>" +
          '<span class="rs-duo__text">' + esc(d.text) + '</span><span class="rs-cta">' + esc(d.cta.label) + "</span></span>" +
          '<img src="' + esc(img(d.image, 720)) + '" alt="" loading="lazy"></a></li>';
      }).join("") + "</ul></section>");

    var posts = el('<section class="rs-section rs-container" aria-labelledby="rs-posts-title"><h2 class="rs-heading" id="rs-posts-title">من مدونة رساس</h2><ul class="rs-posts">' +
      RESAS.posts.map(function (p) {
        return '<li><article class="rs-post"><a class="rs-post__img" href="' + esc(p.url) + '" tabindex="-1" aria-hidden="true"><img src="' + esc(img(p.image, 720)) + '" alt="" loading="lazy"></a>' +
          '<h3 class="rs-post__title"><a href="' + esc(p.url) + '">' + esc(p.title) + "</a></h3><p>" + esc(p.text) + "</p>" +
          '<a class="rs-cta" href="' + esc(p.url) + '" aria-label="اقرأ المزيد: ' + esc(p.title) + '">اقرأ المزيد</a></article></li>';
      }).join("") + '</ul><p class="rs-posts__more"><a class="rs-cta" href="/blogs/المدونة">كل المقالات</a></p></section>');

    var handle = "@" + RESAS.instagram.replace(/\/+$/, "").split("/").pop();
    var insta = el('<section class="rs-section rs-insta" aria-labelledby="rs-insta-title"><div class="rs-container rs-insta__head">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".6"/></svg>' +
      '<h2 class="rs-heading" id="rs-insta-title">تابعنا على إنستغرام</h2><a class="rs-insta__handle" href="' + esc(RESAS.instagram) + '" target="_blank" rel="noopener">' + esc(handle) + "</a></div>" +
      '<ul class="rs-insta__grid">' + RESAS.instagramPhotos.map(function (p) {
        return '<li><a href="' + esc(RESAS.instagram) + '" target="_blank" rel="noopener" aria-label="رساس على إنستغرام"><img src="' + esc(img(p, 480)) + '" alt="" loading="lazy"></a></li>';
      }).join("") + "</ul></section>");

    /* Order after the banner: categories, product tabs, story band, two banners, reviews (store's own), blog, Instagram. */
    var after = anchor;
    function put(node) { if (!node) return; after.parentNode.insertBefore(node, after.nextSibling); after = node; }
    put(arches);
    put(picks);
    put(story);
    put(duo);
    var reviews = $('[section-id="bab059dc-abb8-477a-b2ed-2ec96d0fa81a"]', root);
    if (reviews) {
      /* The store left this section's title empty in the dashboard. */
      var rt = $(".section-title", reviews);
      if (rt && !rt.textContent.trim()) rt.textContent = "آراء عملائنا";
      after.parentNode.insertBefore(reviews, after.nextSibling);
      after = reviews;
    }
    put(posts);
    put(insta);
    /* Only now hide the original product sections, so a failure above never leaves the page empty. */
    if (picks) root.classList.add("rs-ready");
  }

  /* Category pages on phones: two subcategories per row (kept from the previous custom JS). */
  function catCols() {
    var narrow = (window.innerWidth || document.documentElement.clientWidth) < 768;
    $$(".cat-col").forEach(function (c) { c.classList.toggle("col-6", narrow); });
  }

  function fonts() {
    if ($('link[data-rs-font]')) return;
    var l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap";
    l.setAttribute("data-rs-font", "");
    document.head.appendChild(l);
  }

  function init() {
    try { fonts(); } catch (e) { console.error("Resas fonts:", e); }
    try { announcement(); } catch (e) { console.error("Resas announcement:", e); }
    try { header(); } catch (e) { console.error("Resas header:", e); }
    try { home(); } catch (e) { console.error("Resas home:", e); }
    try { catCols(); window.addEventListener("resize", catCols); } catch (e) { console.error("Resas categories:", e); }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
