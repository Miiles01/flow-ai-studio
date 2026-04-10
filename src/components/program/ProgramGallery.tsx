import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, X, Loader2, ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Props = {
  programId: string;
  images: string[];
  isAdmin: boolean;
  onUpdate: (images: string[]) => void;
};

export default function ProgramGallery({ programId, images, isAdmin, onUpdate }: Props) {
  const [adding, setAdding] = useState(false);
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  async function addImage() {
    if (!url.trim()) return;
    setSaving(true);
    const newImages = [...images, url.trim()];
    const { error } = await supabase
      .from("brand_programs")
      .update({ gallery_images: newImages } as any)
      .eq("id", programId);
    if (!error) {
      onUpdate(newImages);
      setUrl("");
      setAdding(false);
      toast.success("Imagen añadida");
    } else {
      toast.error("Error al añadir imagen");
    }
    setSaving(false);
  }

  async function removeImage(index: number) {
    const newImages = images.filter((_, i) => i !== index);
    const { error } = await supabase
      .from("brand_programs")
      .update({ gallery_images: newImages } as any)
      .eq("id", programId);
    if (!error) {
      onUpdate(newImages);
      toast.success("Imagen eliminada");
    } else {
      toast.error("Error al eliminar imagen");
    }
  }

  if (images.length === 0 && !isAdmin) return null;

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ImageIcon size={16} className="text-miiles-gray-400" />
          <h3 className="text-sm font-normal">Galería</h3>
        </div>
        {isAdmin && !adding && (
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1 text-xs text-miiles-blue font-light hover:underline"
          >
            <Plus size={14} />
            Añadir imagen
          </button>
        )}
      </div>

      {/* Add form */}
      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="flex gap-2">
              <Input
                placeholder="URL de la imagen..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 text-sm"
              />
              <Button size="sm" onClick={addImage} disabled={saving || !url.trim()}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : "Añadir"}
              </Button>
              <Button size="sm" variant="secondary" onClick={() => { setAdding(false); setUrl(""); }}>
                Cancelar
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {images.map((img, i) => (
          <motion.div
            key={`${img}-${i}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="relative group rounded-sm overflow-hidden cursor-pointer aspect-[4/3]"
            onClick={() => setLightbox(img)}
          >
            <img
              src={img}
              alt={`Galería ${i + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            {isAdmin && (
              <button
                onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {images.length === 0 && isAdmin && (
        <p className="text-xs text-miiles-gray-400 font-light text-center py-8">
          No hay imágenes en la galería
        </p>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8"
            onClick={() => setLightbox(null)}
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={lightbox}
              alt="Vista ampliada"
              className="max-w-full max-h-full object-contain rounded-md"
            />
            <button
              className="absolute top-6 right-6 text-white/80 hover:text-white"
              onClick={() => setLightbox(null)}
            >
              <X size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
