import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
      <DialogContent className="max-w-5xl p-0 overflow-hidden gap-0 max-h-[90vh] overflow-y-auto panel-scrollbar">
        <PaymentTestModeBanner />
        {!started ? (
          <>
            <DialogHeader className="px-6 pt-8 pb-4 text-center">
              <DialogTitle className="text-2xl font-normal text-center w-full">Elige tu plan</DialogTitle>
            </DialogHeader>
            <div className="pb-8">
              <PricingTable onPlanSelect={handlePlanSelect} />
            </div>
          </>
        ) : (
          <div className="p-4 h-[80vh]">
            <StripeEmbeddedCheckout
              priceId={priceId}
              userId={user?.id}
              customerEmail={user?.email}
              returnUrl={`${window.location.origin}/profile?checkout=success`}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
