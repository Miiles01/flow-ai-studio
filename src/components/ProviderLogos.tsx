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

export function PerplexityLogo({ className }: SVGProps<SVGSVGElement>) {
  return <img src="/logos/perplexity.svg" alt="Perplexity" className={className} />;
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
