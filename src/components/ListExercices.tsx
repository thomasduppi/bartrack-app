import { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa";
import { getAllExercices } from "../API/exercices";
import { getProfilVbt } from "../API/profil_vbt";
import { createRm1User } from "../API/calculations";

type Exercice = {
  id_exercice: number;
  nom: string;
};

type ProfilVbtEntry = {
  id_utilisateur: number;
  id_exercice: number;
  current_1rm: number;
  slope: number;
  intercept: number;
  last_updated: string;
}


function getExerciceLabel(exercice: Exercice, index: number) {
  return exercice.nom || `Exercice ${index + 1}`;
}

function getExerciceKey(exercice: Exercice, index: number) {
  if (exercice.id_exercice !== undefined && exercice.id_exercice !== null) {
    return String(exercice.id_exercice);
  }
  return `${getExerciceLabel(exercice, index)}-${index}`;
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

      try {
        const [exercicesList, profilVbtList] = await Promise.all([
          getAllExercices(),
          getProfilVbt(),
        ]);

        if (isMounted) {
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
      await createRm1User({
        id_exercice: exerciceId,
        current_1rm: currentOneRm,
      });

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
