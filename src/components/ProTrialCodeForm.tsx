import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Ticket } from "lucide-react";
import { Input } from "@/components/ui/input";
import { checkProTrialCode, storeProTrialCode } from "@/lib/proTrial";

/** Invitation code step shown before the special Pro login. */
const ProTrialCodeForm = ({ onValid }: { onValid: (code: string) => void }) => {
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [invalid, setInvalid] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setChecking(true);
    setInvalid(false);
    const ok = await checkProTrialCode(code);
    setChecking(false);
    if (!ok) {
      setInvalid(true);
      return;
    }
    storeProTrialCode(code);
    onValid(code);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <Ticket size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-miiles-gray-400" />
        <Input
          type="text"
          autoFocus
          autoComplete="off"
          aria-label={t("protrial.codeLabel")}
          placeholder={t("protrial.codePlaceholder")}
          value={code}
          onChange={(e) => { setCode(e.target.value); setInvalid(false); }}
          className="pl-12 h-14 bg-transparent border-border rounded-full uppercase tracking-widest placeholder:normal-case placeholder:tracking-normal"
          required
        />
      </div>
      {invalid && <p role="alert" className="text-center text-sm text-red-500 font-light">{t("protrial.codeInvalid")}</p>}
      <div className="flex justify-center pt-2">
        <button
          type="submit"
          disabled={checking}
          className="w-auto px-10 min-w-[200px] h-12 rounded-full bg-black text-white font-medium hover:-translate-y-1 transition-transform disabled:opacity-50 disabled:pointer-events-none"
        >
          {checking ? <Loader2 size={18} className="animate-spin mx-auto" /> : t("protrial.codeContinue")}
        </button>
      </div>
    </form>
  );
};

export default ProTrialCodeForm;
