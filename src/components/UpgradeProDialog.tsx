import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { useAuth } from "@/contexts/AuthContext";
import { isPaymentsConfigured } from "@/lib/stripe";
import PricingTable from "@/components/PricingTable";
import { useNavigate } from "react-router-dom";

interface UpgradeProDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpgradeProDialog({ open, onOpenChange }: UpgradeProDialogProps) {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");
  const [started, setStarted] = useState(false);

  const priceId = cycle === "monthly" ? "pro_monthly" : "pro_yearly";

  const handleClose = (v: boolean) => {
    if (!v) setStarted(false);
    onOpenChange(v);
  };

  const handlePlanSelect = (planName: string, selectedCycle: "monthly" | "annually") => {
    if (planName === "Gratis") {
      handleClose(false);
    } else if (planName === "Pro") {
      setCycle(selectedCycle === "monthly" ? "monthly" : "yearly");
      if (isPaymentsConfigured()) {
        setStarted(true);
      } else {
        alert("Los pagos aún no están configurados para este entorno.");
      }
    } else if (planName === "Negocios") {
      handleClose(false);
      navigate("/precios/negocios");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent hideClose className="max-w-5xl p-0 overflow-hidden gap-0 bg-background">
        <div className="absolute right-4 top-4 z-50">
          <button
            onClick={() => handleClose(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors text-sm font-medium shadow-sm ${
              isDark ? "bg-white/10 hover:bg-white/20 text-white backdrop-blur-md" : "bg-white/80 hover:bg-black/5 text-black border border-black/5 backdrop-blur-md"
            }`}
            aria-label="Cerrar"
          >
            <span>Cerrar</span>
            <X size={14} />
          </button>
        </div>
        
        <div className="max-h-[90vh] overflow-y-auto modal-scrollbar relative w-full flex flex-col">
          <PaymentTestModeBanner />
          {!started ? (
            <>
              <DialogHeader className="px-6 pt-10 pb-2 text-center shrink-0">
                <DialogTitle className="text-2xl font-normal text-center w-full">Elige tu plan</DialogTitle>
              </DialogHeader>
              <div className="shrink-0">
                <PricingTable onPlanSelect={handlePlanSelect} isModal />
              </div>
            </>
          ) : (
            <div className="px-4 py-12 md:px-12 md:py-16 min-h-[75vh] flex flex-col w-full shrink-0">
              <StripeEmbeddedCheckout
                priceId={priceId}
                userId={user?.id}
                customerEmail={user?.email}
                returnUrl={`${window.location.origin}/profile?checkout=success`}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
