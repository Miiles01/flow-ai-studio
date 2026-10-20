import estrellaIcon from "@/assets/miiles/Estrella.svg";

/**
 * La estrella de Miiles. Se pinta con una máscara CSS sobre `currentColor`,
 * así que hereda el color del texto y se ve bien en fondo claro, oscuro o sólido.
 */
export default function MiilesStar({ className = "h-4 w-4" }: { className?: string }) {
  const mask = `url(${estrellaIcon})`;
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 bg-current ${className}`}
      style={{
        maskImage: mask,
        WebkitMaskImage: mask,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
      }}
    />
  );
}
