import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import logoImg from "@/assets/logo.png";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const Landing = () => {
  return (
    <div className="min-h-screen bg-white text-black font-sans overflow-x-hidden">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 bg-white/80 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoImg} alt="Miiles" className="w-7 h-7" />
          <span className="font-normal text-base tracking-tight">Miiles</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-light">
          <Link to="/" className="hover:opacity-60 transition-opacity">Inicio</Link>
          <a href="#funciones" className="hover:opacity-60 transition-opacity">Funciones IA</a>
          <a href="#sobre" className="hover:opacity-60 transition-opacity">Sobre</a>
          <a href="#blog" className="hover:opacity-60 transition-opacity">Blog</a>
        </div>

        <Link
          to="/register"
          className="text-sm font-light px-5 py-2 rounded-full bg-black text-white hover:-translate-y-1 transition-transform duration-200"
        >
          Prueba gratis
        </Link>
      </nav>

      {/* HERO */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20">
        <motion.div
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto"
        >
          <motion.p
            variants={fadeUp}
            custom={0}
            className="text-xs font-light tracking-widest uppercase text-gray-400 mb-8"
          >
            Plataforma de colaboraciones
          </motion.p>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="text-6xl md:text-8xl lg:text-9xl font-normal leading-none tracking-tight mb-8"
          >
            Trabaja más
            <br />
            <span
              className="inline-block"
              style={{ background: "linear-gradient(135deg, #FCB5B9 0%, #B8A4F8 50%, #4059F1 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
            >
              inteligente
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="text-lg font-light text-gray-500 max-w-xl mx-auto mb-12"
          >
            En Miiles encontrarás oportunidades únicas para impulsar tu marca y hacer que otros vendedores en todo el mundo también ofrezcan lo tuyo.
          </motion.p>

          <motion.div
            variants={fadeUp}
            custom={3}
            className="flex items-center justify-center gap-4 flex-wrap"
          >
            <Link
              to="/register"
              className="px-8 py-4 rounded-full bg-black text-white text-sm font-light hover:-translate-y-2 transition-transform duration-300"
            >
              Prueba gratis
            </Link>
            <a
              href="#funciones"
              className="px-8 py-4 rounded-full border border-gray-200 text-sm font-light hover:-translate-y-2 transition-transform duration-300"
            >
              Ver funciones →
            </a>
          </motion.div>
        </motion.div>

        {/* gradient blob */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl pointer-events-none -z-10"
          style={{ background: "linear-gradient(135deg, #FCB5B9 0%, #B8A4F8 50%, #4059F1 100%)" }}
        />
      </section>

      {/* VALUE PROP */}
      <section className="py-32 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-5xl mx-auto"
        >
          <motion.p
            variants={fadeUp}
            className="text-xs font-light tracking-widest uppercase text-gray-400 mb-6"
          >
            Por qué Miiles
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="text-5xl md:text-7xl font-normal leading-tight tracking-tight"
          >
            Un sistema.
            <br />
            <span
              style={{ background: "linear-gradient(135deg, #FCB5B9 0%, #B8A4F8 50%, #4059F1 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
            >
              Más ganancias.
            </span>
          </motion.h2>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section id="funciones" className="py-24 px-6 bg-[#F8F9FD]">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            className="bg-white rounded-3xl p-10"
          >
            <div
              className="w-10 h-10 rounded-2xl mb-6"
              style={{ background: "linear-gradient(135deg, #FCB5B9, #B8A4F8)" }}
            />
            <h3 className="text-2xl font-normal mb-3">Encuentra colaboraciones</h3>
            <p className="text-sm font-light text-gray-500 leading-relaxed">
              En Miiles encontrarás oportunidades únicas para impulsar tu marca con las personas correctas en el momento correcto.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            custom={1}
            className="bg-white rounded-3xl p-10"
          >
            <div
              className="w-10 h-10 rounded-2xl mb-6"
              style={{ background: "linear-gradient(135deg, #B8A4F8, #4059F1)" }}
            />
            <h3 className="text-2xl font-normal mb-3">Fuerza de ventas global</h3>
            <p className="text-sm font-light text-gray-500 leading-relaxed">
              Si tu marca vende servicios o productos, haz que otros vendedores en todo el mundo también los ofrezcan. Sin fricción.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            custom={2}
            className="bg-white rounded-3xl p-10 md:col-span-2"
          >
            <div
              className="w-10 h-10 rounded-2xl mb-6"
              style={{ background: "linear-gradient(135deg, #FCB5B9, #4059F1)" }}
            />
            <h3 className="text-2xl font-normal mb-3">Haz que tu idea suene</h3>
            <p className="text-sm font-light text-gray-500 leading-relaxed max-w-lg">
              Haz que tu idea suene con fuerza de ventas. Conecta tu propuesta con una red que ya está lista para moverla.
            </p>
          </motion.div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="py-32 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="max-w-3xl mx-auto text-center"
        >
          <motion.p
            variants={fadeUp}
            className="text-3xl md:text-5xl font-normal leading-tight mb-10"
          >
            "Luce realmente asombroso"
          </motion.p>
          <motion.div variants={fadeUp} custom={1} className="flex items-center justify-center gap-3">
            <div
              className="w-10 h-10 rounded-full"
              style={{ background: "linear-gradient(135deg, #FCB5B9, #B8A4F8)" }}
            />
            <div className="text-left">
              <p className="text-sm font-normal">Karol Wegner</p>
              <p className="text-xs font-light text-gray-400">CEO de BeeSpeaker</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.h2
            variants={fadeUp}
            className="text-5xl md:text-7xl font-normal leading-tight tracking-tight mb-10"
          >
            Vamos a construir
            <br />tu nuevo negocio
            <br />
            <span
              style={{ background: "linear-gradient(135deg, #FCB5B9 0%, #B8A4F8 50%, #4059F1 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
            >
              automatizado
            </span>
          </motion.h2>

          <motion.div variants={fadeUp} custom={1}>
            <Link
              to="/register"
              className="inline-block px-10 py-5 rounded-full bg-black text-white text-sm font-light hover:-translate-y-2 transition-transform duration-300"
            >
              Prueba Miiles gratis
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 py-10 px-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="Miiles" className="w-6 h-6" />
            <span className="text-sm font-light">© 2025 Miiles</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://www.tiktok.com/@wearemiiles"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-light text-gray-500 hover:text-black transition-colors"
            >
              TikTok
            </a>
            <a
              href="https://www.threads.net/@wearemiiles"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-light text-gray-500 hover:text-black transition-colors"
            >
              Threads
            </a>
            <a
              href="https://www.instagram.com/wearemiiles"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-light text-gray-500 hover:text-black transition-colors"
            >
              Instagram
            </a>
            <a href="#" className="text-sm font-light text-gray-500 hover:text-black transition-colors">
              Términos y condiciones
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
