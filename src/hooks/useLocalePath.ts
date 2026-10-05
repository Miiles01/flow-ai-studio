import { useParams } from "react-router-dom";

/**
 * Hook que devuelve la función para construir rutas con el prefijo de idioma actual.
 * Uso: const localePath = useLocalePath(); localePath("/clinicas") => "/es/clinicas"
 */
export const useLocalePath = () => {
  const { lang } = useParams<{ lang: string }>();
  const currentLang = lang || "es";

  return (path: string) => {
    // Si la ruta ya empieza con /es/ o /en/, no agregar prefijo
    if (path.startsWith("/es/") || path.startsWith("/en/")) return path;
    // Si es la raíz, devolver /{lang}/
    if (path === "/" || path === "") return `/${currentLang}/`;
    // Limpiar doble slash
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `/${currentLang}${cleanPath}`;
  };
};
