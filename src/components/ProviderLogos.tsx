// SVG logos inline para los proveedores de IA
import type { SVGProps } from "react";

export function ClaudeLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M13.827 3.52L7.617 17.147H9.97l1.307-3.227h6.47l1.307 3.227h2.353L15.197 3.52h-1.37zm-.685 2.472l2.45 5.9h-4.9l2.45-5.9z" fill="currentColor" />
    </svg>
  );
}

export function ChatGPTLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.843-3.372 2.019-1.168a.076.076 0 0 1 .071 0l4.83 2.786a4.494 4.494 0 0 1-.676 8.105v-5.677a.79.79 0 0 0-.4-.674zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.077.077 0 0 1 .031-.06l4.769-2.78a4.5 4.5 0 0 1 6.675 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.6 1.497v2.999l-2.597 1.5-2.605-1.5z" />
    </svg>
  );
}

export function GeminiLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <defs>
        <linearGradient id="gem-v" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4285F4" />
          <stop offset="100%" stopColor="#9B72CB" />
        </linearGradient>
        <linearGradient id="gem-h" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor="#4285F4" />
          <stop offset="100%" stopColor="#9B72CB" />
        </linearGradient>
      </defs>
      <path d="M12 2C12 2 6.5 9.5 6.5 12S12 22 12 22s5.5-7.5 5.5-10S12 2 12 2z" fill="url(#gem-v)" />
      <path d="M2 12c0 0 7.5-5.5 10-5.5S22 12 22 12s-7.5 5.5-10 5.5S2 12 2 12z" fill="url(#gem-h)" opacity="0.85" />
    </svg>
  );
}

export function DeepSeekLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23.748 11.81a.794.794 0 0 0-.073-.215c-.32-.777-1.02-1.226-1.662-1.62-.116-.07-.229-.14-.34-.211a.198.198 0 0 1-.08-.232c.033-.093.128-.13.216-.165l.02-.008c.23-.09.461-.12.695-.15.087-.012.174-.024.26-.04.358-.064.638-.24.638-.641a.917.917 0 0 0-.4-.695.83.83 0 0 0-.5-.145c-.277 0-.516.072-.755.143-.066.02-.132.04-.198.057-.584.154-1.097.465-1.611.775l-.044.027c-.125.075-.186.038-.21-.097a3.29 3.29 0 0 0-.064-.274c-.27-.927-.863-1.6-1.706-2.068-.413-.231-.836-.425-1.295-.517a4.766 4.766 0 0 0-.688-.089 5.884 5.884 0 0 0-2.394.378 8.208 8.208 0 0 0-1.34.688c-.39.247-.758.53-1.077.864a7.64 7.64 0 0 0-1.452 2.35 9.11 9.11 0 0 0-.439 1.61 9.617 9.617 0 0 0-.14 1.667c0 .407.025.815.075 1.22.14 1.13.478 2.207 1.008 3.16a7.55 7.55 0 0 0 1.07 1.52c.19.207.39.405.598.592.87.779 1.884 1.3 3 1.553.434.1.875.15 1.318.15.424 0 .848-.046 1.265-.137 1.086-.24 2.068-.784 2.917-1.604.127-.12.25-.247.37-.378a7.485 7.485 0 0 0 1.006-1.564 9.075 9.075 0 0 0 .652-2.157 10.14 10.14 0 0 0 .154-1.784c0-.207-.007-.415-.02-.622a10.064 10.064 0 0 0-.178-1.476.3.3 0 0 1 .12-.3c.34-.215.674-.44.981-.703.18-.155.352-.317.512-.49.12-.132.237-.27.32-.427z" />
    </svg>
  );
}

export function PerplexityLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22.638 8.653h-8.01V3.056L8.03 8.653H2.362v2.116h2.092v7.15H2.362v2.025h8.57v-2.025H8.84v-2.42l2.8-2.598v5.018h-1.037v2.025h8.659v-2.025h-2.143v-7.15h2.143V8.653zm-9.51 5.003L9.98 16.065V11.25l3.148-2.597v5.003z" />
    </svg>
  );
}

export const PROVIDER_LOGOS: Record<string, React.ComponentType<SVGProps<SVGSVGElement>>> = {
  anthropic: ClaudeLogo,
  openai: ChatGPTLogo,
  google: GeminiLogo,
  deepseek: DeepSeekLogo,
  perplexity: PerplexityLogo,
};

export const PROVIDER_COLORS: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
  anthropic:  { bg: "bg-[#E07B54]/15", text: "text-[#C8552A]", darkBg: "bg-[#E07B54]/20", darkText: "text-[#E07B54]" },
  openai:     { bg: "bg-[#10A37F]/15", text: "text-[#0D8C6D]", darkBg: "bg-[#10A37F]/20", darkText: "text-[#10A37F]" },
  google:     { bg: "bg-[#4285F4]/15", text: "text-[#2B6FD4]", darkBg: "bg-[#4285F4]/20", darkText: "text-[#4285F4]" },
  deepseek:   { bg: "bg-[#4D6BFE]/15", text: "text-[#3551E0]", darkBg: "bg-[#4D6BFE]/20", darkText: "text-[#4D6BFE]" },
  perplexity: { bg: "bg-[#20B2AA]/15", text: "text-[#148080]", darkBg: "bg-[#20B2AA]/20", darkText: "text-[#20B2AA]" },
};
