import { useCallback, useEffect, useState } from "react";
import {
  AIProviderId,
  UserModel,
  readUserModels,
  subscribeUserModels,
  writeUserModels,
} from "@/lib/aiModels";

export function useUserModels() {
  const [models, setModels] = useState<UserModel[]>(() => readUserModels());

  useEffect(() => subscribeUserModels(() => setModels(readUserModels())), []);

  const addModel = useCallback((provider: AIProviderId, model: string, apiKey: string) => {
    const current = readUserModels();
    const entry: UserModel = {
      id: `m_${Date.now().toString(36)}`,
      provider,
      model,
      apiKey,
      enabled: true,
      createdAt: Date.now(),
    };
    // Solo un modelo activo a la vez para evitar ambigüedad.
    const next = [...current.map((m) => ({ ...m, enabled: false })), entry];
    writeUserModels(next);
  }, []);

  const toggleModel = useCallback((id: string, enabled: boolean) => {
    const next = readUserModels().map((m) =>
      m.id === id ? { ...m, enabled } : enabled ? { ...m, enabled: false } : m
    );
    writeUserModels(next);
  }, []);

  const deleteModel = useCallback((id: string) => {
    writeUserModels(readUserModels().filter((m) => m.id !== id));
  }, []);

  return { models, addModel, toggleModel, deleteModel };
}
