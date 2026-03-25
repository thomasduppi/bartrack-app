import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAllExercices } from "../../API/exercices";
import { FaCheck, FaArrowLeft } from "react-icons/fa";

export interface Exercice {
  id_exercice: number;
  nom: string;
}

export function AddExercices() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [exercices, setExercices] = useState<Exercice[]>([]);
  const [selectedExercices, setSelectedExercices] = useState<number[]>([]);

  // Load initial selected exercices from location state if available
  useEffect(() => {
    const state = location.state as { selectedExercices?: number[] } | null;
    if (state?.selectedExercices) {
      setSelectedExercices(state.selectedExercices);
    }
  }, [location.state]);

  // Load exercices
  useEffect(() => {
    let isMounted = true;

    async function loadExercices() {
      setStatus("loading");
      setError("");

      try {
        const exercicesList = await getAllExercices();
        if (isMounted) {
          setExercices(exercicesList);
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

  function toggleExercice(id: number) {
    if (selectedExercices.includes(id)) {
      setSelectedExercices(selectedExercices.filter((exId) => exId !== id));
    } else {
      setSelectedExercices([...selectedExercices, id]);
    }
  }

  function handleValidate() {
    navigate("/app/programme/creer", {
      state: { selectedExercices },
    });
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-[380px] w-[380px] rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-[420px] w-[420px] rounded-full bg-teal-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(255,255,255,0.08),transparent_45%)]" />
      </div>

      <div className="relative mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition"
            aria-label="Retour"
          >
            <FaArrowLeft className="text-sm" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Sélectionner les exercices</h1>
            <p className="mt-1 text-sm text-white/70">Choisis les exercices que tu veux ajouter à ton programme.</p>
          </div>
        </div>

        {/* Loading */}
        {status === "loading" ? (
          <p className="text-sm text-white/45">Chargement des exercices…</p>
        ) : null}

        {/* Error */}
        {status === "error" ? (
          <div className="rounded-2xl border border-red-400/15 bg-red-500/[0.06] px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        {/* Empty state */}
        {status === "success" && exercices.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-6 text-sm text-white/45">
            Aucun exercice disponible.
          </div>
        ) : null}

        {/* Exercices list */}
        {status === "success" && exercices.length > 0 ? (
          <div className="space-y-3">
            {exercices.map((exercice, index) => {
              const isSelected = selectedExercices.includes(exercice.id_exercice);
              return (
                <div
                  key={`${exercice.id_exercice}-${index}`}
                  onClick={() => toggleExercice(exercice.id_exercice)}
                  className={[
                    "flex items-center gap-4 rounded-xl border p-4 cursor-pointer transition",
                    isSelected
                      ? "border-cyan-400/50 bg-cyan-500/10"
                      : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05]",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "flex h-6 w-6 items-center justify-center rounded-lg border transition",
                      isSelected
                        ? "border-cyan-400/50 bg-cyan-500/20 text-cyan-400"
                        : "border-white/10 bg-white/5",
                    ].join(" ")}
                  >
                    {isSelected ? <FaCheck className="text-xs" /> : null}
                  </div>
                  <span className="text-sm font-semibold">{exercice.nom}</span>
                </div>
              );
            })}
          </div>
        ) : null}

        {/* Footer */}
        {status === "success" ? (
          <div className="mt-8 flex gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-white hover:bg-white/10 transition"
            >
              Annuler
            </button>
            <button
              onClick={handleValidate}
              disabled={selectedExercices.length === 0}
              className={[
                "flex-1 rounded-xl px-4 py-3 font-semibold transition",
                selectedExercices.length > 0
                  ? "bg-cyan-500/90 hover:bg-cyan-400 text-black"
                  : "bg-white/10 text-white/40 cursor-not-allowed",
              ].join(" ")}
            >
              Valider ({selectedExercices.length} sélectionné{selectedExercices.length > 1 ? "s" : ""})
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}