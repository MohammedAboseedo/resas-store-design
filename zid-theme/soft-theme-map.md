# خريطة ثيم Soft في متجر رساس

قُرئت من صفحات المتجر العامة في 26 أكتوبر 2026. لوحة زد (محرر الثيم) لم تُقرأ بعد لأنها تحتاج تسجيل دخول.

## هوية الثيم

| البند | القيمة |
|---|---|
| اسم الثيم | Soft |
| إصدار الثيم | v2.55.0 (namespace `52119.4b0eb4ee-…v2026.01.08`) |
| معرّف الثيم | `f9f0914d-3c58-493b-bd83-260ed3cb4e82` |
| معرّف نسخة المتجر من الثيم | `4b0eb4ee-579d-4bfc-bf0b-685823a1f60f` |
| التقنية | قوالب زد القديمة: jQuery 3.6 و jQuery UI و Bootstrap RTL و Slick |
| مكوّنات Vitrin داخل الثيم | نعم. زد تحمّل `vitrin-kit` (v3.29.5) لعناصر مثل `#whatsapp_widget` |
| CSS مخصص | مسموح ومستخدم: `static.zid.store/static/4b0eb4ee…/styles.css` (12.8 KB) |
| JS مخصص | مسموح ومستخدم: `…/custom-scripts.js` (1.2 KB) |
| نسخة احتياطية | `zid-theme/backup-2026-10-26/` |
| الخط | Cairo من Google Fonts |
| ألوان الهوية في الإعدادات | primary `#262521`، secondary `#22211e` (رمادي داكن وليس ذهبياً) |

## الصفحة الرئيسية: الأقسام بالترتيب

كل قسم يحمل معرّفاً ثابتاً في `section-id` أو `id`. الأفضل استهدافه بهذا المعرّف بدل `nth-child`.

| # | نوع القسم | المعرّف | المحتوى الحالي |
|---|---|---|---|
| 1 | سلايدر صور (`section.ss`) | `df0d438a-b345-41db-a20e-65838c8b4a43` | البنر الرئيسي، صورتان |
| 2 | تصنيفات (`.home-categories-section`) | `4a10951e-63db-4f5f-b051-c1ce2a7d3c33` | 6 دوائر: توزيعات، عطور، البخور والعود، عطور جو، فواحات، عناية |
| 3 | منتجات (`.home-products-section`) | `8d250eae-5a8d-4c8a-befa-67f7ebea301a` | عطور كلاسيك 50 مل (8) |
| 4 | سلايدر صور | `c4ab66b0-4e18-4750-b83b-01ba88f6935b` | شريط «البخور والعود» الرفيع |
| 5 | منتجات | `22d7da3a-1c52-4096-b53d-2786a4077918` | البخور والعود (9) |
| 6 | تصنيفات | `ab1e0858-74b7-4b0b-b5d5-df01b44627a9` | 5 مربعات: زيتية، خاصة، أطفال، مستوحاة، الشعر |
| 7 | سلايدر صور | `7c743a60-946c-46b4-aeaf-64d5797c015c` | شريط «التوزيعات» |
| 8 | منتجات | `5ad035fa-0854-410e-8f83-9cc9d86b68a2` | توزيعات (10) |
| 9 | منتجات | `a5461952-4f19-4a03-858a-6270c84858f6` | عطور خاصة (19) |
| 10 | منتجات | `508d303b-2adf-42b0-aea6-3b3b71461f5b` | عطور كلاسيك 100 مل (20) |
| 11 | سلايدر صور | `2d533b6c-0df2-4b36-b700-7794cda68182` | بنرا تمارا وتابي |
| 12 | آراء العملاء | `bab059dc-abb8-477a-b2ed-2ec96d0fa81a` | 6 آراء |
| 13 | منتجات | `d6cde594-54dc-4d53-8b72-8422d3116049` | **قسم فارغ بلا عنوان ولا منتجات، يُحذف** |
| 14 | معرض صور (`.gallery-section`) | `f2ad7233-fcab-4495-b4b4-d13f0130e87e` | «لماذا رساس» |

أنواع الأقسام المتاحة في Soft حسب ما يظهر: سلايدر صور، تصنيفات، منتجات (من تصنيف)، آراء العملاء، معرض صور. لم يظهر قسم «نص وصورة» أو «فيديو»، ويُتحقق منها في محرر الثيم.

## خلل سلايدرات المنتجات

- كل قسم منتجات يشغّل سلايدره بسكربت داخلي على `DOMContentLoaded` عبر `$('[section-id=…] .products-slider').slick(…)`، وفقط إذا كان `window.screen.width >= 768`.
- عند فشل التشغيل يبقى `.products-slider` بـ `display:none`، فيظهر عنوان القسم وحده.
- تكرر الخلل في قراءة اليوم على شاشة ديسكتوب: كل السلايدرات الستة لم تعمل.
- تشغيلها يدوياً بعد التحميل نجح فوراً وبدون أخطاء. الاحتمال الأرجح أن مكوّنات Vitrin المحمّلة داخل الثيم تؤخّر أو تعيد بناء جزء من الصفحة.
- **الإصلاح الآمن في JS المخصص:** بعد `load`، شغّل `slick` على أي `.products-slider:not(.slick-initialized)` بنفس إعدادات الثيم عندما تكون الشاشة 768 فأكثر.

## العناصر المشتركة

- الهيدر: `.search-header`، `.header-logo`، `.image-logo`، `.search-input`، `.header-cart`، `.cart-badge`، `.account-area`، `.language-currency`، `.sm-search-icon`، `.icon-menu-top`.
- قائمة الجوال: `nav.slide-menu` و `.slide-menu__slider` و `.menu-link`.
- الفوتر: `.footer-store-section`، `.footer-about-us-div`، `.footer-about-us-links-div`، `.social-icons`، `.footer-companies`، `.footer-copyrights`.
- الحاوية: `body.rtl > .app > .main.app-content > .home`.

## بطاقة المنتج (في كل القوائم)

`.product-item` (و `.product-item-out-of-stock` للنافد) ← `.add-to-wishlist` ← `.box-1-1 .content img` ← `.product-card-bundle-offer` ← `.product-title` ← `.product-card-rating-wrapper` ← `.product-crd-spec` ← `.product-price.section-product-price` ← `.product-card-footer` ← `.product-card-add-to-cart` أو `.btn-product-card-out-of-stock` أو `.btn-product-card-select-variant`.

## صفحة المنتج

| العنصر | المحدد |
|---|---|
| الصور | `.product-images-carousel`، `.product-images-carousel-thumbs` |
| العنوان | `h1` داخل `.col-product-info` |
| الوصف المختصر | `.text-short-description` |
| السعر | `h2.product-formatted-price` (والقديم `.product-formatted-price-old`) |
| تمارا | `tamara-widget.tamara-product-widget` |
| تابي | `div.tabby-product-widget` |
| رقم المنتج | `.div-product-sku` |
| الوزن | `.div-product-weight` |
| الكمية | `select#product-quantity.select-quantity` (name=`quantity`، من 1 إلى 100) |
| زر الإضافة | `button.btn.btn-add-to-cart` يستدعي `productAddToCart()` |
| المفضلة | `.add-to-wishlist` |
| الوصف | `section#product-description` و `.description-paragrah` |
| التقييمات | `.review-details`، `.rating-average`، `.card-review`، `.add-review-btn` |

## صفحة التصنيف

`.breadcrumb-section` ← `.category-page-slider` (التصنيفات الفرعية بنفس مكوّن `.categories-slider` و `.cat-col`) ← `.products-container` ← `.products-filter` و `.btn-filter` و `.form-products-filter` ← `.products-list` و `.prod-col` و `.product-item`.

## صفحة السلة

`.cart-view` ← `.cart-products-with-totals` ← `.section-cart-products` (`col-1` إلى `col-4`) ← `.cart-gift-card` (خيار الإهداء موجود) ← `.cart-totals-div` ← `.coupon-form` و `.send-coupon` ← `.cart-empty`.

## دوال جاهزة في الصفحة يمكن استخدامها في JS المخصص

`zid.cart.addProduct(...)`، `addToCart(product_id, quantity, cb)`، `fetchCart()`، `getCartTotal()`، `setCartTotalAndBadge()`، `showShoppingCart()`، و `window.cart_products`.

## إعدادات المتجر المقروءة (`__vitrinStoreSettings`)

| الإعداد | الحالة | أثره على التصميم |
|---|---|---|
| شريط الإعلانات `announcement_bar` | موجود، نصه فارغ، يظهر في الرئيسية فقط | الشريط العلوي يُضبط من اللوحة بدون كود |
| التصفية في التصنيفات `has_products_filtration` | **غير مفعّلة** | تُفعّل من اللوحة قبل تصميم نافذة التصفية |
| الحقول المخصصة `is_metafields_enabled` | مفعّلة | بطاقة «رائحة العطر» تُبنى من حقول مخصصة بدل لصقها في الوصف |
| الترتيب الافتراضي | `-is_infinite,-quantity` (حسب الكمية في المخزون) | يُغيّر إلى الأكثر مبيعاً إن أتاحته اللوحة |
| ودجت تمارا / تابي | مفعّلتان | يمكن إيقاف واحدة أو الاثنتين من اللوحة |
| شارات التوصيل السريع والاستلام | معطّلتان | خيار جاهز لوعد التوصيل |
| ملصق «كمية محدودة» | معطّل | خيار جاهز |
| التقييمات والأسئلة والمفضلة | مفعّلة | |

## السكربتات المضافة من تطبيقات زد

GetButton (واتساب)، Hotjar، Snapchat، Google Analytics، Google Tag Manager، Meta Pixel، TikTok Pixel، OptimizeApp. أي تنظيف للتتبع يكون من تطبيقات زد ومن GTM، بالتنسيق مع جلسة التسويق.

## القائمة الرئيسية

الصفحة الرئيسية، جميع المنتجات، عطور (وتحتها: عطور خاصة، كلاسيك 100 مل، كلاسيك 30 مل، كلاسيك 50 مل، مستوحاه، الشعر، أطفال، زيتية، أطقم العطور، شرقية، فرنسيه وشرقيه، دهن تولة)، البخور والعود، فواحات اعواد، عطور جو ومفارش، توزيعات، الهدايا الملكية، جميع التصنيفات.

## ما ينقص من القراءة

- محرر الثيم في لوحة زد: إعدادات كل قسم، والأقسام المتاحة للإضافة، وخيارات الألوان والخطوط في Soft.
- يحتاج تسجيل دخول إلى لوحة زد في بروفايل كروم Resas Perfume.
- اتصال `resas-zid` يرد بخطأ 401 (غير مصرّح)، فلا يمكن القراءة منه حالياً.
