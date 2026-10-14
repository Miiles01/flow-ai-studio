import { useState } from "react";
import { Instagram, Youtube } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useTrends } from "@/hooks/useTrends";
import { TrendStoryViewer } from "@/components/TrendStoryViewer";

const NETWORKS = [
  {
    id: 1,
    title: "Instagram",
    image: "/discoveries/card1.png",
    darkImage: "/discoveries/card1-dark.png",
    icon: <Instagram className="w-5 h-5" />,
  },
  {
    id: 2,
    title: "YouTube",
    image: "/discoveries/card2.png",
    darkImage: "/discoveries/card2-dark.png",
    icon: <Youtube className="w-5 h-5" />,
  },
  {
    id: 3,
    title: "TikTok",
    image: "/discoveries/card3.png",
    darkImage: "/discoveries/card3-dark.png",
    icon: (
      <svg width="18" height="18" viewBox="0 0 448 512" fill="currentColor">
        <path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25V349.38A162.55 162.55 0 1 1 185 188.31V278.2a74.62 74.62 0 1 0 52.23 71.18V0l88 0a121.18 121.18 0 0 0 1.86 22.17h0A122.18 122.18 0 0 0 381 102.39a121.43 121.43 0 0 0 67 20.14Z" />
      </svg>
    ),
  },
  {
    id: 4,
    title: "Facebook",
    image: "/discoveries/card4.png",
    darkImage: "/discoveries/card4-dark-v2.png",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.5 2.5H18.75C17.0924 2.5 15.5027 3.15848 14.3306 4.33058C13.1585 5.50269 12.5 7.0924 12.5 8.75V12.5H8.75V17.5H12.5V27.5H17.5V17.5H21.25L22.5 12.5H17.5V8.75C17.5 8.41848 17.6317 8.10054 17.8661 7.86612C18.1005 7.6317 18.4185 7.5 18.75 7.5H22.5V2.5Z" fill="currentColor" />
      </svg>
    ),
  },
];

export function DiscoveriesBoard({ bare = false }: { bare?: boolean }) {
  const { isDark } = useTheme();
  const { trends } = useTrends();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const cards = (
    <div
      className={`relative z-10 w-full flex items-center overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-6 ${
        bare ? "-mx-8 px-8 md:mx-0 md:px-0" : "h-full px-8 md:px-12"
      }`}
    >
      {NETWORKS.map((item) => (
        <div
          key={item.id}
          onClick={() => {
            const targetNetwork = item.title.toLowerCase();
            const idx = trends.findIndex((t) => t.network === targetNetwork);
            if (idx !== -1) setOpenIndex(idx);
          }}
          className={`w-[368px] h-[299px] shrink-0 rounded-[24px] flex flex-col overflow-hidden snap-center border cursor-pointer hover:shadow-md transition-shadow relative ${
            isDark ? "bg-[#1A1A1A] border-white/5" : "bg-white border-black/5"
          }`}
        >
          <div className="p-6 pb-2 z-10">
            <div className="flex items-center gap-3">
              {item.icon}
              <h3 className="text-lg font-normal text-foreground">{item.title}</h3>
            </div>
          </div>
          <div className="flex-1 w-full mt-2 relative flex items-end justify-center z-0 overflow-hidden">
            <img
              src={item.image}
              alt={item.title}
              className={`absolute inset-0 w-full h-full object-contain object-bottom transition-opacity duration-500 ${isDark ? "opacity-0" : "opacity-100"}`}
            />
            {item.darkImage && (
              <img
                src={item.darkImage}
                alt={`${item.title} Dark`}
                className={`absolute inset-0 w-full h-full object-contain object-bottom transition-opacity duration-500 ${isDark ? "opacity-100" : "opacity-0"}`}
              />
            )}
          </div>
          {/* Gradient Overlay */}
          <div
            className="absolute bottom-0 left-0 w-full h-[48px] z-20 pointer-events-none"
            style={{
              background: isDark
                ? "linear-gradient(to bottom, rgba(26,26,26,0) 0%, rgba(26,26,26,1) 100%)"
                : "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)",
            }}
          />
        </div>
      ))}
    </div>
  );

  if (bare) {
    return (
      <div>
        {cards}
        <TrendStoryViewer trends={trends} startIndex={openIndex} onClose={() => setOpenIndex(null)} />
      </div>
    );
  }

  return (
    <div>
      <div
        className="relative w-full overflow-hidden rounded-[20px] md:rounded-[24px]"
        style={{
          height: "443px",
          background: isDark
            ? "linear-gradient(180deg, #121212 0%, #0A0A0A 100%)"
            : "linear-gradient(180deg, #FDFDFD 0%, #F8F9FD 100%)",
        }}
      >
        {/* Fondo de puntos con gradiente radial (recreando efecto Figma) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isDark
              ? "radial-gradient(circle at center, #2A2A2A 0%, rgba(140, 134, 162, 0.15) 59%, #121212 100%)"
              : "radial-gradient(circle at center, #FFFFFF 0%, rgba(140, 134, 162, 0.15) 59%, #FFFFFF 100%)",
            maskImage: "radial-gradient(circle, black 1px, transparent 1.5px)",
            maskSize: "20px 20px",
            WebkitMaskImage: "radial-gradient(circle, black 1px, transparent 1.5px)",
            WebkitMaskSize: "20px 20px",
          }}
        />

        {/* Contenido de descubrimientos irá aquí */}
        {cards}
      </div>

      <TrendStoryViewer trends={trends} startIndex={openIndex} onClose={() => setOpenIndex(null)} />
    </div>
  );
}
