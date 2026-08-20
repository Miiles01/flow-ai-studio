import type { SVGProps } from "react";

export function ClaudeLogo({ className }: SVGProps<SVGSVGElement>) {
  return <img src="/logos/claude.svg" alt="Claude" className={className} />;
}

export function ChatGPTLogo({ className }: SVGProps<SVGSVGElement>) {
  return <img src="/logos/chatgpt.svg" alt="ChatGPT" className={className} />;
}

export function GeminiLogo({ className }: SVGProps<SVGSVGElement>) {
  return <img src="/logos/gemini.svg" alt="Gemini" className={className} />;
}

export function DeepSeekLogo({ className }: SVGProps<SVGSVGElement>) {
  return <img src="/logos/deepseek.svg" alt="DeepSeek" className={className} />;
}

export function PerplexityLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22.638 8.653h-8.01V3.056L8.03 8.653H2.362v2.116h2.092v7.15H2.362v2.025h8.57v-2.025H8.84v-2.42l2.8-2.598v5.018h-1.037v2.025h8.659v-2.025h-2.143v-7.15h2.143V8.653zm-9.51 5.003L9.98 16.065V11.25l3.148-2.597v5.003z" />
    </svg>
  );
}

export const PROVIDER_LOGOS: Record<string, React.ComponentType<any>> = {
  anthropic: ClaudeLogo,
  openai: ChatGPTLogo,
  google: GeminiLogo,
  deepseek: DeepSeekLogo,
  perplexity: PerplexityLogo,
};

export const PROVIDER_COLORS: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
  anthropic:  { bg: "bg-[#E07B54]/15", text: "text-[#C8552A]", darkBg: "bg-[#E07B54]/20", darkText: "text-[#E07B54]" },
  openai:     { bg: "bg-gray-100", text: "text-[#0D8C6D]", darkBg: "bg-white/10", darkText: "text-[#10A37F]" },
  google:     { bg: "bg-[#4285F4]/15", text: "text-[#2B6FD4]", darkBg: "bg-[#4285F4]/20", darkText: "text-[#4285F4]" },
  deepseek:   { bg: "bg-gray-100", text: "text-[#3551E0]", darkBg: "bg-white/10", darkText: "text-[#4D6BFE]" },
  perplexity: { bg: "bg-[#20B2AA]/15", text: "text-[#148080]", darkBg: "bg-[#20B2AA]/20", darkText: "text-[#20B2AA]" },
};
