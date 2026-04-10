import { supabase } from "@/integrations/supabase/client";

const MAX_SIZE = 400;

async function resizeImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let w = img.width;
      let h = img.height;
      if (w > h) {
        if (w > MAX_SIZE) { h = (h * MAX_SIZE) / w; w = MAX_SIZE; }
      } else {
        if (h > MAX_SIZE) { w = (w * MAX_SIZE) / h; h = MAX_SIZE; }
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Failed to compress"))),
        "image/webp",
        0.8
      );
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const blob = await resizeImage(file);
  const path = `${userId}/avatar.webp`;

  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, blob, { contentType: "image/webp", upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  // Add cache buster
  return `${data.publicUrl}?t=${Date.now()}`;
}
