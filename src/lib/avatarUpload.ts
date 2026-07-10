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

  // Bucket is private: generate a long-lived signed URL (1 year).
  const { data, error: signErr } = await supabase.storage
    .from("avatars")
    .createSignedUrl(path, 60 * 60 * 24 * 365);

  if (signErr || !data) throw signErr ?? new Error("Failed to sign avatar URL");

  // Add cache buster
  return `${data.signedUrl}&t=${Date.now()}`;
}
