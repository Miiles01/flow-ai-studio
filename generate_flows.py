import json

instagram = {
    "network": "instagram",
    "title": "Trial Reels (Instagram)",
    "nodes": [
        {"id": "A", "type": "custom", "position": {"x": 400, "y": 50}, "data": {"label": "Publicación de Trial Reel"}},
        {"id": "B", "type": "custom", "position": {"x": 400, "y": 150}, "data": {"label": "Fase 1: Audición\n(expuesto a NO seguidores afines)"}},
        {"id": "C", "type": "custom", "position": {"x": 400, "y": 250}, "data": {"label": "Fase 2: Ventana crítica de 90 minutos"}},
        {"id": "D", "type": "custom", "position": {"x": 400, "y": 350}, "data": {"label": "¿Retiene 60%+ en primeros 3s?", "expandable": True}},
        {"id": "E", "type": "custom", "position": {"x": 150, "y": 450}, "data": {"label": "Estrangulamiento:\nno sale del grupo de prueba"}},
        {"id": "F", "type": "custom", "position": {"x": 650, "y": 450}, "data": {"label": "¿Genera DMs / shares (dark social)?", "expandable": True}},
        {"id": "G", "type": "custom", "position": {"x": 650, "y": 550}, "data": {"label": "Graduación:\nExplore + scroll Reels + seguidores"}}
    ],
    "edges": [
        {"id": "eA-B", "source": "A", "target": "B"},
        {"id": "eB-C", "source": "B", "target": "C"},
        {"id": "eC-D", "source": "C", "target": "D"},
        {"id": "eD-E", "source": "D", "target": "E", "label": "No", "animated": False},
        {"id": "eD-F", "source": "D", "target": "F", "label": "Sí"},
        {"id": "eF-E", "source": "F", "target": "E", "label": "Débil", "animated": False},
        {"id": "eF-G", "source": "F", "target": "G", "label": "Fuerte"}
    ]
}

tiktok = {
    "network": "tiktok",
    "title": "Algoritmo TikTok (FYP)",
    "nodes": [
        {"id": "A", "type": "custom", "position": {"x": 400, "y": 50}, "data": {"label": "Publicación"}},
        {"id": "B", "type": "custom", "position": {"x": 400, "y": 150}, "data": {"label": "Fase 1: Ingesta y etiquetado\n(audio, OCR, hashtags, geo)"}},
        {"id": "C", "type": "custom", "position": {"x": 400, "y": 250}, "data": {"label": "Fase 2: Círculo primario\n(audiencia semilla ~1.000)"}},
        {"id": "D", "type": "custom", "position": {"x": 400, "y": 350}, "data": {"label": "Retención 3s: ¿scroll inmediato?", "expandable": True}},
        {"id": "E", "type": "custom", "position": {"x": 150, "y": 450}, "data": {"label": "Video muere: RI bajo"}},
        {"id": "F", "type": "custom", "position": {"x": 650, "y": 450}, "data": {"label": "Completion rate + saves/shares"}},
        {"id": "G", "type": "custom", "position": {"x": 650, "y": 550}, "data": {"label": "¿RI > RI medio?", "expandable": True}},
        {"id": "H", "type": "custom", "position": {"x": 650, "y": 650}, "data": {"label": "Escala de círculo\n(10K → 100K → 500K...)"}}
    ],
    "edges": [
        {"id": "eA-B", "source": "A", "target": "B"},
        {"id": "eB-C", "source": "B", "target": "C"},
        {"id": "eC-D", "source": "C", "target": "D"},
        {"id": "eD-E", "source": "D", "target": "E", "label": "Alto scroll", "animated": False},
        {"id": "eD-F", "source": "D", "target": "F", "label": "Retiene"},
        {"id": "eF-G", "source": "F", "target": "G"},
        {"id": "eG-E", "source": "G", "target": "E", "label": "No", "animated": False},
        {"id": "eG-H", "source": "G", "target": "H", "label": "Sí"},
        {"id": "eH-G", "source": "H", "target": "G", "label": "Bucle", "animated": True, "style": {"strokeDasharray": "5,5"}}
    ]
}

facebook = {
    "network": "facebook",
    "title": "Facebook EdgeRank",
    "nodes": [
        {"id": "A", "type": "custom", "position": {"x": 400, "y": 50}, "data": {"label": "Fase 1: Ensamblaje de inventario\n(amigos, páginas, ads)"}},
        {"id": "B", "type": "custom", "position": {"x": 400, "y": 150}, "data": {"label": "Fase 2: Señales pasivas + activas\n(tiempo, reacciones, shares)"}},
        {"id": "C", "type": "custom", "position": {"x": 400, "y": 250}, "data": {"label": "Fase 3: Modelado predictivo\n(probabilidad de interacción)"}},
        {"id": "D", "type": "custom", "position": {"x": 400, "y": 350}, "data": {"label": "Fase 4: Relevancy Score"}},
        {"id": "E", "type": "custom", "position": {"x": 400, "y": 450}, "data": {"label": "Feed ordenado (mayor a menor score)"}}
    ],
    "edges": [
        {"id": "eA-B", "source": "A", "target": "B"},
        {"id": "eB-C", "source": "B", "target": "C"},
        {"id": "eC-D", "source": "C", "target": "D"},
        {"id": "eD-E", "source": "D", "target": "E"}
    ]
}

youtube = {
    "network": "youtube",
    "title": "YouTube Shorts",
    "nodes": [
        {"id": "A", "type": "custom", "position": {"x": 400, "y": 50}, "data": {"label": "Publicación"}},
        {"id": "B", "type": "custom", "position": {"x": 400, "y": 150}, "data": {"label": "Fase 1: Seed audience\n(sin límite de tiempo)"}},
        {"id": "C", "type": "custom", "position": {"x": 400, "y": 250}, "data": {"label": "¿Visto o deslizado en 1er fotograma?", "expandable": True}},
        {"id": "D", "type": "custom", "position": {"x": 150, "y": 350}, "data": {"label": "Video frenado"}},
        {"id": "E", "type": "custom", "position": {"x": 650, "y": 350}, "data": {"label": "Fase 3: AVD\n(% duración consumida ideal 50-60s)"}},
        {"id": "F", "type": "custom", "position": {"x": 650, "y": 450}, "data": {"label": "¿Alta satisfacción por deslizamiento?", "expandable": True}},
        {"id": "G", "type": "custom", "position": {"x": 650, "y": 550}, "data": {"label": "Fase 4: Acervo evergreen\n(resurge en picos de estacionalidad)"}}
    ],
    "edges": [
        {"id": "eA-B", "source": "A", "target": "B"},
        {"id": "eB-C", "source": "B", "target": "C"},
        {"id": "eC-D", "source": "C", "target": "D", "label": "≥70% swipe", "animated": False},
        {"id": "eC-E", "source": "C", "target": "E", "label": "Retiene"},
        {"id": "eE-F", "source": "E", "target": "F"},
        {"id": "eF-D", "source": "F", "target": "D", "label": "No", "animated": False},
        {"id": "eF-G", "source": "F", "target": "G", "label": "Sí"}
    ]
}

flows = {
    "instagram": instagram,
    "tiktok": tiktok,
    "facebook": facebook,
    "youtube": youtube
}

print(json.dumps(flows, indent=2))
