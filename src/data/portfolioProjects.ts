export interface Participation {
  icon: "eye" | "bar" | "star";
  text: {
    es: string;
    en: string;
  };
}

export interface ProjectImage {
  src: string;
  alt: string;
  aspect?: "wide" | "tall" | "square";
}

export interface PortfolioProject {
  slug: string;
  title: string;
  folder: string;
  subtitle: {
    es: string;
    en: string;
  };
  industry: {
    es: string;
    en: string;
  };
  role: {
    es: string;
    en: string;
  };
  description: {
    es: string;
    en: string;
  };
  strategy?: {
    es: string;
    en: string;
  };
  previewImages: [string, string, string];
  images: ProjectImage[];
  participation?: Participation[];
}

export const portfolioProjects: Record<string, PortfolioProject> = {
  miiles: {
    slug: "miiles",
    title: "Miiles AI",
    folder: "Miiles",
    subtitle: {
      es: "Plataforma de gestión de talento y reclutamiento inteligente.",
      en: "Smart talent management and recruitment platform.",
    },
    industry: {
      es: "Inteligencia Artificial y Consultoría de Ventas",
      en: "Artificial Intelligence & Sales Consulting",
    },
    role: {
      es: "Embudos de Ventas, Estrategia de Identidad de Marca y Automatización con IA",
      en: "Sales Funnels, Brand Identity Strategy & AI Automation",
    },
    description: {
      es: "Lideramos la creación de esta marca en la frontera de la tecnología, enfocándonos en el desarrollo de soluciones de venta escalables mediante Vibecoding y prospección en frío (Cold Outreach). Diseñamos una arquitectura de embudos de alta conversión apoyada por agentes de IA conversacional que gestionan la interacción inicial con el prospecto.\n\nNuestro rol fue integral: desde el branding completo y las relaciones públicas hasta la implementación de una red de afiliados para expansión en marketplaces. Aplicamos estrategias de crecimiento orgánico y pagado mediante CTAs estratégicos, eventos de activación y campañas con influencers, logrando posicionar a Miiles como una solución innovadora en el mercado de la automatización comercial.",
      en: "We led the creation of this brand at the frontier of technology, focusing on developing scalable sales solutions through Vibecoding and Cold Outreach. We designed a high-conversion funnel architecture supported by conversational AI agents that manage the initial interaction with prospects.\n\nOur role was comprehensive: from complete branding and public relations to implementing an affiliate network for marketplace expansion. We applied organic and paid growth strategies through strategic CTAs, activation events, and influencer campaigns, successfully positioning Miiles as an innovative solution in the commercial automation market.",
    },
    strategy: {
      es: "Para escalar en el sector tecnológico B2B, la credibilidad lo es todo. La estrategia se centró en la creación de un sistema de \"Autoridad Predictiva\". Diseñamos un embudo de retención que intercepta el interés inicial en los agentes conversacionales y los educa sobre el potencial operativo, lo que redujo el ciclo promedio de venta. El diseño oscuro (dark mode) se aplicó transversalmente para evocar disrupción y ciencia.",
      en: "To scale in the B2B tech sector, credibility is everything. The strategy focused on creating a \"Predictive Authority\" system. We designed a retention funnel that intercepts initial interest in conversational agents and educates on operational potential, which reduced the average sales cycle. The dark mode design was applied across the board to evoke disruption and science.",
    },
    previewImages: [
      "portada-1.webp",
      "about-miiles.webp",
      "mockup-app-web.webp",
    ],
    images: [
      { src: "portada-1.webp", alt: "Miiles — Cover", aspect: "wide" },
      { src: "about-miiles.webp", alt: "Miiles — About", aspect: "wide" },
      { src: "logo.webp", alt: "Miiles — Logo", aspect: "wide" },
      { src: "isotipo.webp", alt: "Miiles — Isotipo", aspect: "wide" },
      { src: "elementos-visuales.webp", alt: "Miiles — Visual Elements", aspect: "wide" },
      { src: "iconos.webp", alt: "Miiles — Iconography", aspect: "wide" },
      { src: "mockup-app-web.webp", alt: "Miiles — Web App Mockup", aspect: "wide" },
      { src: "mockup-app-web-2.webp", alt: "Miiles — Web App Mockup 2", aspect: "wide" },
      { src: "elementos-visuales-y-mockups-de-la-app-web.webp", alt: "Miiles — Visual Elements & Mockups", aspect: "wide" },
    ],
    participation: [
      { icon: "bar", text: { es: "Embudos de Ventas", en: "Sales Funnels" } },
      { icon: "star", text: { es: "Estrategia de Identidad de Marca", en: "Brand Identity Strategy" } },
      { icon: "eye", text: { es: "Automatización con IA", en: "AI Automation" } },
    ],
  },
  erpxtender: {
    slug: "erpxtender",
    title: "ERPXtender",
    folder: "Erpxtender",
    subtitle: {
      es: "Consultoría de marca y diseño de interfaz para ERP de alto rendimiento.",
      en: "Brand consulting and interface design for high-performance ERP.",
    },
    industry: {
      es: "ERP y Automatización B2B",
      en: "ERP & B2B Automation",
    },
    role: {
      es: "Embudo de Ventas y Estrategia de Identidad de Marca",
      en: "Sales Funnel & Brand Identity Strategy",
    },
    description: {
      es: "Lideramos la transformación visual y estratégica de la marca con el objetivo de posicionarla como un referente de innovación en la rígida industria de los ERP. Desarrollamos una identidad corporativa desde cero, apostando por un diseño minimalista y disruptivo que comunica flexibilidad y modernidad. En el apartado digital, participamos en el diseño de una interfaz web centrada en la experiencia de usuario (UX) y ejecutamos una estrategia de Marketing de Contenidos multicanal. Fuimos responsables de la creación de activos visuales de alto impacto (display, posts y publicidad pagada) diseñados específicamente para alimentar un embudo de ventas que redujera la fricción en el ciclo de decisión de compra de clientes corporativos.",
      en: "We led the visual and strategic transformation of the brand with the goal of positioning it as a benchmark of innovation in the rigid ERP industry. We developed a corporate identity from scratch, betting on a minimalist and disruptive design that communicates flexibility and modernity. On the digital side, we participated in designing a user experience (UX)-centered web interface and executed a multichannel Content Marketing strategy. We were responsible for creating high-impact visual assets (display, posts, and paid advertising) specifically designed to feed a sales funnel that reduces friction in the corporate client purchase decision cycle.",
    },
    strategy: {
      es: "La industria del software ERP suele sufrir de comunicación monótona y extremadamente técnica. Nuestro planteamiento estratégico fue \"Decodificar la Complejidad\". Reestructuramos el embudo de ventas digital reemplazando largos textos por activos visuales que demuestran el valor de forma instintiva. Cada campaña de display (B2B) dirigía hacia landing pages hiper-enfocadas que capitalizaban el dolor de los sistemas obsoletos.",
      en: "The ERP software industry often suffers from monotonous and overly technical communication. Our strategic approach was to \"Decode Complexity\". We restructured the digital sales funnel by replacing long texts with visual assets that intuitively demonstrate value. Every B2B display campaign led to hyper-focused landing pages capitalizing on the pain of obsolete systems.",
    },
    previewImages: [
      "portada-1.webp",
      "erp-1.webp",
      "publicidad-exterior.webp",
    ],
    images: [
      { src: "portada-1.webp", alt: "ERPXtender — Cover", aspect: "wide" },
      { src: "logo.webp", alt: "ERPXtender — Logo", aspect: "wide" },
      { src: "erp-1.webp", alt: "ERPXtender — Brand", aspect: "wide" },
      { src: "frase-publicitaria-1.webp", alt: "ERPXtender — Tagline", aspect: "wide" },
      { src: "elementos-graficos-para-web-y-redes-1.webp", alt: "ERPXtender — Web & Social Assets 1", aspect: "wide" },
      { src: "elementos-graficos-para-web-y-redes-2.webp", alt: "ERPXtender — Web & Social Assets 2", aspect: "wide" },
      { src: "elementos-graficos-para-web-y-redes-3.webp", alt: "ERPXtender — Web & Social Assets 3", aspect: "wide" },
      { src: "publicidad-exterior.webp", alt: "ERPXtender — Outdoor Advertising", aspect: "wide" },
    ],
    participation: [
      { icon: "bar", text: { es: "Embudos de Ventas", en: "Sales Funnels" } },
      { icon: "star", text: { es: "Estrategia de Identidad de Marca", en: "Brand Identity Strategy" } },
    ],
  },
  original: {
    slug: "original",
    title: "Original — Salon de Barbier",
    folder: "Original",
    subtitle: {
      es: "Dirección de arte y diseño web orientado a reservas y conversión.",
      en: "Art direction and web design oriented towards booking and conversion.",
    },
    industry: {
      es: "Barbería y Cuidado Personal Masculino",
      en: "Barbershop & Men's Grooming",
    },
    role: {
      es: "Embudos de Ventas y Estrategia de Identidad de Marca",
      en: "Sales Funnels & Brand Identity Strategy",
    },
    description: {
      es: "Conceptualizamos y ejecutamos una estrategia de marca diseñada para romper la saturación del mercado de barberías, creando una identidad visual única con su respectivo manual de directrices. Desarrollamos una plataforma web orientada 100% a resultados, implementando un layout de embudo (funnel) optimizado que guía al usuario desde el descubrimiento hasta la reserva automática mediante un sistema integrado. Para potenciar la conversión, realizamos la edición fotográfica profesional de los servicios, utilizando el impacto visual y la prueba social como motores principales de atracción de nuevos clientes y fidelización de los actuales.",
      en: "We conceptualized and executed a brand strategy designed to break through the saturated barbershop market, creating a unique visual identity with its respective guidelines manual. We developed a results-oriented web platform, implementing an optimized funnel layout that guides the user from discovery to automatic booking through an integrated system. To boost conversion, we performed professional photo editing of services, using visual impact and social proof as the main drivers for attracting new clients and retaining existing ones.",
    },
    strategy: {
      es: "El gran reto fue posicionar a Original lejos del estereotipo clásico de barbería de barrio. Se conceptualizó la marca como un punto de encuentro premium para el «cuidado personal integral». A nivel de infraestructura (funnel), se diagramó un flujo que elimina fricciones: en lugar de obligar al usuario a leer menús largos, diseñamos un proceso visual donde en un máximo de 3 clics logran el agendamiento y pago, optimizando así el Customer Lifetime Value (LTV).",
      en: "The main challenge was positioning Original far from the classic neighborhood barbershop stereotype. The brand was conceptualized as a premium meeting point for «comprehensive personal care». At the infrastructure level (funnel), a frictionless flow was diagrammed: instead of forcing the user to read long menus, we designed a visual process where within a maximum of 3 clicks they achieve booking and payment, optimizing Customer Lifetime Value (LTV).",
    },
    previewImages: [
      "portada-1.webp",
      "original-1.webp",
      "original-2.webp",
    ],
    images: [
      { src: "portada-1.webp", alt: "Original — Cover", aspect: "wide" },
      { src: "isotipo.webp", alt: "Original — Isotipo", aspect: "wide" },
      { src: "fotos-instagram.webp", alt: "Original — Instagram", aspect: "wide" },
      { src: "landing-page-1.webp", alt: "Original — Landing Page 1", aspect: "wide" },
      { src: "landing-page-2.webp", alt: "Original — Landing Page 2", aspect: "wide" },
    ],
    participation: [
      { icon: "bar", text: { es: "Embudos de Ventas", en: "Sales Funnels" } },
      { icon: "star", text: { es: "Estrategia de Identidad de Marca", en: "Brand Identity Strategy" } },
    ],
  },
  "mar-vic": {
    slug: "mar-vic",
    title: "Mar & Vic",
    folder: "Mar-Vic",
    subtitle: {
      es: "Branding sofisticado y ecosistema e-commerce para diseño de interiores.",
      en: "Sophisticated branding and e-commerce ecosystem for interior design.",
    },
    industry: {
      es: "Muebles, Retail y Diseño de Interiores",
      en: "Furniture, Retail & Interior Design",
    },
    role: {
      es: "Embudos de Ventas, Estrategia de Identidad de Marca y Automatización con IA",
      en: "Sales Funnels, Brand Identity Strategy & AI Automation",
    },
    description: {
      es: "Fuimos los arquitectos del despliegue digital de la marca, desde el desarrollo del concepto de negocio hasta la creación de la tienda oficial en Shopify. Implementamos una infraestructura de automatización de ventas que incluye flujos inteligentes de Email Marketing y sistemas de nutrición de leads (lead nurturing). Para escalar el alcance del negocio sin aumentar costos fijos, diseñamos un programa de Marketing de Afiliados para captar una fuerza de ventas externa y posicionar productos en diversos marketplaces. Nuestra labor incluyó la dirección de arte fotográfico, la creación del manual de identidad visual y la gestión de merchandising para asegurar una experiencia de cliente coherente y premium.",
      en: "We were the architects of the brand's digital deployment, from developing the business concept to creating the official Shopify store. We implemented a sales automation infrastructure that includes intelligent Email Marketing flows and lead nurturing systems. To scale the business reach without increasing fixed costs, we designed an Affiliate Marketing program to capture an external sales force and position products in various marketplaces. Our work included photographic art direction, creating the visual identity manual, and merchandising management to ensure a coherent and premium customer experience.",
    },
    strategy: {
      es: "La planificación estratégica de Mar & Vic radicó en transformar una tienda en línea común en un ecosistema auto-sustentable. Diseñamos la arquitectura y el mapeo de comportamiento de datos en Shopify para detonar secuencias automáticas de compra (abandonos de carrito dinámicos y cross-selling inteligente) sustentados por IA. Visualmente, el manual de uso de marca estandarizó el color y tipografías para inspirar «arquitectura atemporal», vital para el nicho de interiorismo.",
      en: "The strategic planning for Mar & Vic lay in transforming a regular online store into a self-sustaining ecosystem. We designed the architecture and data mapping in Shopify to trigger automatic purchasing sequences (dynamic abandoned carts and intelligent cross-selling) backed by AI. Visually, the brand manual standardized the color and typography to inspire «timeless architecture», a vital point for the interior design niche.",
    },
    previewImages: [
      "portada-1.webp",
      "mar-1.webp",
      "mar-2.webp",
    ],
    images: [
      { src: "portada-1.webp", alt: "Mar & Vic — Cover", aspect: "wide" },
      { src: "logotipo.webp", alt: "Mar & Vic — Logo", aspect: "wide" },
      { src: "isotipo.webp", alt: "Mar & Vic — Isotipo", aspect: "wide" },
      { src: "frase-publicitaria-1.webp", alt: "Mar & Vic — Tagline 1", aspect: "wide" },
      { src: "frase-publicitaria-2.webp", alt: "Mar & Vic — Tagline 2", aspect: "wide" },
      { src: "fotos-publicitarias.webp", alt: "Mar & Vic — Photography", aspect: "wide" },
    ],
    participation: [
      { icon: "bar", text: { es: "Embudos de Ventas", en: "Sales Funnels" } },
      { icon: "star", text: { es: "Estrategia de Identidad de Marca", en: "Brand Identity Strategy" } },
      { icon: "eye", text: { es: "Automatización con IA", en: "AI Automation" } },
    ],
  },
  "naabi-kanabi": {
    slug: "naabi-kanabi",
    title: "Naabi Kanabi",
    folder: "Naabi-Kanabi",
    subtitle: {
      es: "Diseño de experiencia y branding para productos de bienestar natural.",
      en: "Experience design and branding for natural wellness products.",
    },
    industry: {
      es: "Skincare y Dermocosmética",
      en: "Skincare & Dermocosmetics",
    },
    role: {
      es: "Embudos de Ventas, Estrategia de Identidad de Marca y Automatización con IA",
      en: "Sales Funnels, Brand Identity Strategy & AI Automation",
    },
    description: {
      es: "Ejecutamos el lanzamiento integral de la marca bajo una visión de Growth Marketing. Desarrollamos un ecosistema de ventas en Shopify conectado a embudos de conversión en redes sociales altamente optimizados. Fuimos pioneros en la implementación de Agentes de IA Conversacional, diseñando una IA experta en cuidado de la piel que automatiza la consulta técnica y acelera el cierre de ventas. La estrategia de marca se potenció con una narrativa visual sólida (Manual de Identidad), campañas de Contenido Generado por el Usuario (UGC) y estrategias de Influencer Marketing. Además, coordinamos activaciones en puntos de venta y diseño de merchandising, logrando una conexión profunda entre el canal físico y el digital.",
      en: "We executed the comprehensive brand launch under a Growth Marketing vision. We developed a Shopify sales ecosystem connected to highly optimized social media conversion funnels. We pioneered the implementation of Conversational AI Agents, designing a skincare-expert AI that automates technical consultation and accelerates sales closure. The brand strategy was enhanced with a solid visual narrative (Identity Manual), User-Generated Content (UGC) campaigns, and Influencer Marketing strategies. Additionally, we coordinated point-of-sale activations and merchandising design, achieving a deep connection between the physical and digital channels.",
    },
    strategy: {
      es: "Para el mercado dermocosmético, la confianza es lo primero. Mapeamos la arquitectura de la IA conversacional instruyéndola con glosarios médicos para proveer diagnósticos previos certeros que terminan en sugerencias de producto automatizadas. Esto redujo un 70% los tiempos de respuesta humanos y derivó en conversiones automáticas durante la madrugada. Todo envuelto en una estrategia estética minimalista y 'clean' para reflejar pureza y ciencia.",
      en: "In the dermocosmetic market, trust comes first. We mapped the conversational AI architecture by instructing it with medical glossaries to provide accurate pre-diagnoses that end in automated product suggestions. This reduced human response times by 70% and led to automatic conversions overnight. All wrapped in a minimalist and 'clean' aesthetic strategy to reflect purity and science.",
    },
    previewImages: [
      "portada-1.webp",
      "naabi-1.webp",
      "naabi-2.webp",
    ],
    images: [
      { src: "portada-1.webp", alt: "Naabi Kanabi — Cover", aspect: "wide" },
      { src: "logotipo.webp", alt: "Naabi Kanabi — Logo", aspect: "wide" },
      { src: "logo.webp", alt: "Naabi Kanabi — Logo Alt", aspect: "wide" },
      { src: "iconos.webp", alt: "Naabi Kanabi — Iconography", aspect: "wide" },
      { src: "productos.webp", alt: "Naabi Kanabi — Products", aspect: "wide" },
      { src: "fotos-publicidad.webp", alt: "Naabi Kanabi — Advertising", aspect: "wide" },
      { src: "portada-2.webp", alt: "Naabi Kanabi — Cover 2", aspect: "wide" },
      { src: "publicidad-de-exterior.webp", alt: "Naabi Kanabi — Outdoor Advertising", aspect: "wide" },
      { src: "tarejta-de-presentacion.webp", alt: "Naabi Kanabi — Business Card", aspect: "wide" },
    ],
    participation: [
      { icon: "bar", text: { es: "Embudos de Ventas", en: "Sales Funnels" } },
      { icon: "star", text: { es: "Estrategia de Identidad de Marca", en: "Brand Identity Strategy" } },
      { icon: "eye", text: { es: "Automatización con IA", en: "AI Automation" } },
    ],
  },
  jambu: {
    slug: "jambu",
    title: "Jambú",
    folder: "Jambu",
    subtitle: {
      es: "Rediseño de identidad y packaging inspirado en la riqueza natural.",
      en: "Identity and packaging redesign inspired by natural abundance.",
    },
    industry: {
      es: "Alimentos y Consumo Masivo",
      en: "Food & Consumer Goods",
    },
    role: {
      es: "Estrategia de Identidad de Marca",
      en: "Brand Identity Strategy",
    },
    description: {
      es: "En Jambú, nuestro enfoque principal fue la cimentación de una marca con alta escalabilidad en el sector alimentario. Desarrollamos el ecosistema de marca completo, desde el concepto visual hasta la entrega de manuales de identidad técnica detallados. Nuestro trabajo garantizó que la marca posea una coherencia visual absoluta en todos sus puntos de contacto, permitiendo una transición fluida entre el empaque físico (packaging) y la presencia digital. El resultado fue una identidad corporativa profesional, sólida y lista para competir en mercados de consumo masivo, asegurando que cada aplicación gráfica mantenga la integridad de la visión original del negocio.",
      en: "At Jambú, our main focus was building a highly scalable brand in the food sector. We developed the complete brand ecosystem, from the visual concept to delivering detailed technical identity manuals. Our work ensured the brand maintains absolute visual coherence across all touchpoints, allowing a fluid transition between physical packaging and digital presence. The result was a professional, solid corporate identity ready to compete in consumer goods markets, ensuring every graphic application maintains the integrity of the original business vision.",
    },
    strategy: {
      es: "Sabíamos que el empaque sería su mayor vendedor silencioso. La estrategia metodológica se basó en el 'Shelf-Impact' (Impacto en estante). Se planificó un marco de identidad altamente adaptable y atrevido, jugando con escalas tipográficas masivas para que la silueta del producto fuera reconocible a 5 metros de distancia. Documentamos los lineamientos de materialidad e impresión para su escalamiento industrial sin pérdida de fidelidad a los colores primarios.",
      en: "We knew the packaging would be its greatest silent seller. The methodological strategy was based on 'Shelf-Impact'. We planned a highly adaptable and bold identity framework, playing with massive typographic scales so the product silhouette would be recognizable from 5 meters away. We documented materiality and print guidelines for its industrial scale-up without losing fidelity to its primary colors.",
    },
    previewImages: [
      "portada-1.webp",
      "packaging.webp",
      "mockup-del-producto.webp",
    ],
    images: [
      { src: "portada-1.webp", alt: "Jambú — Cover", aspect: "wide" },
      { src: "logo.webp", alt: "Jambú — Logo", aspect: "wide" },
      { src: "logo-2.webp", alt: "Jambú — Logo Alt", aspect: "wide" },
      { src: "packaging.webp", alt: "Jambú — Packaging", aspect: "wide" },
      { src: "mockup-del-producto.webp", alt: "Jambú — Product Mockup", aspect: "wide" },
      { src: "mockup-con-frase-publicitaria.webp", alt: "Jambú — Tagline Mockup", aspect: "wide" },
      { src: "mockup-de-imagen-publicitaria.webp", alt: "Jambú — Advertising Mockup", aspect: "wide" },
      { src: "mockup-totebag.webp", alt: "Jambú — Tote Bag Mockup", aspect: "wide" },
      { src: "carteles-publcidad-de-exterior.webp", alt: "Jambú — Outdoor Posters", aspect: "wide" },
      { src: "publicidad-exterior.webp", alt: "Jambú — Outdoor Advertising", aspect: "wide" },
    ],
    participation: [
      { icon: "star", text: { es: "Estrategia de Identidad de Marca", en: "Brand Identity Strategy" } },
    ],
  },
  tularosa: {
    slug: "tularosa",
    title: "Tularosa",
    folder: "Tularosa",
    subtitle: {
      es: "Estrategia visual y comunicación para hospitality y gastronomía.",
      en: "Visual strategy and communication for hospitality and gastronomy.",
    },
    industry: {
      es: "Gastronomía y Hospitalidad",
      en: "Gastronomy & Hospitality",
    },
    role: {
      es: "Embudos de Ventas y Estrategia de Identidad de Marca",
      en: "Sales Funnels & Brand Identity Strategy",
    },
    description: {
      es: "Para Tularosa, el objetivo fue llevar un negocio gastronómico al siguiente nivel de digitalización mediante la creación de una plataforma web optimizada para resultados. Diseñamos un layout especializado en embudos de venta (funnel design) que integra un sistema de reservaciones estratégico, reduciendo la fricción en el proceso de conversión del usuario. Además de refinar la base visual de la marca mediante la creación de activos gráficos y manuales de identidad, realizamos la dirección y edición fotográfica profesional de alimentos. Este enfoque en el \"apetito visual\" fue clave para diferenciar la propuesta de Tularosa en un mercado altamente competitivo, logrando una presencia online que no solo es estética, sino funcional y orientada a la generación de reservas.",
      en: "For Tularosa, the goal was to take a gastronomic business to the next level of digitalization by creating a results-optimized web platform. We designed a specialized funnel layout that integrates a strategic reservation system, reducing friction in the user conversion process. Beyond refining the brand's visual foundation through creating graphic assets and identity manuals, we performed professional food photography direction and editing. This focus on \"visual appetite\" was key to differentiating Tularosa's proposition in a highly competitive market, achieving an online presence that is not only aesthetic but functional and oriented toward generating reservations.",
    },
    strategy: {
      es: "La industria restaurantera suele pecar de tener menús en PDF estáticos y flujos de reserva complicados. La estrategia fue diseñar el funnel pensando 100% en la tasa de «Reserva Directa». Creamos la arquitectura UX/UI de modo que la fotografía culinaria jugara agresivamente con la psicología del apetito, y a la par programamos incentivos visuales directos hacia la mesa. No hicimos solo una página; definimos un motor de ocupación diaria.",
      en: "The restaurant industry often suffers from static PDF menus and complicated reservation flows. The strategy was to design the funnel thinking 100% on the «Direct Reservation» rate. We created the UX/UI architecture so that culinary photography aggressively played with appetite psychology, while programming direct visual incentives towards booking tables. We didn't just build a page; we defined a daily occupancy engine.",
    },
    previewImages: [
      "portada-1.webp",
      "tula-1.webp",
      "tula-2.webp",
    ],
    images: [
      { src: "portada-1.webp", alt: "Tularosa — Cover", aspect: "wide" },
      { src: "portada-2.webp", alt: "Tularosa — Cover 2", aspect: "wide" },
      { src: "mockup-de-comida.webp", alt: "Tularosa — Food Mockup", aspect: "wide" },
      { src: "frase-publicitaria-1.webp", alt: "Tularosa — Tagline 1", aspect: "wide" },
      { src: "frase-publicitaria-2.webp", alt: "Tularosa — Tagline 2", aspect: "wide" },
      { src: "frase-publicitaria-3.webp", alt: "Tularosa — Tagline 3", aspect: "wide" },
      { src: "publicidad-de-exterior.webp", alt: "Tularosa — Outdoor Advertising", aspect: "wide" },
    ],
    participation: [
      { icon: "bar", text: { es: "Embudos de Ventas", en: "Sales Funnels" } },
      { icon: "star", text: { es: "Estrategia de Identidad de Marca", en: "Brand Identity Strategy" } },
    ],
  },
  colorfit: {
    slug: "colorfit",
    title: "Colorfit",
    folder: "Colorfit",
    subtitle: {
      es: "Identidad visual y branding para marca de moda y fitness contemporánea.",
      en: "Visual identity and branding for contemporary fashion and fitness brand.",
    },
    industry: {
      es: "Fitness, Wellness y Salud",
      en: "Fitness, Wellness & Health",
    },
    role: {
      es: "Estrategia de Identidad de Marca",
      en: "Brand Identity Strategy",
    },
    description: {
      es: "Fuimos responsables de la creación de la identidad visual integral, enfocada en proyectar energía, disciplina y profesionalismo. Desarrollamos el branding completo y los manuales de marca que hoy rigen la comunicación de la empresa. Nuestro enfoque fue construir una marca sólida y escalable, capaz de conectar emocionalmente con el público fitness y mantener la coherencia visual en diversas aplicaciones, desde entornos digitales hasta materiales físicos de entrenamiento.",
      en: "We were responsible for creating the comprehensive visual identity, focused on projecting energy, discipline, and professionalism. We developed the complete branding and brand manuals that today govern the company's communication. Our focus was to build a solid and scalable brand, capable of emotionally connecting with the fitness audience and maintaining visual coherence across various applications, from digital environments to physical training materials.",
    },
    strategy: {
      es: "Para destacar en la saturada industria del fitness y wellness, nos alejamos del agresivo rojo y negro. Propusimos un acercamiento curativo a través del uso analítico de la psicología de color. Redactamos el manifiesto y lineamientos rectores de uso de logo que rigen su merchandising, asegurando que cuando la marca pasara de lo digital a lo textil (ropa deportiva), todo mantuviera su legibilidad, proporciones y vibra vanguardista intacta.",
      en: "To stand out in the saturated fitness and wellness industry, we moved away from the aggressive red and black cliché. We proposed a healing approach through the analytical use of color psychology. We drafted the manifesto and core guidelines for logo usage governing their merchandising, ensuring that when the brand transitioned from digital to textiles (activewear), everything kept its legibility, proportions, and avant-garde vibe intact.",
    },
    previewImages: [
      "portada-1.webp",
      "colorfit-2.webp",
      "mockup-ropa-2.webp",
    ],
    images: [
      { src: "portada-1.webp", alt: "Colorfit — Cover", aspect: "wide" },
      { src: "diferentes-mockups.webp", alt: "Colorfit — Mockups", aspect: "wide" },
      { src: "mockup-ropa-1.webp", alt: "Colorfit — Apparel Mockup 1", aspect: "wide" },
      { src: "mockup-ropa-2.webp", alt: "Colorfit — Apparel Mockup 2", aspect: "wide" },
      { src: "mockup-tote-bag.webp", alt: "Colorfit — Tote Bag Mockup", aspect: "wide" },
    ],
    participation: [
      { icon: "star", text: { es: "Estrategia de Identidad de Marca", en: "Brand Identity Strategy" } },
    ],
  },
};
