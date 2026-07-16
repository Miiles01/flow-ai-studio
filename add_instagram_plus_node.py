import re

with open("src/data/trendFlows.ts", "r") as f:
    content = f.read()

plus_node = """      {
        id: "PLUS",
        position: { x: -560, y: 370 },
        data: {
          kind: "strategy", tag: "Novedad 2026", confidence: "confirmed",
          label: "Instagram Plus",
          sublabel: "Nueva suscripción opcional de $3.99/mes con ventajas exclusivas",
          details: [
            { id: "p1", dx: -340, dy: -40, side: "left", tag: "Interacción", label: "Story Spotlight & Super Hearts", sublabel: "Prioridad en historias y corazones animados." },
            { id: "p2", dx: -340, dy: 115, side: "left", tag: "Visualización", label: "Story Preview en secreto", sublabel: "Mira historias sin que lo sepan y descubre quién repitió las tuyas." },
            { id: "p3", dx: -340, dy: 270, side: "left", tag: "Personalización", label: "Posts fijados y fuentes", sublabel: "Fija hasta 6 publicaciones y publica sin aparecer en el feed." }
          ]
        },
      },
"""

# Insert the node before the "B" node in instagram
content = content.replace(
    '      {\n        id: "B",\n        position: { x: 0, y: 370 },',
    plus_node + '      {\n        id: "B",\n        position: { x: 0, y: 370 },'
)

# Insert the edge in the edges array of instagram
# Find: { id: "eA-B", source: "A", target: "B" },
plus_edge = '      { id: "eA-PLUS", source: "A", target: "PLUS", sourceHandle: "l-s", targetHandle: "r-t", dashed: true },\n'
content = content.replace(
    '      { id: "eA-B", source: "A", target: "B" },',
    plus_edge + '      { id: "eA-B", source: "A", target: "B" },'
)

with open("src/data/trendFlows.ts", "w") as f:
    f.write(content)
print("Updated trendFlows!")
