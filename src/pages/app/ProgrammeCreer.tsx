import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAllExercices } from "../../API/exercices";
import { createProgramme, updateProgrammeFull } from "../../API/programmes";
import { FaTrash, FaPlus, FaTimes, FaArrowUp, FaArrowDown, FaSpinner } from "react-icons/fa";

interface Exercice {
  id_exercice: number;
  nom: string;
}

interface Serie {
  id: string;
  kg: number;
  reps: number;
}

interface ExerciceData {
  exercice: Exercice;
  series: Serie[];
}

interface DraftExerciceForNavigation {
  id_exercice: number;
  ordre_passage: number;
  nombre_series: number;
  nombre_reps: number;
  charge_prevue: number;
  rpe_cible: number;
}

interface ProgrammeCreerNavigationState {
  selectedExercices?: number[];
  draftExercices?: DraftExerciceForNavigation[];
  draftTitle?: string;
  draftNote?: string;
  programmeId?: number;
}

export function ProgrammeCreerPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationState = (location.state as ProgrammeCreerNavigationState | null) ?? null;
  const isEditMode = typeof navigationState?.programmeId === "number";

  const [titreProgramme, setTitreProgramme] = useState(
    navigationState?.draftTitle ?? ""
  );
  const [noteProgramme, setNoteProgramme] = useState(
    navigationState?.draftNote ?? ""
  );
  const [exercicesData, setExercicesData] = useState<ExerciceData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (navigationState?.selectedExercices && navigationState.selectedExercices.length > 0) {
      loadExercices(
        navigationState.selectedExercices,
        navigationState.draftExercices
      );
    }
  }, [navigationState?.selectedExercices, navigationState?.draftExercices]);

  async function loadExercices(
    ids: number[],
    draftExercices?: DraftExerciceForNavigation[]
  ) {
    try {
      setLoading(true);
      const tousLesExercices = await getAllExercices();
      const draftByExerciceId = new Map<number, DraftExerciceForNavigation>(
        (draftExercices ?? []).map((draft) => [draft.id_exercice, draft])
      );
      // Preserve the order of selection by mapping ids in order
      const exercicesSelectionnees = ids
        .map(id => tousLesExercices.find(ex => ex.id_exercice === id))
        .filter((ex): ex is Exercice => ex !== undefined);

      setExercicesData((prev) => {
        const existingIds = new Set(prev.map((e) => e.exercice.id_exercice));
        const nouvelleList = [...prev];

        exercicesSelectionnees.forEach((ex) => {
          if (!existingIds.has(ex.id_exercice)) {
            const draft = draftByExerciceId.get(ex.id_exercice);
            const nombreSeries = Math.max(1, draft?.nombre_series ?? 1);
            const series = Array.from({ length: nombreSeries }, (_, index) => ({
              id: `${ex.id_exercice}-${index + 1}`,
              kg: draft?.charge_prevue ?? 0,
              reps: draft?.nombre_reps ?? 0,
            }));

            nouvelleList.push({
              exercice: ex,
              series,
            });
          }
        });

        return nouvelleList;
      });
    } catch (error) {
      console.error("Erreur lors du chargement des exercices:", error);
    } finally {
      setLoading(false);
    }
  }

  function supprimerExercice(id: number) {
    setExercicesData((prev) =>
      prev.filter((ex) => ex.exercice.id_exercice !== id)
    );
  }

  function deplacerExercice(index: number, direction: "up" | "down") {
    setExercicesData((prev) => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) {
        return prev;
      }

      const next = [...prev];
      const [movedExercice] = next.splice(index, 1);
      next.splice(targetIndex, 0, movedExercice);
      return next;
    });
  }

  function ajouterSerie(exerciceId: number) {
    setExercicesData((prev) =>
      prev.map((ex) => {
        if (ex.exercice.id_exercice === exerciceId) {
          const newSerieNum = ex.series.length + 1;
          return {
            ...ex,
            series: [
              ...ex.series,
              { id: `${exerciceId}-${newSerieNum}`, kg: 0, reps: 0 },
            ],
          };
        }
        return ex;
      })
    );
  }

  function supprimerSerie(exerciceId: number, serieId: string) {
    setExercicesData((prev) =>
      prev.map((ex) => {
        if (ex.exercice.id_exercice === exerciceId) {
          return {
            ...ex,
            series: ex.series.filter((s) => s.id !== serieId),
          };
        }
        return ex;
      })
    );
  }

  function mettreAJourSerie(
    exerciceId: number,
    serieId: string,
    field: "kg" | "reps",
    value: string
  ) {
    const parsedValue = value === "" ? 0 : Number(value);

    setExercicesData((prev) =>
      prev.map((ex) => {
        if (ex.exercice.id_exercice === exerciceId) {
          return {
            ...ex,
            series: ex.series.map((s) => {
              if (s.id === serieId) {
                return {
                  ...s,
                  [field]: Number.isNaN(parsedValue) ? 0 : parsedValue,
                };
              }
              return s;
            }),
          };
        }
        return ex;
      })
    );
  }

  function calculerPoidsTotal(series: Serie[]) {
    return series.reduce((total, s) => total + (Number.isNaN(s.kg) ? 0 : s.kg), 0);
  }

  async function handleCreateProgramme() {
    if (!titreProgramme.trim()) {
      alert("Veuillez entrer un titre pour le programme");
      return;
    }

    if (exercicesData.length === 0) {
      alert("Veuillez ajouter au moins un exercice");
      return;
    }

    try {
      setLoading(true);
      const exercices = exercicesData.map((exData, index) => {
        const firstSerie = exData.series[0];
        return {
          id_exercice: exData.exercice.id_exercice,
          ordre_passage: index + 1,
          nombre_series: exData.series.length,
          nombre_reps: firstSerie.reps || 0,
          charge_prevue: firstSerie.kg || 0,
          rpe_cible: 8,
        };
      });

      if (isEditMode && navigationState?.programmeId) {
        await updateProgrammeFull(navigationState.programmeId, {
          nom_programme: titreProgramme,
          description: noteProgramme,
          exercices,
        });
      } else {
        await createProgramme({
          nom_programme: titreProgramme,
          description: noteProgramme,
          exercices,
        });
      }

      setTitreProgramme("");
      setNoteProgramme("");
      setExercicesData([]);
      navigate("/app/seance");
    } catch (error) {
      console.error(
        isEditMode
          ? "Erreur lors de la modification du programme:"
          : "Erreur lors de la creation du programme:",
        error
      );
      alert(
        error instanceof Error
          ? error.message
          : isEditMode
            ? "Erreur lors de la modification du programme"
            : "Erreur lors de la creation du programme"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10 text-white">
      <h1 className="text-3xl font-bold">Créer un programme</h1>

      <div className="mt-8 space-y-6 rounded-2xl p-6">
        <div className="space-y-2">
          <label htmlFor="programme-title" className="text-sm font-medium text-white/80">
            Titre du programme
          </label>
          <input
            id="programme-title"
            type="text"
            value={titreProgramme}
            onChange={(e) => setTitreProgramme(e.target.value)}
            placeholder="Ex: Push Pull Legs"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-cyan-400"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="programme-note" className="text-sm font-medium text-white/80">
            Note du programme
          </label>
          <textarea
            id="programme-note"
            value={noteProgramme}
            onChange={(e) => setNoteProgramme(e.target.value)}
            rows={5}
            placeholder="Ajoute une description ou des consignes..."
            className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-cyan-400"
          />
        </div>
      </div>

      {loading && (
        <div className="mt-4 flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/60">
          <FaSpinner className="text-cyan-300 animate-spin" />
          <p className="animate-pulse">Chargement...</p>
        </div>
      )}

      {exercicesData.length > 0 && (
        <section className="mt-4 space-y-6">
          {exercicesData.map((exData, index) => {
            const poidsTotal = calculerPoidsTotal(exData.series);

            const gridClass =
              exData.series.length > 1
                ? "grid-cols-[48px_minmax(0,1fr)_minmax(0,1fr)_48px]"
                : "grid-cols-[48px_minmax(0,1fr)_minmax(0,1fr)]";

            return (
              <div
                key={exData.exercice.id_exercice}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-2xl font-bold">{exData.exercice.nom}</h2>
                    <p className="mt-1 text-sm text-white/60">
                      {exData.series.length} série{exData.series.length > 1 ? "s" : ""} ajoutée{exData.series.length > 1 ? "s" : ""} | {poidsTotal}kg
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => deplacerExercice(index, "up")}
                      disabled={index === 0}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white/75 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Monter cet exercice"
                    >
                      <FaArrowUp className="text-sm" />
                    </button>

                    <button
                      type="button"
                      onClick={() => deplacerExercice(index, "down")}
                      disabled={index === exercicesData.length - 1}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white/75 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Descendre cet exercice"
                    >
                      <FaArrowDown className="text-sm" />
                    </button>

                    <button
                      type="button"
                      onClick={() => supprimerExercice(exData.exercice.id_exercice)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-400/30 bg-red-500/10 text-red-300 transition hover:bg-red-500/20"
                      aria-label="Supprimer cet exercice"
                    >
                      <FaTrash className="text-sm" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className={`grid ${gridClass} gap-3 text-sm`}>
                    <div></div>
                    <div className="min-w-0 font-semibold text-white/80 text-center">kg</div>
                    <div className="min-w-0 font-semibold text-white/80 text-center">Reps</div>
                    {exData.series.length > 1 && <div></div>}
                  </div>

                  {exData.series.map((serie, index) => (
                    <div key={serie.id} className={`grid ${gridClass} items-center gap-3`}>
                      <div className="flex h-12 min-w-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-sm font-bold text-white/70">
                        {index + 1}
                      </div>

                      <input
                        type="text"
                        min="0"
                        step="0.5"
                        value={serie.kg}
                        onChange={(e) =>
                          mettreAJourSerie(
                            exData.exercice.id_exercice,
                            serie.id,
                            "kg",
                            e.target.value
                          )
                        }
                        placeholder="0"
                        className="h-12 min-w-0 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-center text-white placeholder:text-white/35 outline-none transition focus:border-cyan-400"
                      />

                      <input
                        type="text"
                        min="0"
                        step="1"
                        value={serie.reps}
                        onChange={(e) =>
                          mettreAJourSerie(
                            exData.exercice.id_exercice,
                            serie.id,
                            "reps",
                            e.target.value
                          )
                        }
                        placeholder="0"
                        className="h-12 min-w-0 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-center text-white placeholder:text-white/35 outline-none transition focus:border-cyan-400"
                      />

                      {exData.series.length > 1 && (
                        <button
                          type="button"
                          onClick={() => supprimerSerie(exData.exercice.id_exercice, serie.id)}
                          className="shrink-0 flex h-12 w-12 items-center justify-center rounded-lg border border-red-400/30 bg-red-500/10 text-red-300 transition hover:bg-red-500/20"
                          aria-label="Supprimer cette série"
                        >
                          <FaTimes className="text-sm" />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => ajouterSerie(exData.exercice.id_exercice)}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-white/20 py-3 font-semibold text-white/60 transition hover:border-cyan-400/50 hover:text-cyan-400/50"
                  >
                    <FaPlus className="text-sm" />
                    Ajouter une série
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      )}

      <button
        type="button"
        onClick={() =>
          navigate("/app/add-exercices", {
            state: {
              selectedExercices: exercicesData.map((e) => e.exercice.id_exercice),
              draftTitle: titreProgramme,
              draftNote: noteProgramme,
              programmeId: navigationState?.programmeId,
            },
          })
        }
        className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/25"
      >
        <FaPlus className="text-xs" />
        Ajouter des exercices
      </button>

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={() => navigate("/app/seance")}
          className="flex-1 rounded-xl border border-white/20 bg-white/5 px-4 py-3 font-semibold text-white/80 transition hover:bg-white/10"
        >
          Annuler
        </button>

        {exercicesData.length > 0 && (
          <button
            type="button"
            onClick={handleCreateProgramme}
            disabled={loading}
            className="flex-1 rounded-xl border border-cyan-400/40 bg-cyan-500/15 px-4 py-3 font-semibold text-cyan-300 transition hover:bg-cyan-500/25 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <FaSpinner className="animate-spin" />
                {isEditMode ? "Modification en cours..." : "Création en cours..."}
              </span>
            ) : (
              isEditMode ? "Modifier le programme" : "Créer le programme"
            )}
          </button>
        )}
      </div>
    </main>
  );
}



