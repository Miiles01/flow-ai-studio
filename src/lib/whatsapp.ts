// Número de contacto en formato internacional sin "+"
export const WHATSAPP_NUMBER = "525610168992";

export const openWhatsApp = (message: string) => {
  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
    "_blank",
    "noopener,noreferrer"
  );
};
