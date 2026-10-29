/* Homepage sections, in the order they render. Each block maps to one section
   of the future Zid theme, and its keys map to that section's editor settings.
   Products are referenced by their exact Zid name; categories by name. */
window.RESAS_HOME = {
  hero: {
    autoplay_ms: 6000,
    slides: [
      {
        eyebrow: "عطور رساس منذ 2008",
        title: "توقيع الفخامة\nفي كل زجاجة",
        text: "عطور فرنسية وشرقية، وبخور وعود بتوقيع رساس.",
        from_product: "عطر 8 مل",
        cta: { label: "تسوّق الآن", category: "عطور" },
        products: ["ايدول 50 مل", "العود الملكي", "مارشميلو 50 مل"]
      },
      {
        eyebrow: "الأكثر مبيعاً",
        title: "روائح يعود\nإليها عملاؤنا",
        text: "عنبر، ومسك المدينة، وناتشورال عنبر.",
        cta: { label: "اكتشف عنبر", product: "عنبر" },
        products: ["ناتشورال عنبر", "عنبر", "مسك المدينة"]
      },
      {
        eyebrow: "البخور والعود",
        title: "أجود أنواع\nالعود والبخور",
        text: "عود كلمنتان وكمبودي، وبخور رساس ومعمولها.",
        cta: { label: "تسوّق البخور والعود", category: "البخور والعود" },
        products: ["عود كمبودي", "عود كلمنتان", "بخور رساس"]
      }
    ]
  },

  /* "جديد" badge on product cards: products added to Zid within this many days. */
  new_badge_days: 60,

  /* Categories under the banner, each in a small arched frame. The photo is a
     product's; the count is the category's in-stock products in Zid, its
     subcategories included. */
  arches: [
    { title: "الأكثر مبيعاً", product: "عنبر", category: "الاكثر مبيعاً" },
    { title: "عطور", product: "مارشميلو 50 مل", category: "عطور" },
    { title: "عطور خاصة", product: "ليدي روز", category: "عطور خاصة" },
    { title: "البخور والعود", product: "بخور رساس", category: "البخور والعود" },
    { title: "الهدايا الملكية", product: "مبخرة ملكيه", category: "الهدايا الملكية" },
    { title: "توزيعات", product: "عطر 8 مل", category: "توزيعات" },
    { title: "عطور جو ومفارش", product: "معطر جو رويال عود", category: "عطور جو ومفارش" },
    { title: "فواحات اعواد", product: "فواحة اعواد ورود", category: "فواحات اعواد" }
  ],

  /* Tabs over one product grid. A tab takes in-stock products from "category",
     or sorts all in-stock products: "new" (latest added) or "rating" (best rated).
     A tab with fewer than "limit" products is topped up with the best rated. */
  picks: {
    limit: 8,
    tabs: [
      { label: "الأكثر مبيعاً", category: "الاكثر مبيعاً" },
      { label: "وصل حديثاً", sort: "new" },
      { label: "الأعلى تقييماً", sort: "rating" }
    ]
  },

  /* Full-width sale band. "{max_discount}" and "{count}" come from the real sale
     prices in Zid. With nothing on sale it shows "fallback", whose paragraph is
     the store's "about" text from Zid. */
  story: {
    eyebrow: "عروض رساس",
    title: "وفّر حتى\n{max_discount}%",
    text: "تخفيضات على {count} مختارة من رساس، والأسعار شاملة الضريبة.",
    image_product: "مجموعة سجى | Saja perfumes",
    cta: { label: "تسوّق العروض", url: "/products?sale=1" },
    fallback: {
      eyebrow: "عطور رساس منذ 2008",
      title: "شغف بالعطر\nفي كل تفصيلة",
      image_product: "العود الملكي",
      cta: { label: "تسوّق عطور رساس", category: "عطور" }
    }
  },

  /* Topped up with the best-rated products when the category has fewer than "limit". */
  featured: {
    title: "منتجات مختارة",
    source_category: "منتجات مختارة",
    limit: 6
  },

  /* Two banners side by side; the first is narrower. "whatsapp": true links to the store's WhatsApp. */
  duo: [
    { eyebrow: "للمناسبات", title: "الهدايا\nالملكية", text: "مباخر وأطقم تليق بمن تحب.", product: "مبخرة ملكيه", cta: { label: "تسوّق الهدايا", category: "الهدايا الملكية" } },
    { eyebrow: "محتار في اختيار عطرك؟", title: "نساعدك تختار\nعطرك المناسب", text: "فريق رساس يرد عليك على واتساب، لك أو لهديتك.", product: "ناتشورال عنبر", cta: { label: "تحدّث معنا على واتساب", whatsapp: true } }
  ],

  /* Posts from the Zid blog (/blogs/المدونة). Each photo is a Resas product
     until the post has its own cover image. */
  posts: {
    title: "من مدونة رساس",
    more: { label: "كل المقالات", url: "/blogs/المدونة" },
    items: [
      { title: "كيف تختار العطر المناسب لك", text: "دليل يساعدك تختار عطراً يدوم ويعبّر عنك، حسب شخصيتك ونوع بشرتك والمناسبة.", url: "/blogs/كيفية-اختيار-العطر-المناسب-دليل-شامل-لاختيار-عطرك-المثالي", image_product: "مارشميلو 50 مل" },
      { title: "أنواع العطور الرجالية", text: "الشرقية والخشبية والمنعشة: كيف تختار منها ما يناسب شخصيتك ومناسباتك.", url: "/blogs/أنواع-العطور-الرجالية-دليل-شامل-لاختيار-أفضل-عطر-يناسبك", image_product: "ايدول 50 مل" },
      { title: "5 عطور نسائية من رساس", text: "عطور تجمع الأناقة والثبات العالي، تناسب كل الأذواق والمناسبات.", url: "/blogs/أفضل-عطور-نسائية-5-عطور-من-رساس-يجب-أن-تجربها", image_product: "مسك المدينة" }
    ]
  },

  /* Instagram strip: product photos until real posts are added (Zid has no Instagram feed built in). */
  instagram: {
    title: "تابعنا على إنستغرام",
    products: ["ليذر", "لاروزا", "عنبر عود", "مبخرة ملكية مع ربع تولة", "ليدي عنبر", "عود كمبودي"]
  }
};
