import type { Trend } from '@/hooks/useTrends';

export const MOCK_TRENDS: Trend[] = [
  {
    "id": "instagram_0",
    "network": "instagram",
    "media_url": "https://www.instagram.com/reel/DaOEmhnxW9b/",
    "title": "Video 1",
    "summary": "",
    "bullets": []
  },
  {
    "id": "instagram_1",
    "network": "instagram",
    "media_url": "https://www.instagram.com/reel/DaIt1H5RJfl/",
    "title": "Video 2",
    "summary": "",
    "bullets": []
  },
  {
    "id": "instagram_2",
    "network": "instagram",
    "media_url": "https://www.instagram.com/reel/DZ2um57xOVH/",
    "title": "Video 3",
    "summary": "",
    "bullets": []
  },
  {
    "id": "instagram_3",
    "network": "instagram",
    "media_url": "https://www.instagram.com/reel/DXepXhRCO7Z/",
    "title": "Video 4",
    "summary": "",
    "bullets": []
  },
  {
    "id": "instagram_4",
    "network": "instagram",
    "media_url": "https://www.instagram.com/reel/DZciMG6xjdM/",
    "title": "Video 5",
    "summary": "",
    "bullets": []
  },
  {
    "id": "instagram_5",
    "network": "instagram",
    "media_url": "https://www.instagram.com/reel/DaBDvEVFXWY/",
    "title": "Video 6",
    "summary": "",
    "bullets": []
  },
  {
    "id": "tiktok_0",
    "network": "tiktok",
    "media_url": "https://www.tiktok.com/@madisonknowsbest/video/7627564819259886879",
    "title": "Video 1",
    "summary": "",
    "bullets": []
  },
  {
    "id": "tiktok_1",
    "network": "tiktok",
    "media_url": "https://www.tiktok.com/@carlosrmind/video/7403487056637381894",
    "title": "Video 2",
    "summary": "",
    "bullets": []
  },
  {
    "id": "facebook_0",
    "network": "facebook",
    "media_url": "https://www.instagram.com/reel/DZprwZRlV9R/",
    "title": "Video 1",
    "summary": "",
    "bullets": []
  },
  {
    "id": "facebook_1",
    "network": "facebook",
    "media_url": "https://www.instagram.com/reel/DXxX6cRiWiF/",
    "title": "Video 2",
    "summary": "",
    "bullets": []
  },
  {
    "id": "facebook_2",
    "network": "facebook",
    "media_url": "https://www.instagram.com/reel/DXw-Kjuua76/",
    "title": "Video 3",
    "summary": "",
    "bullets": []
  },
  {
    "id": "youtube_0",
    "network": "youtube",
    "media_url": "https://www.youtube.com/watch?v=unoSIeuPivw",
    "title": "Video 1",
    "summary": "",
    "bullets": []
  }
] as unknown as Trend[];

export const MOCK_FLOWS: Record<string, any> = {
  "youtube": {
    "network": "youtube",
    "title": "Estrategia: Nueva Era de la Marca Personal",
    "nodes": [
      {
        "id": "1",
        "type": "custom",
        "position": {
          "x": 100,
          "y": 100
        },
        "data": {
          "label": "1. Definir la Oferta Primero"
        }
      },
      {
        "id": "2",
        "type": "custom",
        "position": {
          "x": 100,
          "y": 250
        },
        "data": {
          "label": "2. Definir el Seguidor Ideal"
        }
      },
      {
        "id": "3",
        "type": "custom",
        "position": {
          "x": 400,
          "y": 100
        },
        "data": {
          "label": "3. Creaci\u00f3n de Contenido (Autenticidad > Info)"
        }
      },
      {
        "id": "4",
        "type": "custom",
        "position": {
          "x": 400,
          "y": 250
        },
        "data": {
          "label": "4. Posicionamiento por Asociaci\u00f3n"
        }
      },
      {
        "id": "5",
        "type": "custom",
        "position": {
          "x": 700,
          "y": 100
        },
        "data": {
          "label": "5. Embudo de 3 Niveles"
        }
      },
      {
        "id": "6",
        "type": "custom",
        "position": {
          "x": 700,
          "y": 250
        },
        "data": {
          "label": "6. Optimizar el User Watch Time"
        }
      }
    ],
    "edges": [
      {
        "id": "e1-2",
        "source": "1",
        "target": "2",
        "animated": true
      },
      {
        "id": "e2-3",
        "source": "2",
        "target": "3",
        "animated": true
      },
      {
        "id": "e3-4",
        "source": "3",
        "target": "4"
      },
      {
        "id": "e4-5",
        "source": "4",
        "target": "5",
        "animated": true
      },
      {
        "id": "e5-6",
        "source": "5",
        "target": "6",
        "animated": true
      }
    ]
  },
  "instagram": {
    "network": "instagram",
    "title": "Ecosistema Instagram 2026",
    "nodes": [
      {
        "id": "1",
        "type": "custom",
        "position": {
          "x": 100,
          "y": 50
        },
        "data": {
          "label": "1. Algoritmo por Intereses"
        }
      },
      {
        "id": "2",
        "type": "custom",
        "position": {
          "x": 100,
          "y": 150
        },
        "data": {
          "label": "2. Multihooks (Visual, Verbal, Auditivo)"
        }
      },
      {
        "id": "3",
        "type": "custom",
        "position": {
          "x": 100,
          "y": 250
        },
        "data": {
          "label": "3. Integraci\u00f3n Estrat\u00e9gica de IA"
        }
      },
      {
        "id": "4",
        "type": "custom",
        "position": {
          "x": 400,
          "y": 150
        },
        "data": {
          "label": "4. Gamificaci\u00f3n y Din\u00e1micas"
        }
      },
      {
        "id": "5",
        "type": "custom",
        "position": {
          "x": 700,
          "y": 50
        },
        "data": {
          "label": "Reels (50% - Adquisici\u00f3n)"
        }
      },
      {
        "id": "6",
        "type": "custom",
        "position": {
          "x": 700,
          "y": 150
        },
        "data": {
          "label": "Carruseles (Interacci\u00f3n)"
        }
      },
      {
        "id": "7",
        "type": "custom",
        "position": {
          "x": 700,
          "y": 250
        },
        "data": {
          "label": "Historias (Conexi\u00f3n/Ventas)"
        }
      }
    ],
    "edges": [
      {
        "id": "e1-2",
        "source": "1",
        "target": "2",
        "animated": true
      },
      {
        "id": "e2-3",
        "source": "2",
        "target": "3",
        "animated": true
      },
      {
        "id": "e3-4",
        "source": "3",
        "target": "4"
      },
      {
        "id": "e4-5",
        "source": "4",
        "target": "5",
        "animated": true
      },
      {
        "id": "e4-6",
        "source": "4",
        "target": "6",
        "animated": true
      },
      {
        "id": "e4-7",
        "source": "4",
        "target": "7",
        "animated": true
      }
    ]
  },
  "facebook": {
    "network": "facebook",
    "title": "Arquitectura Algor\u00edtmica (EdgeRank)",
    "nodes": [
      {
        "id": "1",
        "type": "custom",
        "position": {
          "x": 400,
          "y": 50
        },
        "data": {
          "label": "EdgeRank (Facebook 2026)",
          "expandable": true,
          "icon": "eye"
        }
      },
      {
        "id": "2",
        "type": "custom",
        "position": {
          "x": 100,
          "y": 200
        },
        "data": {
          "label": "1. Ensamblaje de Inventario",
          "expandable": true
        }
      },
      {
        "id": "2a",
        "type": "custom",
        "position": {
          "x": 50,
          "y": 300
        },
        "data": {
          "label": "P\u00e1ginas, Grupos y Amigos"
        }
      },
      {
        "id": "2b",
        "type": "custom",
        "position": {
          "x": 200,
          "y": 300
        },
        "data": {
          "label": "Ads Segmentados"
        }
      },
      {
        "id": "3",
        "type": "custom",
        "position": {
          "x": 400,
          "y": 200
        },
        "data": {
          "label": "2. Se\u00f1ales (Activas y Pasivas)",
          "expandable": true
        }
      },
      {
        "id": "3a",
        "type": "custom",
        "position": {
          "x": 350,
          "y": 300
        },
        "data": {
          "label": "Pasivas: Tiempo de vista"
        }
      },
      {
        "id": "3b",
        "type": "custom",
        "position": {
          "x": 500,
          "y": 300
        },
        "data": {
          "label": "Activas: Comentarios profundos"
        }
      },
      {
        "id": "4",
        "type": "custom",
        "position": {
          "x": 700,
          "y": 200
        },
        "data": {
          "label": "3. Relevancy Score (Modelo Bayesiano)",
          "expandable": true
        }
      },
      {
        "id": "4a",
        "type": "custom",
        "position": {
          "x": 650,
          "y": 300
        },
        "data": {
          "label": "Filtro Engagement Bait"
        }
      },
      {
        "id": "4b",
        "type": "custom",
        "position": {
          "x": 800,
          "y": 300
        },
        "data": {
          "label": "Orden descendente en Feed"
        }
      },
      {
        "id": "5",
        "type": "custom",
        "position": {
          "x": 400,
          "y": 450
        },
        "data": {
          "label": "T\u00e1cticas de Crecimiento",
          "expandable": true,
          "icon": "eye"
        }
      },
      {
        "id": "5a",
        "type": "custom",
        "position": {
          "x": 250,
          "y": 550
        },
        "data": {
          "label": "Reels (Doble Retenci\u00f3n 6-10s)"
        }
      },
      {
        "id": "5b",
        "type": "custom",
        "position": {
          "x": 550,
          "y": 550
        },
        "data": {
          "label": "T\u00e1ctica Hidden Gem (Grupos)"
        }
      }
    ],
    "edges": [
      {
        "id": "e1-2",
        "source": "1",
        "target": "2",
        "animated": true
      },
      {
        "id": "e1-3",
        "source": "1",
        "target": "3",
        "animated": true
      },
      {
        "id": "e1-4",
        "source": "1",
        "target": "4",
        "animated": true
      },
      {
        "id": "e2-2a",
        "source": "2",
        "target": "2a"
      },
      {
        "id": "e2-2b",
        "source": "2",
        "target": "2b"
      },
      {
        "id": "e3-3a",
        "source": "3",
        "target": "3a"
      },
      {
        "id": "e3-3b",
        "source": "3",
        "target": "3b"
      },
      {
        "id": "e4-4a",
        "source": "4",
        "target": "4a"
      },
      {
        "id": "e4-4b",
        "source": "4",
        "target": "4b"
      },
      {
        "id": "e1-5",
        "source": "1",
        "target": "5",
        "animated": true
      },
      {
        "id": "e5-5a",
        "source": "5",
        "target": "5a"
      },
      {
        "id": "e5-5b",
        "source": "5",
        "target": "5b"
      }
    ]
  },
  "tiktok": {
    "network": "tiktok",
    "title": "Arquitectura Algor\u00edtmica (FYP)",
    "nodes": [
      {
        "id": "1",
        "type": "custom",
        "position": {
          "x": 400,
          "y": 50
        },
        "data": {
          "label": "Algoritmo TikTok (FYP)",
          "expandable": true,
          "icon": "eye"
        }
      },
      {
        "id": "2",
        "type": "custom",
        "position": {
          "x": 100,
          "y": 200
        },
        "data": {
          "label": "1. Ingesta y Etiquetado",
          "expandable": true
        }
      },
      {
        "id": "2a",
        "type": "custom",
        "position": {
          "x": 50,
          "y": 300
        },
        "data": {
          "label": "OCR (Texto en pantalla)"
        }
      },
      {
        "id": "2b",
        "type": "custom",
        "position": {
          "x": 200,
          "y": 300
        },
        "data": {
          "label": "Procesamiento de Audio (NLP)"
        }
      },
      {
        "id": "3",
        "type": "custom",
        "position": {
          "x": 400,
          "y": 200
        },
        "data": {
          "label": "2. C\u00edrculo Primario",
          "expandable": true
        }
      },
      {
        "id": "3a",
        "type": "custom",
        "position": {
          "x": 350,
          "y": 300
        },
        "data": {
          "label": "Test 200 Vistas"
        }
      },
      {
        "id": "3b",
        "type": "custom",
        "position": {
          "x": 500,
          "y": 300
        },
        "data": {
          "label": "Superposici\u00f3n Sem\u00e1ntica"
        }
      },
      {
        "id": "4",
        "type": "custom",
        "position": {
          "x": 700,
          "y": 200
        },
        "data": {
          "label": "3. Matriz de Se\u00f1ales",
          "expandable": true
        }
      },
      {
        "id": "4a",
        "type": "custom",
        "position": {
          "x": 650,
          "y": 300
        },
        "data": {
          "label": "Filtro Severo: Retenci\u00f3n a los 3s"
        }
      },
      {
        "id": "4b",
        "type": "custom",
        "position": {
          "x": 800,
          "y": 300
        },
        "data": {
          "label": "% de Visionado y Shares"
        }
      },
      {
        "id": "5",
        "type": "custom",
        "position": {
          "x": 400,
          "y": 450
        },
        "data": {
          "label": "4. Estrategia de TikTok SEO",
          "expandable": true,
          "icon": "eye"
        }
      },
      {
        "id": "5a",
        "type": "custom",
        "position": {
          "x": 250,
          "y": 550
        },
        "data": {
          "label": "Palabras clave naturales"
        }
      },
      {
        "id": "5b",
        "type": "custom",
        "position": {
          "x": 550,
          "y": 550
        },
        "data": {
          "label": "Nichar (3-4 pilares base)"
        }
      }
    ],
    "edges": [
      {
        "id": "e1-2",
        "source": "1",
        "target": "2",
        "animated": true
      },
      {
        "id": "e1-3",
        "source": "1",
        "target": "3",
        "animated": true
      },
      {
        "id": "e1-4",
        "source": "1",
        "target": "4",
        "animated": true
      },
      {
        "id": "e2-2a",
        "source": "2",
        "target": "2a"
      },
      {
        "id": "e2-2b",
        "source": "2",
        "target": "2b"
      },
      {
        "id": "e3-3a",
        "source": "3",
        "target": "3a"
      },
      {
        "id": "e3-3b",
        "source": "3",
        "target": "3b"
      },
      {
        "id": "e4-4a",
        "source": "4",
        "target": "4a"
      },
      {
        "id": "e4-4b",
        "source": "4",
        "target": "4b"
      },
      {
        "id": "e1-5",
        "source": "1",
        "target": "5",
        "animated": true
      },
      {
        "id": "e5-5a",
        "source": "5",
        "target": "5a"
      },
      {
        "id": "e5-5b",
        "source": "5",
        "target": "5b"
      }
    ]
  }
};
