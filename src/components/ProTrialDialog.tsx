import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ProTrialCodeForm from "@/components/ProTrialCodeForm";
import { PRO_TRIAL_PATH } from "@/lib/proTrial";

/** Pop-up from Afiliados: asks for the invitation code, then opens the special Pro login. */
const ProTrialDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] rounded-[32px] bg-white text-black border-0 p-8">
        <DialogHeader className="text-center sm:text-center items-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-miiles-pink-light text-black text-xs font-normal mb-2">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C12.3 8.8 15.2 11.7 24 12C15.2 12.3 12.3 15.2 12 24C11.7 15.2 8.8 12.3 0 12C8.8 11.7 11.7 8.8 12 0Z" /></svg>
            {t("protrial.badge")}
          </span>
          <DialogTitle className="text-2xl font-normal text-black">{t("protrial.codeTitle")}</DialogTitle>
          <DialogDescription className="text-sm text-miiles-gray-400 font-light">{t("protrial.codeSubtitle")}</DialogDescription>
        </DialogHeader>
        <div className="mt-2">
          <ProTrialCodeForm onValid={() => { onOpenChange(false); navigate(PRO_TRIAL_PATH); }} />
        </div>
        <p className="text-center text-xs text-miiles-gray-400 font-light">{t("protrial.fineprint")}</p>
      </DialogContent>
    </Dialog>
  );
};

export default ProTrialDialog;
