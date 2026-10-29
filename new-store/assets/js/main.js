// رساس: سلوك الواجهة (البطاقات، الهيرو، التبويبات، القائمة، السلة، صفحة المنتج)
(function () {
  'use strict';

  var PRODUCTS = window.RESAS_PRODUCTS || [];
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  // صورة أصغر من خادم زد للبطاقات والمصغرات
  function sized(url, w) {
    return url.replace(/width=\d+,height=\d+/, 'width=' + w + ',height=' + w);
  }
  function money(n) { return n.toFixed(2) + ' ر.س'; }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function inCat(cat) { return function (p) { return p.cats.indexOf(cat) !== -1; }; }
  function byId(id) { return PRODUCTS.filter(function (p) { return p.id === id; })[0]; }

  // تسمية قصيرة تظهر فوق اسم المنتج
  function label(p) {
    var c = p.cats;
    if (c.indexOf('عطور خاصة') !== -1) return 'عطر رساس الخاص';
    if (c.indexOf('عطور مستوحاه') !== -1) return 'عطر مستوحى';
    if (c.indexOf('عطور كلاسيك 30 مل') !== -1 || c.indexOf('عطور كلاسيك 100 مل') !== -1) return 'عطر كلاسيك';
    if (c.indexOf('دهن تولة') !== -1) return 'دهن وتولة';
    if (c.indexOf('البخور والعود') !== -1) return 'بخور وعود';
    if (c.indexOf('عطور جو ومفارش') !== -1) return 'معطر جو';
    if (c.indexOf('عطور الشعر') !== -1) return 'عطر شعر';
    if (c.indexOf('عطور أطفال') !== -1) return 'عطر أطفال';
    return c[0] || 'رساس';
  }

  // الحجم بالمل من اسم المنتج (يقبل الأرقام العربية والإنجليزية)
  function sizeOf(p) {
    var name = p.name.replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); });
    var m = name.match(/(\d+)\s*(مل|ml)/i);
    return m ? parseInt(m[1], 10) : null;
  }

  // صفحات التصنيف: كل صفحة تجمع تصنيفاً أو أكثر من تصنيفات زد
  var CATEGORY_PAGES = {
    all: { title: 'كل المنتجات', desc: 'كل عطور رساس وبخورها ومعطراتها في مكان واحد.', cats: null },
    special: { title: 'عطور رساس الخاصة', desc: 'تركيبات نُعدّها بأنفسنا، من العنبر والمسك إلى العود.', cats: ['عطور خاصة'] },
    inspired: { title: 'عطور مستوحاة', desc: 'عطور مستوحاة من أشهر الماركات العالمية، بحجم 100 مل.', cats: ['عطور مستوحاه'] },
    classic: { title: 'عطور كلاسيك', desc: 'عطور كلاسيك بأحجام 30 و50 و100 مل، ومنها عرض الخمسة عطور.', cats: ['عطور كلاسيك 30 مل', 'عطور كلاسيك 50 مل', 'عطور كلاسيك 100 مل'] },
    oils: { title: 'دهن العود والتولة', desc: 'دهن تولة وعطور زيتية بتوقيع رساس.', cats: ['دهن تولة', 'عطور زيتية'] },
    oud: { title: 'البخور والعود', desc: 'عود وبخور ومعمول ومباخر للبيت والمناسبات.', cats: ['البخور والعود', 'الهدايا الملكية'] },
    home: { title: 'معطرات الجو والفواحات', desc: 'معطرات جو ومفارش وفواحات أعواد للبيت والسيارة.', cats: ['عطور جو ومفارش', 'فواحات اعواد'] },
    hair: { title: 'عطور الشعر', desc: 'Hair Mist بروائح رساس.', cats: ['عطور الشعر'] },
    kids: { title: 'عطور الأطفال', desc: 'عطور لطيفة مخصصة للأطفال.', cats: ['عطور أطفال'] },
    gifts: { title: 'توزيعات وهدايا', desc: 'ربع تولة وبوكسات وأطقم عطور للمناسبات.', cats: ['توزيعات', 'اطقم العطور', 'الهدايا الملكية'] }
  };
  var CATEGORY_ORDER = ['all', 'special', 'inspired', 'classic', 'oils', 'oud', 'home', 'hair', 'kids', 'gifts'];
  function inPage(key) {
    var cats = CATEGORY_PAGES[key].cats;
    return function (p) { return !cats || p.cats.some(function (c) { return cats.indexOf(c) !== -1; }); };
  }
  function pageKeyFor(p) {
    return CATEGORY_ORDER.filter(function (k) { return k !== 'all' && inPage(k)(p); })[0] || 'all';
  }

  // ---------- المجموعات ----------
  var BEST_PICK = ['14e6c951', '64096da2', 'f4328221', 'ac80e400'];
  var COLLECTIONS = {
    best: function () {
      var picked = BEST_PICK.map(byId).filter(Boolean);
      var rest = PRODUCTS.filter(inCat('الاكثر مبيعاً')).filter(function (p) { return picked.indexOf(p) === -1; });
      var special = PRODUCTS.filter(inCat('عطور خاصة')).filter(function (p) { return picked.indexOf(p) === -1 && rest.indexOf(p) === -1; });
      return picked.concat(rest, special);
    },
    special: function () { return PRODUCTS.filter(inCat('عطور خاصة')); },
    inspired100: function () { return PRODUCTS.filter(inCat('عطور مستوحاه')); },
    classic30: function () { return PRODUCTS.filter(inCat('عطور كلاسيك 30 مل')); },
    classic100: function () { return PRODUCTS.filter(inCat('عطور كلاسيك 100 مل')); },
    oud: function () {
      return PRODUCTS.filter(function (p) { return inCat('البخور والعود')(p) || inCat('دهن تولة')(p) || inCat('الهدايا الملكية')(p); });
    },
    related: function () {
      var current = currentProduct();
      var same = current ? PRODUCTS.filter(inPage(pageKeyFor(current))) : [];
      if (same.length < 6) same = same.concat(PRODUCTS.filter(inCat('عطور خاصة')));
      return same.filter(function (p, i) { return p !== current && same.indexOf(p) === i; });
    }
  };

  var HEART = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z"/></svg>';

  function card(p) {
    var href = 'product.html?id=' + p.id;
    var badge = p.old ? '<span class="badge">خصم ' + Math.round((1 - p.price / p.old) * 100) + '%</span>' : '';
    var old = p.old ? '<del class="price">' + money(p.old) + '</del>' : '';
    return '<article class="card">' +
      '<a class="card-media" href="' + href + '" tabindex="-1" aria-hidden="true">' + badge +
        '<img src="' + sized(p.img, 500) + '" alt="" loading="lazy"></a>' +
      '<button class="wish" type="button" aria-pressed="false" aria-label="أضف ' + esc(p.name) + ' إلى المفضلة" data-wish><span>' + HEART + '</span></button>' +
      '<span class="card-cat">' + label(p) + '</span>' +
      '<h3><a href="' + href + '">' + esc(p.name) + '</a></h3>' +
      '<div class="card-price"><span class="price">' + money(p.price) + '</span>' + old + '</div>' +
      '<button class="btn btn-outline" type="button" data-add="' + p.id + '">أضف للسلة</button>' +
      '</article>';
  }

  var CART_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1.2 12H6.2z"/><path d="M9 8V6.5a3 3 0 016 0V8"/></svg>';

  // بطاقة المرجع 3: زر الإضافة والمفضلة داخل الصورة، والسعر فوق الاسم
  function overlayCard(p) {
    var href = 'product.html?id=' + p.id;
    var badge = p.old ? '<span class="badge">' + Math.round((1 - p.price / p.old) * 100) + '%</span>' : '';
    var old = p.old ? '<del class="price">' + money(p.old) + '</del>' : '';
    return '<article class="card card-overlay">' +
      '<div class="card-media">' + badge +
        '<a href="' + href + '" tabindex="-1" aria-hidden="true"><img src="' + sized(p.img, 500) + '" alt="" loading="lazy"></a>' +
        '<div class="card-bar">' +
          '<button class="add-link" type="button" data-add="' + p.id + '">' + CART_ICON + 'أضف للسلة</button>' +
          '<button class="wish" type="button" aria-pressed="false" aria-label="أضف ' + esc(p.name) + ' إلى المفضلة" data-wish><span>' + HEART + '</span></button>' +
        '</div>' +
      '</div>' +
      '<div class="card-price"><span class="price">' + money(p.price) + '</span>' + old + '</div>' +
      '<h3><a href="' + href + '">' + esc(p.name) + '</a></h3>' +
      '<span class="stars stars-empty" role="img" aria-label="لا توجد تقييمات بعد">★★★★★</span>' +
      '</article>';
  }

  function renderCollection(el, key, list) {
    list = list || (COLLECTIONS[key] || function () { return []; })();
    var limit = parseInt(el.getAttribute('data-limit') || '8', 10);
    var make = el.getAttribute('data-card') === 'overlay' ? overlayCard : card;
    el.innerHTML = list.slice(0, limit).map(make).join('');
  }
  $$('[data-collection]').forEach(function (el) { renderCollection(el, el.getAttribute('data-collection')); });

  // ---------- مربعات الأقسام ----------
  var CATS = [
    ['عطور رساس الخاصة', 'عطور خاصة', 'category.html?c=special'],
    ['عطور مستوحاة', 'عطور مستوحاه', 'category.html?c=inspired'],
    ['عطور كلاسيك', 'عطور كلاسيك 30 مل', 'category.html?c=classic'],
    ['دهن العود والتولة', 'دهن تولة', 'category.html?c=oils'],
    ['البخور والعود', 'البخور والعود', 'category.html?c=oud'],
    ['معطرات الجو', 'عطور جو ومفارش', 'category.html?c=home'],
    ['عطور الأطفال', 'عطور أطفال', 'category.html?c=kids']
  ];
  var catsEl = $('[data-cats]');
  if (catsEl) {
    catsEl.innerHTML = CATS.map(function (c) {
      var p = PRODUCTS.filter(inCat(c[1]))[0];
      var img = p ? '<img src="' + sized(p.img, 300) + '" alt="" loading="lazy">' : '';
      return '<a class="cat" href="' + c[2] + '"><span class="cat-img">' + img + '</span><span>' + c[0] + '</span></a>';
    }).join('');
  }

  // ---------- التبويبات في الرئيسية ----------
  $$('[data-tabs]').forEach(function (group) {
    var target = $('[data-tab-target="' + group.getAttribute('data-tabs') + '"]');
    $$('[data-tab]', group).forEach(function (tab) {
      tab.addEventListener('click', function () {
        $$('[data-tab]', group).forEach(function (t) { t.setAttribute('aria-selected', String(t === tab)); });
        renderCollection(target, tab.getAttribute('data-tab'));
      });
    });
  });

  // ---------- الهيرو ----------
  var hero = $('[data-hero]');
  if (hero) {
    var track = $('[data-hero-track]', hero);
    var slides = $$('.hero-slide', track);
    var dotsEl = $('[data-hero-dots]', hero);
    var index = 0, timer = null;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    dotsEl.innerHTML = slides.map(function (_, i) {
      return '<button class="hero-dot" type="button" aria-label="الشريحة ' + (i + 1) + '"></button>';
    }).join('');
    var dots = $$('.hero-dot', dotsEl);

    function go(i) {
      index = (i + slides.length) % slides.length;
      // الصفحة من اليمين لليسار، فالشريحة التالية تأتي من اليسار
      track.style.transform = 'translateX(' + (index * 100) + '%)';
      dots.forEach(function (d, j) { d.setAttribute('aria-current', String(j === index)); });
      slides.forEach(function (s, j) { s.setAttribute('aria-hidden', String(j !== index)); s.inert = j !== index; });
    }
    function play() { if (!reduce) { stop(); timer = setInterval(function () { go(index + 1); }, 6000); } }
    function stop() { if (timer) clearInterval(timer); }

    dots.forEach(function (d, i) { d.addEventListener('click', function () { go(i); play(); }); });
    var next = $('[data-hero-next]', hero), prev = $('[data-hero-prev]', hero);
    if (next) next.addEventListener('click', function () { go(index + 1); play(); });
    if (prev) prev.addEventListener('click', function () { go(index - 1); play(); });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', play);

    // السحب بالإصبع على الجوال
    var startX = null;
    hero.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; stop(); }, { passive: true });
    hero.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) go(index + (dx > 0 ? 1 : -1));
      startX = null; play();
    });

    go(0); play();
  }

  // ---------- القائمة الجانبية ----------
  var drawer = $('#drawer');
  var opener = $('[data-open-drawer]');
  function setDrawer(open) {
    if (!drawer) return;
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    if (opener) opener.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) { var first = $('.drawer-links a', drawer); if (first) first.focus(); }
    else if (opener) opener.focus();
  }
  if (opener) opener.addEventListener('click', function () { setDrawer(true); });
  $$('[data-close-drawer]').forEach(function (el) { el.addEventListener('click', function () { setDrawer(false); }); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('is-open')) setDrawer(false);
  });

  var searchBtn = $('[data-focus-search]');
  if (searchBtn) searchBtn.addEventListener('click', function () { var s = $('[data-mobile-search]'); if (s) s.focus(); });

  // ---------- السلة والمفضلة (تجريبية داخل المتصفح فقط) ----------
  var CART_KEY = 'resas-cart';
  function readCart() { try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch (e) { return {}; } }
  function writeCart(c) { try { localStorage.setItem(CART_KEY, JSON.stringify(c)); } catch (e) { /* تصفح خاص */ } }
  function cartCount(c) { return Object.keys(c).reduce(function (n, k) { return n + c[k]; }, 0); }
  var cart = readCart();
  function paintCount() { $$('[data-cart-count]').forEach(function (el) { el.textContent = cartCount(cart); }); }
  paintCount();

  var toast = $('[data-toast]'), toastTimer = null;
  function notify(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-on'); }, 2400);
  }
  function addToCart(id, qty) {
    var p = byId(id);
    if (!p) return;
    cart[id] = (cart[id] || 0) + (qty || 1);
    writeCart(cart);
    paintCount();
    notify('أُضيف ' + p.name + ' إلى السلة');
  }

  document.addEventListener('click', function (e) {
    var add = e.target.closest('[data-add]');
    if (add) {
      var qtyEl = $('[data-qty]');
      var qty = add.hasAttribute('data-add-qty') && qtyEl ? parseInt(qtyEl.value, 10) : 1;
      addToCart(add.getAttribute('data-add'), qty);
      return;
    }
    var wish = e.target.closest('[data-wish]');
    if (wish) {
      var on = wish.getAttribute('aria-pressed') !== 'true';
      wish.setAttribute('aria-pressed', String(on));
      notify(on ? 'أُضيف إلى المفضلة' : 'أُزيل من المفضلة');
    }
  });

  // ---------- النشرة ----------
  var form = $('[data-newsletter]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = $('input', form), note = $('[data-newsletter-note]');
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
      note.textContent = ok ? 'تم اشتراكك، شكراً لك.' : 'اكتب بريداً إلكترونياً صحيحاً.';
      if (ok) input.value = '';
    });
  }

  // ---------- صفحة المنتج ----------
  function currentProduct() {
    var id = new URLSearchParams(location.search).get('id') || 'ac80e400';
    return byId(id) || byId('ac80e400');
  }

  // أوصاف حقيقية منقولة من صفحات المتجر. المنتج الذي لا وصف له هنا يعرض تنبيهاً بدل نص مخترع.
  var DETAILS = {
    ac80e400: {
      lead: 'العود الملكي المذهل الذي يجمع بين الشرق بطريقة عصرية تحاكي العصر.',
      body: ['مزيج فاخر بامتياز يتسم برائحته النفاذة والمثيرة.',
             'يتميز برائحة الجريب فروت ونقاء الخزامى ونبات الشيح والتبغ، والتوابل والأخشاب الداكنة وأريج العنبر الخام الناعم.',
             'عطر للرجال والنساء سيأسر جميع من حولك ويلفت الأنظار.'],
      notes: [['البداية', 'جريب فروت وخزامى'], ['القلب', 'شيح وتبغ وتوابل'], ['القاعدة', 'أخشاب داكنة وعنبر خام'], ['لمن؟', 'للرجال والنساء']]
    }
  };

  var pdp = $('[data-pdp]');
  if (pdp) {
    var p = currentProduct();
    var d = DETAILS[p.id];
    document.title = p.name + ' | رساس للعطور';
    $$('[data-p-name]').forEach(function (el) { el.textContent = p.name; });
    $$('[data-p-label]').forEach(function (el) { el.textContent = label(p); });
    $$('[data-p-price]').forEach(function (el) { el.textContent = money(p.price); });
    $$('[data-p-instal]').forEach(function (el) { el.textContent = money(p.price / 4); });
    $$('[data-add-current]').forEach(function (el) { el.setAttribute('data-add', p.id); });
    var oldEl = $('[data-p-old]');
    if (oldEl && p.old) { oldEl.textContent = money(p.old); oldEl.hidden = false; }
    var crumb = $('[data-p-crumb]');
    if (crumb) {
      var key = pageKeyFor(p);
      crumb.textContent = CATEGORY_PAGES[key].title;
      crumb.href = 'category.html?c=' + key;
    }

    var main = $('[data-p-image]');
    main.src = sized(p.img, 1000);
    main.alt = p.name + ' من رساس';
    var thumb = $('[data-p-thumb]');
    thumb.src = sized(p.img, 200);

    $('[data-p-lead]').textContent = d ? d.lead : '';
    var desc = $('[data-p-desc]');
    desc.innerHTML = d
      ? d.body.map(function (t) { return '<p>' + esc(t) + '</p>'; }).join('')
      : '<p>[يُنقل وصف هذا العطر من صفحته في زد عند ربط المتجر.]</p>';

    // معلومات إضافية: النوع والحجم من بيانات زد، والرائحة من الوصف إن وُجد
    var spec = [['النوع', label(p)]];
    var size = sizeOf(p);
    if (size) spec.push(['الحجم', size + ' مل']);
    if (d && d.notes) spec = spec.concat(d.notes);
    spec.push(['الدفع', 'مدى، Apple Pay، Visa، Mastercard، تمارا، تابي، الدفع عند الاستلام']);
    $('[data-p-spec]').innerHTML = spec.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('');
    var sub = $('.pdp-sub');
    if (sub && size) sub.textContent = label(p) + ' · ' + size + ' مل';

    var openRev = $('[data-open-reviews]');
    if (openRev) openRev.addEventListener('click', function (e) {
      e.preventDefault();
      $('#t-rev').click();
      $('#t-rev').scrollIntoView({ block: 'center' });
    });

    // الكمية
    var qtyOut = $('[data-qty]');
    $$('[data-qty-step]').forEach(function (b) {
      b.addEventListener('click', function () {
        var v = Math.max(1, Math.min(20, parseInt(qtyOut.value, 10) + parseInt(b.getAttribute('data-qty-step'), 10)));
        qtyOut.value = v;
        qtyOut.textContent = v;
      });
    });

    // تبويبات التفاصيل
    var ptabs = $$('[data-ptab]');
    ptabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        ptabs.forEach(function (t) {
          var on = t === tab;
          t.setAttribute('aria-selected', String(on));
          $('#' + t.getAttribute('aria-controls')).hidden = !on;
        });
      });
    });

    // شريط الشراء الثابت يظهر بعد تجاوز زر الإضافة الأصلي
    var buybar = $('[data-buybar]'), mainBtn = $('[data-main-buy]');
    if (buybar && mainBtn) {
      var ticking = false;
      var checkBar = function () {
        buybar.classList.toggle('is-on', mainBtn.getBoundingClientRect().bottom < 0);
        ticking = false;
      };
      window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; requestAnimationFrame(checkBar); }
      }, { passive: true });
      checkBar();
    }
  }

  // ---------- صفحة التصنيف ----------
  var plp = $('[data-plp]');
  if (plp) {
    var params = new URLSearchParams(location.search);
    var key = CATEGORY_PAGES[params.get('c')] ? params.get('c') : 'all';
    var page = CATEGORY_PAGES[key];
    var base = PRODUCTS.filter(inPage(key));
    var PAGE_SIZE = 12, shown = PAGE_SIZE;
    var state = { sizes: [], price: 'all', sale: false, sort: 'featured' };

    document.title = page.title + ' | رساس للعطور';
    $$('[data-c-title]').forEach(function (el) { el.textContent = page.title; });
    $('[data-c-desc]').textContent = page.desc;
    $('[data-c-chips]').innerHTML = CATEGORY_ORDER.map(function (k) {
      var n = PRODUCTS.filter(inPage(k)).length;
      var cur = k === key ? ' aria-current="page"' : '';
      return '<a class="chip" href="category.html?c=' + k + '"' + cur + '>' + CATEGORY_PAGES[k].title + ' (' + n + ')</a>';
    }).join('');

    // خيارات الحجم من منتجات هذا القسم فقط
    var sizes = base.map(sizeOf).filter(Boolean).filter(function (v, i, a) { return a.indexOf(v) === i; }).sort(function (a, b) { return a - b; });
    var sizeBox = $('[data-f-sizes]');
    if (sizes.length) {
      sizeBox.innerHTML = sizes.map(function (v) {
        return '<label class="check"><input type="checkbox" value="' + v + '" data-f-size> ' + v + ' مل</label>';
      }).join('');
    } else {
      sizeBox.closest('fieldset').hidden = true;
    }
    if (!base.some(function (p) { return p.old; })) $('[data-f-sale]').closest('fieldset').hidden = true;

    function filtered() {
      var list = base.filter(function (p) {
        if (state.sizes.length && state.sizes.indexOf(sizeOf(p)) === -1) return false;
        if (state.sale && !p.old) return false;
        if (state.price !== 'all') {
          var r = state.price.split('-');
          if (p.price < +r[0] || p.price >= +r[1]) return false;
        }
        return true;
      });
      if (state.sort === 'price-asc') list.sort(function (a, b) { return a.price - b.price; });
      if (state.sort === 'price-desc') list.sort(function (a, b) { return b.price - a.price; });
      if (state.sort === 'name') list.sort(function (a, b) { return a.name.localeCompare(b.name, 'ar'); });
      return list;
    }

    var grid = $('[data-c-grid]'), more = $('[data-more]');
    function paint() {
      var list = filtered();
      grid.setAttribute('data-limit', shown);
      renderCollection(grid, null, list);
      $$('[data-c-count]').forEach(function (el) { el.textContent = list.length; });
      $$('[data-f-count]').forEach(function (el) { el.textContent = list.length; });
      $('[data-c-empty]').hidden = list.length > 0;
      var visible = Math.min(shown, list.length);
      $('[data-c-progress]').textContent = list.length ? 'تشاهد ' + visible + ' من ' + list.length + ' منتج' : '';
      more.parentNode.hidden = !list.length;
      more.hidden = visible >= list.length;
    }

    more.addEventListener('click', function () { shown += PAGE_SIZE; paint(); });
    $('[data-sort]').addEventListener('change', function (e) { state.sort = e.target.value; shown = PAGE_SIZE; paint(); });
    $('[data-filters]').addEventListener('change', function () {
      state.sizes = $$('[data-f-size]:checked').map(function (i) { return parseInt(i.value, 10); });
      state.price = ($('input[name="price"]:checked') || {}).value || 'all';
      state.sale = $('[data-f-sale]').checked;
      shown = PAGE_SIZE;
      paint();
    });
    $$('[data-f-reset]').forEach(function (b) {
      b.addEventListener('click', function () {
        $$('[data-f-size], [data-f-sale]').forEach(function (i) { i.checked = false; });
        $('input[name="price"][value="all"]').checked = true;
        state.sizes = []; state.price = 'all'; state.sale = false; shown = PAGE_SIZE;
        paint();
      });
    });

    // نافذة التصفية السفلية على الجوال
    var filters = $('[data-filters]'), openF = $('[data-open-filters]');
    function setFilters(open) {
      filters.classList.toggle('is-open', open);
      openF.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    }
    openF.addEventListener('click', function () { setFilters(true); });
    $$('[data-close-filters]').forEach(function (b) { b.addEventListener('click', function () { setFilters(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && filters.classList.contains('is-open')) setFilters(false); });

    paint();
  }

  // ---------- صفحة السلة ----------
  var cartPage = $('[data-cart-page]');
  if (cartPage) {
    // ?demo=1 يملأ السلة بمنتجات حقيقية للمعاينة فقط
    if (new URLSearchParams(location.search).get('demo') && !cartCount(cart)) {
      cart = { ac80e400: 1, '14e6c951': 2, f4328221: 1 };
      writeCart(cart);
      paintCount();
    }
    var TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>';

    function lines() {
      return Object.keys(cart).map(function (id) { return { p: byId(id), qty: cart[id] }; }).filter(function (l) { return l.p && l.qty > 0; });
    }
    function lineHtml(l) {
      var p = l.p, href = 'product.html?id=' + p.id;
      return '<li class="line">' +
        '<div class="line-main">' +
          '<a class="line-img" href="' + href + '" tabindex="-1" aria-hidden="true"><img src="' + sized(p.img, 300) + '" alt=""></a>' +
          '<div class="line-info"><small>' + label(p) + '</small><a href="' + href + '">' + esc(p.name) + '</a></div>' +
        '</div>' +
        '<span class="line-unit price"><span class="line-unit-label">سعر القطعة: </span>' + money(p.price) + '</span>' +
        '<div class="line-actions">' +
          '<div class="qty" role="group" aria-label="كمية ' + esc(p.name) + '">' +
            '<button type="button" aria-label="إنقاص الكمية" data-line-step="-1" data-id="' + p.id + '">−</button>' +
            '<output aria-live="polite">' + l.qty + '</output>' +
            '<button type="button" aria-label="زيادة الكمية" data-line-step="1" data-id="' + p.id + '">+</button>' +
          '</div>' +
          '<span class="line-total price">' + money(p.price * l.qty) + '</span>' +
          '<button class="line-remove" type="button" aria-label="احذف ' + esc(p.name) + ' من السلة" data-line-remove="' + p.id + '">' + TRASH + '</button>' +
        '</div>' +
      '</li>';
    }

    var upsell = $('[data-cart-upsell]');
    function paintCart() {
      var ls = lines();
      var count = ls.reduce(function (n, l) { return n + l.qty; }, 0);
      var total = ls.reduce(function (n, l) { return n + l.p.price * l.qty; }, 0);
      var empty = !ls.length;
      $('[data-cart-full]').hidden = empty;
      $('[data-cart-empty]').hidden = !empty;
      $('[data-cart-bar]').hidden = empty;
      $('[data-cart-heading-count]').textContent = empty ? '' : '(' + count + ')';
      $('[data-cart-list]').innerHTML = ls.map(lineHtml).join('');
      $$('[data-sum-count]').forEach(function (el) { el.textContent = count; });
      $$('[data-sum-subtotal], [data-sum-total]').forEach(function (el) { el.textContent = money(total); });
      $$('[data-sum-instal]').forEach(function (el) { el.textContent = money(total / 4); });

      // مقترحات: منتجات صغيرة السعر لرفع قيمة الطلب، أو الأكثر مبيعاً إن كانت السلة فارغة
      var list = empty
        ? COLLECTIONS.best()
        : PRODUCTS.filter(function (p) { return p.price <= 90 && !cart[p.id] && (inPage('oils')(p) || inPage('gifts')(p) || inPage('home')(p)); });
      $('[data-upsell-title]').textContent = empty ? 'الأكثر مبيعاً في رساس' : 'أضف لطلبك';
      renderCollection(upsell, null, list);
    }

    cartPage.addEventListener('click', function (e) {
      var step = e.target.closest('[data-line-step]');
      var rm = e.target.closest('[data-line-remove]');
      if (step) {
        var id = step.getAttribute('data-id');
        cart[id] = Math.max(1, Math.min(20, (cart[id] || 1) + parseInt(step.getAttribute('data-line-step'), 10)));
      } else if (rm) {
        var p = byId(rm.getAttribute('data-line-remove'));
        delete cart[rm.getAttribute('data-line-remove')];
        notify('حُذف ' + (p ? p.name : 'المنتج') + ' من السلة');
      } else if (e.target.closest('[data-add]')) {
        // الإضافة من المقترحات تمر بالمستمع العام أولاً، ثم نعيد الرسم
        setTimeout(paintCart, 0);
        return;
      } else {
        return;
      }
      writeCart(cart);
      paintCount();
      paintCart();
    });

    $$('[data-checkout]').forEach(function (b) {
      b.addEventListener('click', function () { notify('الدفع يتم في صفحة الدفع الخاصة بزد بعد ربط المتجر'); });
    });
    var coupon = $('[data-coupon]');
    coupon.addEventListener('submit', function (e) {
      e.preventDefault();
      var code = $('input', coupon).value.trim();
      $('[data-coupon-note]').textContent = code ? 'يُتحقق من الكود «' + code + '» في زد عند الدفع.' : 'اكتب كود الخصم أولاً.';
    });

    paintCart();
  }
})();
