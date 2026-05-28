export type ProspectSector = {
  id: string;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
};

export type ProspectCategory = {
  id: string;
  label: string;
  sectorId: string;
  keywords: string[];
};

export const SECTORS: ProspectSector[] = [
  { id: "beauty",    label: "Beauty & Skincare",      color: "#a78bfa", bgColor: "rgba(167,139,250,0.08)",  borderColor: "rgba(167,139,250,0.3)" },
  { id: "wellness",  label: "Wellness & Salud",        color: "#34d399", bgColor: "rgba(52,211,153,0.08)",   borderColor: "rgba(52,211,153,0.3)"  },
  { id: "food",      label: "Food & Bebidas",          color: "#fbbf24", bgColor: "rgba(251,191,36,0.08)",   borderColor: "rgba(251,191,36,0.3)"  },
  { id: "fashion",   label: "Moda & Estilo",           color: "#fb7185", bgColor: "rgba(251,113,133,0.08)",  borderColor: "rgba(251,113,133,0.3)" },
  { id: "tech",      label: "Tech & Digital",          color: "#60a5fa", bgColor: "rgba(96,165,250,0.08)",   borderColor: "rgba(96,165,250,0.3)"  },
  { id: "home",      label: "Hogar & Lifestyle",       color: "#fb923c", bgColor: "rgba(251,146,60,0.08)",   borderColor: "rgba(251,146,60,0.3)"  },
  { id: "services",  label: "Servicios Creativos",     color: "#818cf8", bgColor: "rgba(129,140,248,0.08)",  borderColor: "rgba(129,140,248,0.3)" },
  { id: "sustain",   label: "Sustentabilidad",         color: "#4ade80", bgColor: "rgba(74,222,128,0.08)",   borderColor: "rgba(74,222,128,0.3)"  },
  { id: "mexico",    label: "Cultura México",          color: "#f87171", bgColor: "rgba(248,113,113,0.08)",  borderColor: "rgba(248,113,113,0.3)" },
  { id: "emerging",  label: "Nichos Emergentes",       color: "#22d3ee", bgColor: "rgba(34,211,238,0.08)",   borderColor: "rgba(34,211,238,0.3)"  },
];

export const CATEGORIES: ProspectCategory[] = [
  // ─── Beauty & Skincare ──────────────────────────────────────────────────
  { id: "clean-beauty",      label: "Skincare Clean Beauty",    sectorId: "beauty",   keywords: ["skincare", "clean beauty", "clean", "natural skin"] },
  { id: "dermocosmetics",    label: "Dermocosméticos",          sectorId: "beauty",   keywords: ["dermocosmética", "dermocos", "clínico", "acné", "despigmentante"] },
  { id: "k-beauty-mx",       label: "K-Beauty Mexicano",        sectorId: "beauty",   keywords: ["k-beauty", "kbeauty", "coreano", "japonés", "j-beauty"] },
  { id: "natural-makeup",    label: "Maquillaje Natural",       sectorId: "beauty",   keywords: ["maquillaje", "makeup", "labial", "blush", "pigmento"] },
  { id: "haircare",          label: "Haircare & Capilares",     sectorId: "beauty",   keywords: ["cabello", "shampoo", "capilar", "haircare", "acondicionador"] },
  { id: "fragrance",         label: "Fragancias & Perfumería",  sectorId: "beauty",   keywords: ["fragancia", "perfume", "aroma", "esencia", "olfativa"] },
  { id: "body-care",         label: "Cuidado Corporal",         sectorId: "beauty",   keywords: ["corporal", "cuerpo", "exfoliante", "loción", "body"] },
  { id: "sun-care",          label: "Sol & Fotoprotección",     sectorId: "beauty",   keywords: ["solar", "fps", "spf", "protector solar", "fotoprotección"] },
  { id: "natural-hygiene",   label: "Higiene Natural",          sectorId: "beauty",   keywords: ["higiene", "desodorante", "jabón", "sólido", "higiene natural"] },
  { id: "beauty-tech",       label: "Beauty Tech",              sectorId: "beauty",   keywords: ["beauty tech", "tecnología beauty", "app skincare", "diagnóstico"] },

  // ─── Wellness & Salud ───────────────────────────────────────────────────
  { id: "supplements",       label: "Suplementos Nutricionales",sectorId: "wellness", keywords: ["suplemento", "vitamina", "colágeno", "supplement", "nutraceutico"] },
  { id: "cbd",               label: "CBD & Cannabidiol",        sectorId: "wellness", keywords: ["cbd", "cannabis", "cannabidiol", "hemp", "cáñamo"] },
  { id: "adaptogens",        label: "Adaptógenos & Hongos",     sectorId: "wellness", keywords: ["adaptógeno", "hongo", "mushroom", "reishi", "ashwagandha"] },
  { id: "functional-med",    label: "Medicina Funcional",       sectorId: "wellness", keywords: ["funcional", "integrativa", "holística", "naturopatía"] },
  { id: "mental-health",     label: "Salud Mental Digital",     sectorId: "wellness", keywords: ["mental", "ansiedad", "mindfulness", "meditación", "terapia"] },
  { id: "yoga-movement",     label: "Yoga & Movimiento",        sectorId: "wellness", keywords: ["yoga", "pilates", "movimiento", "estudio", "clases"] },
  { id: "sleep",             label: "Sleep & Descanso",         sectorId: "wellness", keywords: ["sueño", "sleep", "descanso", "melatonina", "insomnio"] },
  { id: "sports-nutrition",  label: "Nutrición Deportiva",      sectorId: "wellness", keywords: ["deporte", "atletismo", "proteína", "rendimiento", "fitness"] },
  { id: "femtech",           label: "Femtech & Salud Femenina", sectorId: "wellness", keywords: ["femtech", "femenino", "ciclo", "hormonal", "menstruación"] },
  { id: "mental-wellness",   label: "Meditación & Mindfulness", sectorId: "wellness", keywords: ["meditación", "mindfulness", "respiración", "zen", "calma"] },

  // ─── Food & Bebidas ─────────────────────────────────────────────────────
  { id: "specialty-coffee",  label: "Café de Especialidad",     sectorId: "food",     keywords: ["café", "coffee", "especialidad", "barista", "tostado"] },
  { id: "mezcal",            label: "Mezcal & Destilados",      sectorId: "food",     keywords: ["mezcal", "tequila", "destilado", "agave", "pulque"] },
  { id: "craft-beer",        label: "Cervezas Artesanales",     sectorId: "food",     keywords: ["cerveza", "artesanal", "brewery", "craft beer", "ales"] },
  { id: "mexican-wine",      label: "Vinos Mexicanos",          sectorId: "food",     keywords: ["vino", "wine", "enología", "baja california", "cava"] },
  { id: "healthy-snacks",    label: "Snacks Saludables",        sectorId: "food",     keywords: ["snack", "botanero", "healthy", "proteico", "barra"] },
  { id: "plant-based",       label: "Plant-Based & Vegano",     sectorId: "food",     keywords: ["vegano", "plant based", "vegetariano", "sin lácteos", "alternativa vegetal"] },
  { id: "kombucha",          label: "Kombucha & Fermentados",   sectorId: "food",     keywords: ["kombucha", "kefir", "fermentado", "probiótico", "tepache"] },
  { id: "premium-chocolate", label: "Chocolates Premium",       sectorId: "food",     keywords: ["chocolate", "cacao", "bean to bar", "tableta", "oaxaca"] },
  { id: "superfoods",        label: "Superfoods",               sectorId: "food",     keywords: ["superfood", "chía", "espirulina", "moringa", "maca"] },
  { id: "gourmet",           label: "Gastronomía Gourmet",      sectorId: "food",     keywords: ["gourmet", "artesanal", "premium", "gastronomía", "chef"] },

  // ─── Moda & Estilo ──────────────────────────────────────────────────────
  { id: "sustainable-fashion",label: "Moda Sostenible",         sectorId: "fashion",  keywords: ["sostenible", "sustentable", "eco moda", "reciclado", "orgánico"] },
  { id: "streetwear-mx",     label: "Streetwear Mexicano",      sectorId: "fashion",  keywords: ["streetwear", "urban", "grafiti", "skate", "drop"] },
  { id: "activewear",        label: "Ropa Deportiva",           sectorId: "fashion",  keywords: ["deportiva", "activewear", "gym", "yoga wear", "running"] },
  { id: "jewelry",           label: "Joyería & Accesorios",     sectorId: "fashion",  keywords: ["joyería", "accesorios", "collar", "aretes", "bisutería"] },
  { id: "artisan-footwear",  label: "Calzado Artesanal",        sectorId: "fashion",  keywords: ["calzado", "zapatos", "sandalias", "artesanal", "cuero"] },
  { id: "inclusive-fashion", label: "Moda Inclusiva",           sectorId: "fashion",  keywords: ["tallas", "inclusiva", "plus size", "diversidad", "cuerpos"] },
  { id: "kids-fashion",      label: "Ropa Bebé & Niños",        sectorId: "fashion",  keywords: ["bebé", "niños", "infantil", "kids", "maternidad moda"] },
  { id: "artisan-textiles",  label: "Textiles Artesanales",     sectorId: "fashion",  keywords: ["textil", "tejido", "bordado", "artesanal", "telar"] },
  { id: "swimwear",          label: "Swimwear & Playa",         sectorId: "fashion",  keywords: ["swimwear", "traje de baño", "playa", "resort", "cover up"] },
  { id: "accessible-luxury", label: "Lujo Accesible",           sectorId: "fashion",  keywords: ["lujo", "premium", "luxury", "cápsula", "limited edition"] },

  // ─── Tech & Digital ─────────────────────────────────────────────────────
  { id: "saas-b2b",          label: "SaaS B2B México",          sectorId: "tech",     keywords: ["saas", "b2b", "software", "plataforma", "suscripción"] },
  { id: "fintech",           label: "Fintech & Neobancos",      sectorId: "tech",     keywords: ["fintech", "banco", "pagos", "crédito", "wallet"] },
  { id: "edtech",            label: "EdTech & E-learning",      sectorId: "tech",     keywords: ["educación", "cursos", "edtech", "elearning", "aprendizaje"] },
  { id: "healthtech",        label: "HealthTech",               sectorId: "tech",     keywords: ["healthtech", "salud digital", "telemedicina", "diagnóstico digital"] },
  { id: "logistics-tech",    label: "Logística & Última Milla", sectorId: "tech",     keywords: ["logística", "envíos", "fulfilment", "última milla", "delivery"] },
  { id: "ecom-enablers",     label: "E-commerce Enablers",      sectorId: "tech",     keywords: ["ecommerce", "tienda online", "shopify", "mercadolibre", "dtc"] },
  { id: "martech",           label: "MarTech & AdTech",         sectorId: "tech",     keywords: ["marketing", "publicidad", "ads", "martech", "crm"] },
  { id: "hrtech",            label: "HRTech & Talento",         sectorId: "tech",     keywords: ["rrhh", "talento", "reclutamiento", "hrtech", "nómina"] },
  { id: "proptech",          label: "PropTech & Inmobiliaria",  sectorId: "tech",     keywords: ["inmobiliaria", "proptech", "real estate", "renta", "compraventa"] },
  { id: "ai-automation",     label: "AI & Automatización",      sectorId: "tech",     keywords: ["inteligencia artificial", "ai", "automatización", "ml", "chatbot"] },

  // ─── Hogar & Lifestyle ──────────────────────────────────────────────────
  { id: "decor",             label: "Decoración & Interiorismo",sectorId: "home",     keywords: ["decoración", "interior", "hogar deco", "diseño", "ambientación"] },
  { id: "candles-aroma",     label: "Velas & Aromaterapia",     sectorId: "home",     keywords: ["vela", "aromaterapia", "aceite esencial", "difusor", "incienso"] },
  { id: "plants",            label: "Plantas & Jardinería",     sectorId: "home",     keywords: ["plantas", "jardín", "suculentas", "macetas", "botánica hogar"] },
  { id: "natural-cleaning",  label: "Limpieza Natural",         sectorId: "home",     keywords: ["limpieza", "biodegradable", "ecológico", "natural hogar"] },
  { id: "dtc-furniture",     label: "Muebles DTC",              sectorId: "home",     keywords: ["muebles", "furniture", "madera", "carpintería", "artesanal"] },
  { id: "home-textiles",     label: "Textiles Hogar",           sectorId: "home",     keywords: ["sábanas", "toallas", "cojines", "manteles", "tejido hogar"] },
  { id: "kitchen",           label: "Cocina & Utensilios",      sectorId: "home",     keywords: ["cocina", "utensilios", "barro", "cerámica", "cubiertos"] },
  { id: "art-craft",         label: "Arte & Artesanía",         sectorId: "home",     keywords: ["arte", "artesanía", "cerámica", "pintura", "escultura"] },
  { id: "maternity-baby",    label: "Bebés & Maternidad",       sectorId: "home",     keywords: ["bebé", "mamá", "maternidad", "lactancia", "embarazo"] },
  { id: "pet-care",          label: "Pet Care & Mascotas",      sectorId: "home",     keywords: ["mascotas", "pet", "perros", "gatos", "veterinaria"] },

  // ─── Servicios Creativos ────────────────────────────────────────────────
  { id: "creative-agencies", label: "Agencias Creativas",       sectorId: "services", keywords: ["agencia", "creativa", "diseño", "branding", "publicidad"] },
  { id: "branding",          label: "Branding & Consultoría",   sectorId: "services", keywords: ["branding", "consultoría", "estrategia", "marca", "identidad"] },
  { id: "photo-video",       label: "Fotografía & Contenido",   sectorId: "services", keywords: ["fotografía", "video", "contenido", "shoots", "producción"] },
  { id: "architecture",      label: "Arquitectura & Diseño",    sectorId: "services", keywords: ["arquitectura", "diseño interior", "interiorismo", "espacio"] },
  { id: "real-estate-dtc",   label: "Real Estate DTC",          sectorId: "services", keywords: ["inmueble", "departamento", "fraccionamiento", "desarrollo"] },
  { id: "boutique-tourism",  label: "Turismo Boutique",         sectorId: "services", keywords: ["turismo", "hotel", "experiencia", "viajes", "boutique"] },
  { id: "events",            label: "Eventos & Experiencias",   sectorId: "services", keywords: ["eventos", "activaciones", "pop up", "experiencia", "shows"] },
  { id: "coaching",          label: "Coaching Empresarial",     sectorId: "services", keywords: ["coaching", "mentor", "consultoría empresa", "crecimiento"] },
  { id: "legal",             label: "Legal & Compliance",       sectorId: "services", keywords: ["legal", "jurídico", "compliance", "despacho", "abogado"] },
  { id: "pr",                label: "Relaciones Públicas",      sectorId: "services", keywords: ["pr", "relaciones públicas", "comunicación", "prensa", "media"] },

  // ─── Sustentabilidad ────────────────────────────────────────────────────
  { id: "zero-waste",        label: "Zero Waste & Packaging",   sectorId: "sustain",  keywords: ["zero waste", "packaging", "biodegradable", "reutilizable", "sin plástico"] },
  { id: "circular-econ",     label: "Economía Circular",        sectorId: "sustain",  keywords: ["circular", "economía circular", "reciclaje", "upcycling"] },
  { id: "renewable-energy",  label: "Energía Renovable",        sectorId: "sustain",  keywords: ["solar", "eólica", "energía renovable", "paneles", "sustentable"] },
  { id: "green-mobility",    label: "Movilidad Sostenible",     sectorId: "sustain",  keywords: ["eléctrico", "bicicleta", "movilidad", "scooter", "transporte verde"] },
  { id: "regen-ag",          label: "Agricultura Regenerativa", sectorId: "sustain",  keywords: ["agricultura", "regenerativa", "orgánica", "permacultura", "agroecología"] },
  { id: "biomaterials",      label: "Biomateriales",            sectorId: "sustain",  keywords: ["biomaterial", "micelio", "algas", "bioplástico", "bio"] },
  { id: "organic-cert",      label: "Cosméticos Orgánicos Cert.",sectorId: "sustain", keywords: ["orgánico", "certificado", "ecocert", "cosmos", "usda organic"] },
  { id: "recycled-textiles", label: "Textiles Reciclados",      sectorId: "sustain",  keywords: ["reciclado", "upcycled", "segunda mano", "vintage", "residuos textiles"] },
  { id: "carbon-neutral",    label: "Carbon Neutral",           sectorId: "sustain",  keywords: ["carbon neutral", "huella", "co2", "compensación", "cero emisiones"] },
  { id: "b-corps",           label: "Impacto Social & B-Corps", sectorId: "sustain",  keywords: ["b corp", "impacto", "social", "comunidad", "responsabilidad"] },

  // ─── Cultura México ─────────────────────────────────────────────────────
  { id: "digital-crafts",    label: "Artesanías Digitalizadas", sectorId: "mexico",   keywords: ["artesanía", "indígena", "tradicional", "hand made", "artesano"] },
  { id: "herbolaria",        label: "Herbolaria & Medicina Trad.",sectorId: "mexico",  keywords: ["herbolaria", "plantas medicinales", "tradicional", "ancestral"] },
  { id: "regional-food",     label: "Gastronomía Regional MX",  sectorId: "mexico",   keywords: ["gastronomía regional", "oaxaca", "yucatán", "mexicana", "cocina tradicional"] },
  { id: "cultural-tourism",  label: "Turismo Cultural MX",      sectorId: "mexico",   keywords: ["turismo cultural", "patrimonio", "pueblos mágicos", "cultura mx"] },
  { id: "contemporary-art",  label: "Arte Contemporáneo MX",    sectorId: "mexico",   keywords: ["arte contemporáneo", "galería", "artista mx", "colectivo"] },
  { id: "music-entertain",   label: "Música & Entretenimiento",  sectorId: "mexico",   keywords: ["música", "entretenimiento", "artista", "sello", "festival"] },
  { id: "indigenous-id",     label: "Identidad Indígena",        sectorId: "mexico",   keywords: ["indígena", "maya", "zapoteca", "mixteca", "totonaca"] },
  { id: "mezcal-culture",    label: "Mezcal & Cultura Agavera",  sectorId: "mexico",   keywords: ["mezcal", "agave", "palenque", "maestro mezcalero"] },
  { id: "artisan-chocolate", label: "Chocolate Artesanal MX",    sectorId: "mexico",   keywords: ["chocolate artesanal", "cacao", "bean to bar", "tabasco"] },
  { id: "oaxacan-textiles",  label: "Textiles Oaxaqueños",       sectorId: "mexico",   keywords: ["textil zapoteco", "telar", "oaxaca", "bordado indígena"] },

  // ─── Nichos Emergentes ──────────────────────────────────────────────────
  { id: "creator-economy",   label: "Creator Economy",           sectorId: "emerging", keywords: ["creator", "influencer", "contenido", "youtube", "tiktok"] },
  { id: "communities",       label: "Comunidades & Memberships", sectorId: "emerging", keywords: ["comunidad", "membership", "suscripción", "club", "acceso"] },
  { id: "biohacking",        label: "Biohacking & Longevidad",   sectorId: "emerging", keywords: ["biohacking", "longevidad", "longevity", "optimización"] },
  { id: "anti-aging",        label: "Anti-aging & Neurocosmética",sectorId: "emerging",keywords: ["anti aging", "antiedad", "neuropéptidos", "retinol", "preciso"] },
  { id: "microbiome",        label: "Microbioma & Prebióticos",  sectorId: "emerging", keywords: ["microbioma", "probiótico", "prebiótico", "gut", "intestinal"] },
  { id: "precision-wellness",label: "Precision Wellness",        sectorId: "emerging", keywords: ["precisión", "personalizado", "dna", "genética", "biomarker"] },
  { id: "mens-grooming",     label: "Men's Grooming",            sectorId: "emerging", keywords: ["hombre", "masculino", "grooming", "barba", "aftershave"] },
  { id: "gen-z-beauty",      label: "Gen Z Beauty",              sectorId: "emerging", keywords: ["gen z", "generación z", "tiktok beauty", "viral beauty"] },
  { id: "omnichannel",       label: "Retail Omnicanal",          sectorId: "emerging", keywords: ["omnicanal", "retail", "tienda física", "online offline"] },
  { id: "d2c-native",        label: "D2C Native Brands",         sectorId: "emerging", keywords: ["d2c", "dtc", "directo", "nativo digital", "brand"] },
];
