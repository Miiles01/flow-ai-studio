import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { uploadAvatar } from "@/lib/avatarUpload";
import { toast } from "sonner";

type Props = {
  userId: string;
  avatarUrl: string;
  fallback: string;
  onUploaded: (url: string) => void;
  size?: "sm" | "lg";
};

export default function AvatarUpload({ userId, avatarUrl, fallback, onUploaded, size = "lg" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const dim = size === "lg" ? "h-20 w-20" : "h-16 w-16";

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten imágenes");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadAvatar(userId, file);
      onUploaded(url);
      toast.success("Foto actualizada");
    } catch {
      toast.error("Error al subir la foto");
    }
    setUploading(false);
  };

  return (
    <div className="relative group cursor-pointer" onClick={() => inputRef.current?.click()}>
      <Avatar className={dim}>
        {avatarUrl && <AvatarImage src={avatarUrl} alt="Avatar" />}
        <AvatarFallback className="bg-foreground text-background text-lg">{fallback}</AvatarFallback>
      </Avatar>
      <div className="absolute inset-0 rounded-full bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        {uploading ? (
          <Loader2 size={18} className="animate-spin text-background" />
        ) : (
          <Camera size={18} className="text-background" />
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}
