import brand1 from "@/assets/miiles/brands/brand1.svg";
import brand2 from "@/assets/miiles/brands/brand2.svg";
import brand3 from "@/assets/miiles/brands/brand3.svg";
import brand4 from "@/assets/miiles/brands/brand4.svg";
import brand5 from "@/assets/miiles/brands/brand5.svg";
import brand6 from "@/assets/miiles/brands/brand6.svg";

const brandLogos = [brand1, brand2, brand3, brand4, brand5, brand6];

// Carrusel "Elegido por" del home
const BrandCarousel = () => (
  <div className="w-full">
    <h4 className="text-center text-xs font-light text-black/80 dark:text-white/85 mb-6 md:mb-8 tracking-widest">
      Elegido por
    </h4>
    <div className="px-[10%] md:px-[20%]">
      <div
        className="relative w-full overflow-hidden"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
        }}
      >
        <div className="flex w-max animate-marquee gap-20 items-center">
          {[...brandLogos, ...brandLogos].map((logo, i) => (
            <img
              key={i}
              src={logo}
              alt=""
              className="h-6 md:h-7 w-auto shrink-0 dark:[filter:invert(1)_brightness(1.8)]"
            />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default BrandCarousel;
