import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Instagram, Youtube, Globe } from "lucide-react";
import type { Applicant } from "./ApplicantCard";

const TikTokIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const XIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

function getVideoEmbedUrl(url: string): string | null {
  if (!url.trim()) return null;
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const ttMatch = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
  if (ttMatch) return `https://www.tiktok.com/embed/v2/${ttMatch[1]}`;
  const igMatch = url.match(/instagram\.com\/(?:reel|p)\/([a-zA-Z0-9_-]+)/);
  if (igMatch) return `https://www.instagram.com/p/${igMatch[1]}/embed`;
  return null;
}

function getSocialUrl(label: string, value: string): string {
  if (label === "Instagram") return `https://instagram.com/${value.replace(/^@/, "")}`;
  if (label === "TikTok") return `https://tiktok.com/@${value.replace(/^@/, "")}`;
  if (label === "YouTube") return `https://youtube.com/@${value.replace(/^@/, "")}`;
  if (label === "X") return `https://x.com/${value.replace(/^@/, "")}`;
  if (label === "Portafolio") return value.startsWith("http") ? value : `https://${value}`;
  return "#";
}

export default function ApplicantProfile({
  applicant,
  open,
  onOpenChange,
}: {
  applicant: Applicant | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  if (!applicant) return null;
  const initials = applicant.display_name?.charAt(0).toUpperCase() || "?";
  const videos = [applicant.video_url_1, applicant.video_url_2, applicant.video_url_3].filter(Boolean) as string[];

  const socials = [
    applicant.instagram_handle && { icon: Instagram, label: "Instagram", value: applicant.instagram_handle },
    applicant.tiktok_handle && { icon: TikTokIcon, label: "TikTok", value: applicant.tiktok_handle },
    applicant.youtube_handle && { icon: Youtube, label: "YouTube", value: applicant.youtube_handle },
    applicant.twitter_handle && { icon: XIcon, label: "X", value: applicant.twitter_handle },
    applicant.portfolio_url && { icon: Globe, label: "Portafolio", value: applicant.portfolio_url },
  ].filter(Boolean) as { icon: any; label: string; value: string }[];

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      <SheetContent side="right" className="w-full sm:w-[500px] sm:max-w-none overflow-y-auto border-l border-border/40 bg-background/95 backdrop-blur-sm shadow-none" onInteractOutside={(e) => e.preventDefault()}>
        <SheetHeader>
          <SheetTitle className="font-normal">Perfil del postulante</SheetTitle>
        </SheetHeader>
        <div className="space-y-6 mt-4">
          {/* Info personal */}
          <div>
            <p className="text-[10px] text-muted-foreground font-light uppercase tracking-wider mb-3">Información personal</p>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {applicant.avatar_url && <AvatarImage src={applicant.avatar_url} alt={applicant.display_name || ""} />}
                <AvatarFallback className="bg-foreground text-background text-lg">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-normal">{applicant.display_name || "Sin nombre"}</p>
                {applicant.niche && (
                  <Badge variant="secondary" className="text-xs font-light mt-1">{applicant.niche}</Badge>
                )}
              </div>
            </div>
          </div>
            </div>
          </div>

          {/* Bio */}
          {applicant.bio && (
            <div>
              <p className="text-[10px] text-muted-foreground font-light uppercase tracking-wider mb-1">Bio</p>
              <p className="text-sm font-light leading-relaxed">{applicant.bio}</p>
            </div>
          )}

          {/* Socials */}
          {socials.length > 0 && (
            <div>
              <p className="text-[10px] text-muted-foreground font-light uppercase tracking-wider mb-2">Redes sociales</p>
              <div className="space-y-2">
                {socials.map(({ icon: Icon, label, value }, i) => (
                  <a
                    key={i}
                    href={getSocialUrl(label, value)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-light hover:text-primary transition-colors"
                  >
                    <Icon size={14} className="text-muted-foreground flex-shrink-0" />
                    <span className="text-muted-foreground text-xs w-16">{label}</span>
                    <span className="truncate">{value}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Videos */}
          {videos.length > 0 && (
            <div>
              <p className="text-[10px] text-muted-foreground font-light uppercase tracking-wider mb-2">Portafolio de videos</p>
              <div className="grid grid-cols-2 gap-3">
                {videos.map((url, i) => {
                  const embed = getVideoEmbedUrl(url);
                  return embed ? (
                    <div key={i} className="aspect-[9/16] rounded-lg overflow-hidden bg-muted">
                      <iframe src={embed} className="w-full h-full" allowFullScreen title={`Video ${i + 1}`} />
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}

          <p className="text-[10px] text-muted-foreground font-light">
            Postulado el {new Date(applicant.applied_at).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
