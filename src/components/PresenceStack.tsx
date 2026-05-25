import { motion } from "framer-motion";
import type { PresenceUser } from "@/hooks/useFlowRealtime";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { QuickSettings } from "./QuickSettings";
import { Settings } from "lucide-react";

const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const PresenceStack = ({ users, localUserId }: { users: PresenceUser[], localUserId?: string }) => {
  if (users.length === 0) return null;
  const sortedUsers = [...users].sort((a, b) => a.id === localUserId ? -1 : b.id === localUserId ? 1 : 0);
  const visible = sortedUsers.slice(0, 5);
  const overflow = sortedUsers.length - visible.length;

  return (
    <div className="flex items-center -space-x-2 pointer-events-auto px-2 py-1.5 rounded-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      {visible.map((u, i) => {
        const isLocal = u.id === localUserId;
        
        const avatarContent = (
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`relative w-7 h-7 rounded-full ring-2 ring-white overflow-hidden flex items-center justify-center text-[10px] font-medium text-white group ${isLocal ? 'cursor-pointer' : ''}`}
            style={{ backgroundColor: u.color, zIndex: visible.length - i }}
          >
            {u.avatar_url ? (
              <img src={u.avatar_url} alt={u.display_name} className="w-full h-full object-cover" />
            ) : (
              <span>{initials(u.display_name)}</span>
            )}
            {isLocal && (
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Settings size={14} className="text-white drop-shadow-md" />
              </div>
            )}
          </motion.div>
        );

        if (isLocal) {
          return (
            <QuickSettings key={u.id + i}>
              <button className="outline-none focus:outline-none">{avatarContent}</button>
            </QuickSettings>
          );
        }

        return (
          <Tooltip key={u.id + i}>
            <TooltipTrigger asChild>
              {avatarContent}
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={8} className="text-[12px] bg-black text-white border-none rounded-full px-3 py-1.5 font-light">
              {u.display_name}{u.is_anon ? " (invitado)" : ""}
            </TooltipContent>
          </Tooltip>
        );
      })}
      {overflow > 0 && (
        <div className="w-7 h-7 rounded-full ring-2 ring-white bg-[#F3F4F6] text-[10px] flex items-center justify-center text-[#6B7280] font-medium">
          +{overflow}
        </div>
      )}
    </div>
  );
};

export default PresenceStack;
