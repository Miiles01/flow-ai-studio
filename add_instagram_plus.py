import re

new_trends = """  {
    "id": "instagram_plus_1",
    "network": "instagram",
    "media_url": "https://www.instagram.com/reel/Das3elmRg4h/?igsh=MXV0amQ5Nmw4cG9zbQ==",
    "title": "Lanzamiento Instagram Plus",
    "summary": "Nueva suscripción opcional con funciones exclusivas de interacción, visualización y personalización.",
    "bullets": [
      "Story Spotlight y Super Hearts para mayor interacción.",
      "Story Preview para ver historias en secreto y buscar quién te vio.",
      "Íconos exclusivos, fuentes personalizadas y hasta 6 posts fijados."
    ]
  },
  {
    "id": "instagram_plus_2",
    "network": "instagram",
    "media_url": "https://www.instagram.com/reel/DYQViyItrBt/?igsh=MWtiYXlxaGg3aXVkcw==",
    "title": "Beneficios Instagram Plus",
    "summary": "Mejoras exclusivas como múltiples públicos para historias y duración de 48 horas.",
    "bullets": [
      "Extensión de historias hasta 48 horas.",
      "Múltiples públicos para compartir con las listas adecuadas.",
      "Publicación directa en el perfil sin pasar por el feed."
    ]
  },
  {
    "id": "instagram_plus_3",
    "network": "instagram",
    "media_url": "https://www.instagram.com/reel/DalykXpNzy7/?igsh=NGJ1azFwbHM1aHJz",
    "title": "Detalles de Instagram Plus",
    "summary": "La plataforma sigue siendo gratuita, pero Plus ofrece más control por 3.99 dólares al mes.",
    "bullets": [
      "Costo aproximado de 3.99 dólares (o 2 dólares en LATAM).",
      "Actualizaciones periódicas con nuevas herramientas.",
      "El algoritmo tradicional no cambia, solo se añaden ventajas premium."
    ]
  },
"""

with open("src/data/mockTrends.ts", "r") as f:
    content = f.read()

# Find the start of the array
array_start = "export const MOCK_TRENDS: Trend[] = [\n"
if array_start in content:
    content = content.replace(array_start, array_start + new_trends)
    with open("src/data/mockTrends.ts", "w") as f:
        f.write(content)
    print("Added new trends!")
else:
    print("Could not find array start")
