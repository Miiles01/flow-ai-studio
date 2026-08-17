/**
 * Formato ligero para los contratos: negritas, cursivas, viñetas, listas
 * numeradas, sangría, enlaces y campos por completar ([DATO]).
 * Se escribe en texto plano (markdown-lite) y se renderiza con este componente,
 * tanto en el widget del canvas como en la vista pública.
 */
import { Fragment, type ReactNode } from "react";

const INLINE = /(\[[^\]\n]+\]\((https?:\/\/[^\s)]+)\)|\*\*[^*\n]+\*\*|__[^_\n]+__|\*[^*\n]+\*|_[^_\n]+_|https?:\/\/[^\s)]+|\[[A-ZÁÉÍÓÚÑ0-9][^\]\n]*\])/g;

/** Convierte marcas en línea (negrita, cursiva, enlaces, campos) en nodos React. */
export function renderInline(text: string, keyPrefix = "", isDark: boolean = false): ReactNode[] {
  const parts = text.split(INLINE).filter((p) => p !== undefined && p !== "");
  return parts.map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    const link = /^\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)$/.exec(part);
    if (link) {
      return (
        <a
          key={key}
          href={link[2]}
          target="_blank"
          rel="noopener noreferrer"
          className={`${isDark ? "text-white" : "text-gray-900"} underline underline-offset-2 hover:opacity-70`}
        >
          {link[1]}
        </a>
      );
    }
    if (/^https?:\/\//.test(part)) {
      return (
        <a
          key={key}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className={`${isDark ? "text-white" : "text-gray-900"} underline underline-offset-2 hover:opacity-70`}
        >
          {part}
        </a>
      );
    }
    if (/^(\*\*|__).+(\*\*|__)$/.test(part)) {
      return (
        <strong key={key} className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (/^(\*|_).+(\*|_)$/.test(part)) {
      return (
        <em key={key} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    // Campo por completar: [NOMBRE DE LA MARCA]
    if (/^\[.+\]$/.test(part)) {
      return (
        <strong key={key} className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
          {part}
        </strong>
      );
    }
    return <Fragment key={key}>{part}</Fragment>;
  });
}

type Props = { content: string; className?: string; isDark?: boolean };

/** Renderiza el contenido de una página con formato. */
const ContractRichText = ({ content, className = "", isDark = false }: Props) => {
  const lines = (content ?? "").split("\n");

  return (
    <div className={className}>
      {lines.map((raw, i) => {
        const indentMatch = /^(\s*)/.exec(raw);
        const indent = Math.min(Math.floor((indentMatch?.[1].length ?? 0) / 2), 4);
        const line = raw.trim();
        const style = indent ? { paddingLeft: indent * 18 } : undefined;

        if (!line) return <div key={i} style={{ height: "0.85em" }} />;

        const heading = /^(#{1,3})\s+(.*)$/.exec(line);
        if (heading) {
          const level = heading[1].length;
          const size = level === 1 ? "text-[17px]" : level === 2 ? "text-[15px]" : "text-[13.5px]";
          return (
            <p key={i} style={style} className={`mb-1 mt-3 font-medium ${isDark ? "text-white" : "text-gray-900"} ${size}`}>
              {renderInline(heading[2], String(i), isDark)}
            </p>
          );
        }

        const bullet = /^[-*•]\s+(.*)$/.exec(line);
        if (bullet) {
          return (
            <div key={i} style={style} className="flex gap-2">
              <span className="select-none opacity-50">•</span>
              <span className="flex-1">{renderInline(bullet[1], String(i), isDark)}</span>
            </div>
          );
        }

        const numbered = /^(\d+[.)])\s+(.*)$/.exec(line);
        if (numbered) {
          return (
            <div key={i} style={style} className="flex gap-2">
              <span className="select-none opacity-70">{numbered[1]}</span>
              <span className="flex-1">{renderInline(numbered[2], String(i), isDark)}</span>
            </div>
          );
        }

        return (
          <p key={i} style={style}>
            {renderInline(line, String(i), isDark)}
          </p>
        );
      })}
    </div>
  );
};

export default ContractRichText;
