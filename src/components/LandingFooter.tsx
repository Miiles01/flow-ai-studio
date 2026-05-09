import { Link } from "react-router-dom";
import logotipoSvg from "@/assets/miiles/logotipo.svg";

const LandingFooter = () => {
  return (
    <footer className="pt-24 pb-0 bg-white border-t border-gray-50">
      <div className="max-w-7xl mx-auto px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 mb-24">
          {/* Left side */}
          <div className="flex flex-col justify-between h-full min-h-[200px]">
            <h2 className="text-3xl font-normal leading-tight max-w-xs text-black">
              Diseñado para mentes creativas
            </h2>
            <p className="text-[10px] md:text-xs font-light text-gray-400 mt-10 md:mt-0">
              © Miiles, todos los derechos reservados, 2026
            </p>
          </div>

          {/* Right side */}
          <div className="flex gap-20 md:gap-40">
            <div className="space-y-6">
              <h4 className="text-[10px] font-normal text-gray-400 uppercase tracking-widest">Compañía</h4>
              <div className="flex flex-col gap-4 text-sm font-light text-black">
                <Link to="/" className="hover:opacity-50 transition-opacity">Términos y condiciones</Link>
                <Link to="/" className="hover:opacity-50 transition-opacity">Política de privacidad</Link>
              </div>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-normal text-gray-400 uppercase tracking-widest">Redes Sociales</h4>
              <div className="flex flex-col gap-4 text-sm font-light text-black">
                <a href="https://instagram.com/wearemiiles" target="_blank" rel="noopener noreferrer" className="hover:opacity-50 transition-opacity">Instagram</a>
                <a href="https://tiktok.com/@wearemiiles" target="_blank" rel="noopener noreferrer" className="hover:opacity-50 transition-opacity">Tiktok</a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-50 transition-opacity">Youtube</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* logotipo grande */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-10 flex justify-center mt-12">
        <img src={logotipoSvg} alt="miiles" className="w-full h-auto object-contain object-center block mx-auto" />
      </div>
    </footer>
  );
};

export default LandingFooter;
