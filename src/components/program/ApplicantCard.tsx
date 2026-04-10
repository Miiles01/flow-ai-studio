import { Instagram, Youtube } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const TikTokIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const XIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export type Applicant = {
  application_id: string;
  user_id: string;
  status: string;
  applied_at: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  instagram_handle: string | null;
  tiktok_handle: string | null;
  youtube_handle: string | null;
  twitter_handle: string | null;
  phone: string | null;
  portfolio_url: string | null;
  video_url_1: string | null;
  video_url_2: string | null;
  video_url_3: string | null;
  niche: string | null;
};

export default function ApplicantCard({
  applicant,
  onClick,
}: {
  applicant: Applicant;
  onClick: () => void;
}) {
  const initials = applicant.display_name?.charAt(0).toUpperCase() || "?";
  const socials = [
    applicant.instagram_handle && { icon: Instagram, handle: applicant.instagram_handle },
    applicant.tiktok_handle && { icon: TikTokIcon, handle: applicant.tiktok_handle },
    applicant.youtube_handle && { icon: Youtube, handle: applicant.youtube_handle },
    applicant.twitter_handle && { icon: XIcon, handle: applicant.twitter_handle },
  ].filter(Boolean) as { icon: any; handle: string }[];

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-5 rounded-xl bg-gradient-to-r from-[#FDFDFD] to-[#F8F9FD] hover:shadow-md transition-all duration-200 space-y-3"
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          {applicant.avatar_url && <AvatarImage src={applicant.avatar_url} alt={applicant.display_name || ""} />}
          <AvatarFallback className="bg-foreground text-background text-sm">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-sm font-normal truncate">{applicant.display_name || "Sin nombre"}</p>
          {applicant.niche && (
            <span className="text-[10px] text-miiles-blue font-light">{applicant.niche}</span>
          )}
        </div>
      </div>
      {socials.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          {socials.map(({ icon: Icon, handle }, i) => (
            <span key={i} className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-light">
              <Icon size={12} />
              {handle}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
