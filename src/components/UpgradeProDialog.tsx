import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { useAuth } from "@/contexts/AuthContext";
import { isPaymentsConfigured } from "@/lib/stripe";

interface UpgradeProDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpgradeProDialog({ open, onOpenChange }: UpgradeProDialogProps) {
  const { user } = useAuth();
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");
  const [started, setStarted] = useState(false);

  const priceId = cycle === "monthly" ? "pro_monthly" : "pro_yearly";

  const handleClose = (v: boolean) => {
    if (!v) setStarted(false);
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden gap-0 max-h-[90vh] overflow-y-auto">
        <PaymentTestModeBanner />
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-lg font-normal">Activar Plan Pro</DialogTitle>
        </DialogHeader>

        {!started ? (
          <div className="p-6 space-y-5">
            <div className="relative flex w-full p-1 bg-muted rounded-full">
              <button
                onClick={() => setCycle("monthly")}
                className={`relative z-10 flex-1 py-2.5 text-xs rounded-full transition-colors ${cycle === "monthly" ? "bg-foreground text-background" : "text-muted-foreground"}`}
              >
                Mensual · $179 MXN
              </button>
              <button
                onClick={() => setCycle("yearly")}
                className={`relative z-10 flex-1 py-2.5 text-xs rounded-full transition-colors ${cycle === "yearly" ? "bg-foreground text-background" : "text-muted-foreground"}`}
              >
                Anual · $1,800 MXN
              </button>
            </div>

            <ul className="space-y-2 text-sm font-light text-muted-foreground">
              <li>· Proyectos ilimitados</li>
              <li>· Colaboraciones ilimitadas</li>
              <li>· Analítica avanzada</li>
              <li>· Soporte prioritario</li>
            </ul>

            {isPaymentsConfigured() ? (
              <button
                onClick={() => setStarted(true)}
                className="w-full py-3.5 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Continuar al pago
              </button>
            ) : (
              <p className="text-sm text-center text-muted-foreground">
                Los pagos aún no están configurados para este entorno.
              </p>
            )}
          </div>
        ) : (
          <div className="p-4">
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
