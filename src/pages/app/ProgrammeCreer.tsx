import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAllExercices } from "../../API/exercices";
import { createProgramme } from "../../API/programmes";
import { FaTrash, FaPlus, FaTimes } from "react-icons/fa";

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

export function ProgrammeCreerPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [titreProgramme, setTitreProgramme] = useState("");
  const [noteProgramme, setNoteProgramme] = useState("");
  const [exercicesData, setExercicesData] = useState<ExerciceData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const state = location.state as { selectedExercices?: number[] } | null;
    if (state?.selectedExercices && state.selectedExercices.length > 0) {
      loadExercices(state.selectedExercices);
    }
  }, [location.state]);

  async function loadExercices(ids: number[]) {
    try {
      setLoading(true);
      const tousLesExercices = await getAllExercices();
      // Preserve the order of selection by mapping ids in order
      const exercicesSelectionnees = ids
        .map(id => tousLesExercices.find(ex => ex.id_exercice === id))
        .filter((ex): ex is Exercice => ex !== undefined);

      setExercicesData((prev) => {
        const existingIds = new Set(prev.map((e) => e.exercice.id_exercice));
        const nouvelleList = [...prev];

        exercicesSelectionnees.forEach((ex) => {
          if (!existingIds.has(ex.id_exercice)) {
            nouvelleList.push({
              exercice: ex,
              series: [{ id: `${ex.id_exercice}-1`, kg: 0, reps: 0 }],
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

      // Construire l'array des exercices pour le nouveau endpoint
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

      await createProgramme({
        nom_programme: titreProgramme,
        description: noteProgramme,
        exercices,
      });

      // Réinitialiser le formulaire
      setTitreProgramme("");
      setNoteProgramme("");
      setExercicesData([]);
      navigate("/app/seance");
    } catch (error) {
      console.error("Erreur lors de la création du programme:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Erreur lors de la création du programme"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10 text-white">
      <h1 className="text-3xl font-bold">Creer un programme</h1>

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
        <p className="mt-4 text-sm text-white/45">Chargement des exercices…</p>
      )}

      {exercicesData.length > 0 && (
        <section className="mt-4 space-y-6">
          {exercicesData.map((exData) => {
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

                  <button
                    type="button"
                    onClick={() => supprimerExercice(exData.exercice.id_exercice)}
                    className="shrink-0 flex h-10 w-10 items-center justify-center rounded-lg border border-red-400/30 bg-red-500/10 text-red-300 transition hover:bg-red-500/20"
                    aria-label="Supprimer cet exercice"
                  >
                    <FaTrash className="text-sm" />
                  </button>
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
            state: { selectedExercices: exercicesData.map((e) => e.exercice.id_exercice) },
          })
        }
        className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/25"
      >
        <FaPlus className="text-xs" />
        Ajouter des exercices
      </button>

      {exercicesData.length > 0 && (
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={handleCreateProgramme}
            disabled={loading}
            className="flex-1 rounded-xl border border-cyan-400/40 bg-cyan-500/15 px-4 py-3 font-semibold text-cyan-300 transition hover:bg-cyan-500/25 disabled:opacity-50"
          >
            {loading ? "Création en cours..." : "Créer le programme"}
          </button>
        </div>
      )}
    </main>
  );
}
