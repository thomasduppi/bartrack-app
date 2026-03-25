import { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa";
import { API_BASE_URL } from "../config";

type Exercice = {
  id_exercice?: number | string;
  nom_exercice?: string;
  nom?: string;
  libelle?: string;
  [key: string]: unknown;
};

type ProfilVbtEntry = {
  id_exercice?: number | string;
  current_1rm?: number | string;
  [key: string]: unknown;
};



function getCookie(name: string) {
  const encodedName = `${encodeURIComponent(name)}=`;
  const parts = document.cookie.split(";").map((part) => part.trim());
  const match = parts.find((part) => part.startsWith(encodedName));
  if (!match) return "";
  return decodeURIComponent(match.slice(encodedName.length));
}

function getExerciceLabel(exercice: Exercice, index: number) {
  return (
    (typeof exercice.nom_exercice === "string" && exercice.nom_exercice) ||
    (typeof exercice.nom === "string" && exercice.nom) ||
    (typeof exercice.libelle === "string" && exercice.libelle) ||
    `Exercice ${index + 1}`
  );
}

function getExerciceKey(exercice: Exercice, index: number) {
  if (exercice.id_exercice !== undefined && exercice.id_exercice !== null) {
    return String(exercice.id_exercice);
  }
  return `${getExerciceLabel(exercice, index)}-${index}`;
}

function extractArrayPayload(value: unknown) {
  if (Array.isArray(value)) return value;
  if (
    typeof value === "object" &&
    value !== null &&
    "data" in value &&
    Array.isArray((value as { data?: unknown }).data)
  ) {
    return (value as { data: unknown[] }).data;
  }
  return [];
}

function buildOneRmMap(exercicesList: Exercice[], profilVbtList: ProfilVbtEntry[]) {
  const currentOneRmByExerciceId: Record<string, string> = {};

  profilVbtList.forEach((entry) => {
    if (entry.id_exercice === undefined || entry.id_exercice === null) return;
    if (entry.current_1rm === undefined || entry.current_1rm === null) return;
    const key = String(entry.id_exercice);
    currentOneRmByExerciceId[key] = String(entry.current_1rm);
  });

  const oneRmMap: Record<string, string> = {};
  exercicesList.forEach((exercice, index) => {
    const key = getExerciceKey(exercice, index);
    if (currentOneRmByExerciceId[key] !== undefined) {
      oneRmMap[key] = currentOneRmByExerciceId[key];
    }
  });

  return oneRmMap;
}

export function ListExercices() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [exercices, setExercices] = useState<Exercice[]>([]);
  const [oneRmByExercice, setOneRmByExercice] = useState<Record<string, string>>({});
  const [saveStatusByExercice, setSaveStatusByExercice] = useState<Record<string, "idle" | "loading" | "success" | "error">>({});
  const [saveErrorByExercice, setSaveErrorByExercice] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;

    async function loadExercices() {
      setStatus("loading");
      setError("");

      const token = getCookie("token");
      if (!token) {
        if (isMounted) {
          setStatus("error");
          setError("Session invalide. Reconnectez-vous.");
        }
        return;
      }

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const [exercicesRes, profilVbtRes] = await Promise.all([
          fetch(`${API_BASE_URL}/exercices`, {
            method: "GET",
            headers,
          }),
          fetch(`${API_BASE_URL}/profil_vbt`, {
            method: "GET",
            headers,
          }),
        ]);

        const exercicesData = await exercicesRes.json().catch(() => null);
        if (!exercicesRes.ok) {
          const message =
            typeof exercicesData?.detail === "string" ? exercicesData.detail : "Impossible de charger les exercices.";
          throw new Error(message);
        }

        if (isMounted) {
          const exercicesList = extractArrayPayload(exercicesData) as Exercice[];
          let profilVbtList: ProfilVbtEntry[] = [];

          if (profilVbtRes.ok) {
            const profilVbtData = await profilVbtRes.json().catch(() => null);
            profilVbtList = extractArrayPayload(profilVbtData) as ProfilVbtEntry[];
          }

          setExercices(exercicesList);
          setOneRmByExercice(buildOneRmMap(exercicesList, profilVbtList));
          setStatus("success");
        }
      } catch (err) {
        if (!isMounted) return;
        setStatus("error");
        setError(err instanceof Error ? err.message : "Erreur lors du chargement des exercices.");
      }
    }

    void loadExercices();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleValidateOneRm(exercice: Exercice, key: string) {
    setSaveStatusByExercice((prev) => ({ ...prev, [key]: "loading" }));
    setSaveErrorByExercice((prev) => ({ ...prev, [key]: "" }));

    const token = getCookie("token");
    if (!token) {
      setSaveStatusByExercice((prev) => ({ ...prev, [key]: "error" }));
      setSaveErrorByExercice((prev) => ({ ...prev, [key]: "Session invalide. Reconnectez-vous." }));
      return;
    }

    const exerciceId = Number(exercice.id_exercice);
    const currentOneRm = Number(oneRmByExercice[key]);

    if (!Number.isFinite(exerciceId)) {
      setSaveStatusByExercice((prev) => ({ ...prev, [key]: "error" }));
      setSaveErrorByExercice((prev) => ({ ...prev, [key]: "id_exercice manquant pour cet exercice." }));
      return;
    }

    if (!Number.isFinite(currentOneRm) || currentOneRm <= 0) {
      setSaveStatusByExercice((prev) => ({ ...prev, [key]: "error" }));
      setSaveErrorByExercice((prev) => ({ ...prev, [key]: "Entrez un 1RM valide." }));
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/rm1_users`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_exercice: exerciceId,
          current_1rm: currentOneRm,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const message = typeof data?.detail === "string" ? data.detail : "Impossible d'enregistrer le 1RM.";
        throw new Error(message);
      }

      setSaveStatusByExercice((prev) => ({ ...prev, [key]: "success" }));
    } catch (err) {
      setSaveStatusByExercice((prev) => ({ ...prev, [key]: "error" }));
      setSaveErrorByExercice((prev) => ({
        ...prev,
        [key]: err instanceof Error ? err.message : "Erreur lors de l'enregistrement du 1RM.",
      }));
    }
  }

  return (
    <>
      <div className="mb-5 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25">
        Mes exercices
        <span className="h-px flex-1 bg-white/[0.07]" />
      </div>

      <p className="mb-5 text-sm text-white/55">
        Renseigne le poids maximal que tu peux soulever sur 1 répétition (1RM) pour chaque exercice.
      </p>

      {status === "loading" ? (
        <p className="text-sm text-white/45">Chargement des exercices…</p>
      ) : null}

      {status === "error" ? (
        <div className="rounded-2xl border border-red-400/15 bg-red-500/[0.06] px-5 py-4 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      {status === "success" && exercices.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-6 text-sm text-white/45">
          Aucun exercice à afficher pour le moment.
        </div>
      ) : null}

      {status === "success" && exercices.length > 0 ? (
        <div className="space-y-4">
          {exercices.map((exercice, index) => {
            const key = getExerciceKey(exercice, index);
            const saveStatus = saveStatusByExercice[key] ?? "idle";
            const saveError = saveErrorByExercice[key] ?? "";
            return (
              <div key={key} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-white">{getExerciceLabel(exercice, index)}</p>
                  <div className="flex items-end gap-2">
                    <div className="relative w-28">
                      <input
                        value={oneRmByExercice[key] ?? ""}
                        onChange={(e) =>
                          setOneRmByExercice((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }))
                        }
                        inputMode="decimal"
                        className="w-full bg-transparent border-b border-white/10 pb-2 pt-1 pr-7 text-right text-[15px] font-medium text-white placeholder-white/25 outline-none transition-colors duration-200 focus:border-cyan-400"
                      />
                      <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[11px] font-semibold tracking-wide text-white">
                        KG
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleValidateOneRm(exercice, key)}
                      disabled={saveStatus === "loading"}
                      className={[
                        "mb-0.5 flex h-8 w-8 items-center justify-center rounded-lg border transition",
                        saveStatus === "loading"
                          ? "cursor-not-allowed border-white/10 bg-white/5 text-white/30"
                          : saveStatus === "success"
                            ? "border-green-400/30 bg-green-500/20 text-green-400"
                            : "border-white/10 bg-white/5 text-white hover:bg-white/10",
                      ].join(" ")}
                      aria-label="Valider le 1RM"
                      title="Valider le 1RM"
                    >
                      <FaCheck className="text-xs" />
                    </button>
                  </div>
                </div>
                {saveError ? <p className="mt-2 text-xs text-red-400">{saveError}</p> : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </>
  );
}
