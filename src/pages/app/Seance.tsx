import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaClipboardList, FaSpinner, FaTimes, FaEllipsisV } from "react-icons/fa";
import { deleteProgrammeFull, getAllProgrammesFull } from "../../API/programmes";
import { getAllExercices } from "../../API/exercices";

export interface ProgrammeWithExercices extends Programme {
  exercices: ExerciceForProgramme[];
}

export interface Programme {
  id?: number;
  nom_programme: string;
  description: string;
  id_utilisateur?: number;
  date_creation?: string;
}

export interface ExerciceForProgramme {
  id_programme: number;
  id_exercice: number;
  ordre_passage: number;
  nombre_series: number;
  nombre_reps: number;
  charge_prevue: number;
  rpe_cible: number;
  id: number;
}

interface GroupedProgrammeExercice {
  id_exercice: number;
  ordre_passage: number;
  series: Array<{
    nombre_reps: number;
    charge_prevue: number;
    id: number;
  }>;
}

export function SeancePage() {
  const navigate = useNavigate();
  const [programmes, setProgrammes] = useState<ProgrammeWithExercices[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgramme, setSelectedProgramme] = useState<ProgrammeWithExercices | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [exerciceNamesById, setExerciceNamesById] = useState<Record<number, string>>({});
  const [activeMenuProgrammeId, setActiveMenuProgrammeId] = useState<number | null>(null);
  const [deletingProgrammeId, setDeletingProgrammeId] = useState<number | null>(null);

  useEffect(() => {
    const loadProgrammes = async () => {
      try {
        setLoading(true);
        const data = await getAllProgrammesFull();
        setProgrammes(data);
      } catch (error) {
        console.error("Erreur lors du chargement des programmes:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProgrammes();
  }, []);

  useEffect(() => {
    const loadExercicesNames = async () => {
      try {
        const exercices = await getAllExercices();
        setExerciceNamesById(
          exercices.reduce<Record<number, string>>((acc, exercice) => {
            acc[exercice.id_exercice] = exercice.nom;
            return acc;
          }, {})
        );
      } catch (error) {
        console.error("Erreur lors du chargement des noms des exercices:", error);
      }
    };

    loadExercicesNames();
  }, []);

  const handleSelectProgramme = (id: number | undefined) => {
    if (!id) return;
    const programme = programmes.find((item) => item.id === id) ?? null;
    setSelectedProgramme(programme);
    setIsDetailsOpen(true);
    setActiveMenuProgrammeId(null);
  };

  const handleStartProgramme = (programme: ProgrammeWithExercices) => {
    setSelectedProgramme(programme);
    setActiveMenuProgrammeId(null);
    navigate("/app/entrainement");
  };

  const handleEditProgramme = (programme: ProgrammeWithExercices) => {
    const orderedProgrammeExercices = [...programme.exercices].sort(
      (a, b) => a.ordre_passage - b.ordre_passage
    );
    const groupedByExercice = orderedProgrammeExercices.reduce<
      GroupedProgrammeExercice[]
    >((acc, exercice) => {
      const existingGroup = acc.find(
        (group) =>
          group.id_exercice === exercice.id_exercice &&
          group.ordre_passage === exercice.ordre_passage
      );

      if (existingGroup) {
        existingGroup.series.push({
          id: exercice.id,
          nombre_reps: exercice.nombre_reps,
          charge_prevue: exercice.charge_prevue,
        });
        return acc;
      }

      acc.push({
        id_exercice: exercice.id_exercice,
        ordre_passage: exercice.ordre_passage,
        series: [
          {
            id: exercice.id,
            nombre_reps: exercice.nombre_reps,
            charge_prevue: exercice.charge_prevue,
          },
        ],
      });
      return acc;
    }, []);

    navigate("/app/programme/creer", {
      state: {
        selectedExercices: groupedByExercice
          .map((exercice) => exercice.id_exercice),
        draftExercices: groupedByExercice.map((exercice) => ({
          id_exercice: exercice.id_exercice,
          ordre_passage: exercice.ordre_passage,
          nombre_series: exercice.series.length,
          nombre_reps: exercice.series[0]?.nombre_reps ?? 0,
          charge_prevue: exercice.series[0]?.charge_prevue ?? 0,
          rpe_cible: 8,
          seriesValues: exercice.series.map((serie) => ({
            reps: serie.nombre_reps,
            kg: serie.charge_prevue,
          })),
        })),
        draftTitle: programme.nom_programme,
        draftNote: programme.description,
        programmeId: programme.id,
      },
    });
    setActiveMenuProgrammeId(null);
  };

  const handleDeleteProgramme = async (programme: ProgrammeWithExercices) => {
    if (!programme.id) return;
    const confirmed = window.confirm(
      `Supprimer le programme "${programme.nom_programme}" ?`
    );
    if (!confirmed) return;

    try {
      setDeletingProgrammeId(programme.id);
      await deleteProgrammeFull(programme.id);
      setProgrammes((prev) => prev.filter((item) => item.id !== programme.id));
      if (selectedProgramme?.id === programme.id) {
        setIsDetailsOpen(false);
        setSelectedProgramme(null);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du programme:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Impossible de supprimer ce programme."
      );
    } finally {
      setDeletingProgrammeId(null);
      setActiveMenuProgrammeId(null);
    }
  };

  const orderedExercices = selectedProgramme
    ? [...selectedProgramme.exercices].sort((a, b) => a.ordre_passage - b.ordre_passage)
    : [];
  const groupedExercicesForDetails = orderedExercices.reduce<GroupedProgrammeExercice[]>(
    (acc, exercice) => {
      const existingGroup = acc.find(
        (group) =>
          group.id_exercice === exercice.id_exercice &&
          group.ordre_passage === exercice.ordre_passage
      );

      if (existingGroup) {
        existingGroup.series.push({
          id: exercice.id,
          nombre_reps: exercice.nombre_reps,
          charge_prevue: exercice.charge_prevue,
        });
        return acc;
      }

      acc.push({
        id_exercice: exercice.id_exercice,
        ordre_passage: exercice.ordre_passage,
        series: [
          {
            id: exercice.id,
            nombre_reps: exercice.nombre_reps,
            charge_prevue: exercice.charge_prevue,
          },
        ],
      });
      return acc;
    },
    []
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a]">
      <div className="pointer-events-none fixed -right-20 -top-24 h-[400px] w-[400px] rounded-full bg-cyan-400/10 blur-[80px]" />
      <div className="pointer-events-none fixed -left-16 bottom-20 h-[300px] w-[300px] rounded-full bg-cyan-400/5 blur-[80px]" />
      <main className="relative z-10 mx-auto w-full max-w-[440px] px-5 pb-28 pt-8 text-white">
        <div className="mb-9">
          <h1 className="text-[32px] font-extrabold leading-none tracking-tight text-white">
            Séance
          </h1>
        </div>
        <section className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
              <FaClipboardList className="text-sm" />
            </div>
            <div>
              <h2 className="text-[17px] font-bold tracking-tight text-white">Programme</h2>
              <p className="text-xs text-white/40">Crée et retrouve tes programmes d'entraînement.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/app/programme/creer")}
            className="h-11 w-full rounded-xl border border-cyan-400/20 bg-cyan-400/[0.08] text-[13px] font-bold uppercase tracking-widest text-cyan-300 transition-all duration-200 hover:bg-cyan-400/[0.14] active:scale-[0.98]"
          >
            Créer un programme
          </button>

          <div className="mt-5">
            <div className="mb-3 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25">
              Liste des programmes
              <span className="h-px flex-1 bg-white/[0.07]" />
            </div>
            {loading ? (
              <div className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3 text-xs text-white/45">
                <FaSpinner className="text-cyan-300 animate-spin" />
                <span className="animate-pulse">Chargement des programmes...</span>
              </div>
            ) : programmes.length === 0 ? (
              <p className="text-center text-xs text-white/20">Aucun programme pour l'instant.</p>
            ) : (
              <div className="space-y-2">
                {programmes.map((programme) => (
                  <div
                    key={programme.id}
                    className={`relative rounded-lg p-3 text-left transition-all duration-200 ${
                      selectedProgramme?.id === programme.id
                        ? "border border-cyan-400/50 bg-cyan-400/[0.15]"
                        : "border border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectProgramme(programme.id)}
                        className="flex-1 text-left"
                      >
                        <h3 className="text-sm font-semibold text-white">{programme.nom_programme}</h3>
                        <p className="text-xs text-white/50">
                          {new Set(
                            (programme.exercices ?? []).map(
                              (exercice) => `${exercice.id_exercice}-${exercice.ordre_passage}`
                            )
                          ).size} exercice
                          {new Set(
                            (programme.exercices ?? []).map(
                              (exercice) => `${exercice.id_exercice}-${exercice.ordre_passage}`
                            )
                          ).size > 1
                            ? "s"
                            : ""}{" "}
                          - {new Date(programme.date_creation || "").toLocaleDateString()}
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setActiveMenuProgrammeId((prev) =>
                            prev === programme.id ? null : (programme.id ?? null)
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10"
                        aria-label="Actions du programme"
                      >
                        <FaEllipsisV className="text-xs" />
                      </button>
                    </div>

                    {activeMenuProgrammeId === programme.id && (
                      <div className="absolute right-3 top-12 z-20 w-52 overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-xl">
                        <button
                          type="button"
                          onClick={() => handleStartProgramme(programme)}
                          className="w-full border-b border-white/10 px-4 py-3 text-left text-sm font-medium text-white/90 transition hover:bg-white/10"
                        >
                          Démarrer programme
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditProgramme(programme)}
                          className="w-full border-b border-white/10 px-4 py-3 text-left text-sm font-medium text-white/90 transition hover:bg-white/10"
                        >
                          Modifier programme
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProgramme(programme)}
                          disabled={deletingProgrammeId === programme.id}
                          className="w-full px-4 py-3 text-left text-sm font-medium text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                        >
                          {deletingProgrammeId === programme.id ? "Suppression..." : "Supprimer programme"}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

      </main>

      {isDetailsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 pt-10 backdrop-blur-sm"
          onClick={() => setIsDetailsOpen(false)}
        >
          <section
            className="w-full max-w-[460px] rounded-[34px] border border-white/15 bg-zinc-900/95 p-5 text-white shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-[20px] font-bold text-white/85">Détails du programme</h2>
              <button
                type="button"
                onClick={() => setIsDetailsOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10"
                aria-label="Fermer les détails"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>

            {selectedProgramme ? (
              <>
                <h3 className="text-4xl font-extrabold leading-tight tracking-tight">
                  {selectedProgramme.nom_programme}
                </h3>
                <p className="mt-2 text-sm text-white/65">
                  {selectedProgramme.description || "Aucune description pour ce programme."}
                </p>

                <div className="mt-5 rounded-2xl border border-white/10 bg-black/20">
                  {groupedExercicesForDetails.length === 0 ? (
                    <p className="px-4 py-4 text-sm text-white/50">Aucun exercice dans ce programme.</p>
                  ) : (
                    groupedExercicesForDetails.map((exercice) => {
                      const exerciceNom =
                        exerciceNamesById[exercice.id_exercice] ?? `Exercice #${exercice.id_exercice}`;
                      return (
                        <div
                          key={`${exercice.id_exercice}-${exercice.ordre_passage}`}
                          className="border-b border-white/10 px-4 py-3 last:border-b-0"
                        >
                          <div className="mb-2 min-w-0">
                            <p className="truncate text-lg font-semibold">{exerciceNom}</p>
                          </div>

                          <div className="space-y-1">
                            {exercice.series.map((serie, index) => (
                              <div
                                key={serie.id}
                                className="flex items-center justify-between gap-3 text-sm"
                              >
                                <p className="text-white/70">
                                  Série {index + 1}: {serie.nombre_reps} reps {serie.charge_prevue > 0 ? `- ${serie.charge_prevue}kg` : ""}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/app/entrainement")}
                  className="h-11 mt-2 w-full rounded-xl bg-gradient-to-r from-cyan-400 to-sky-300 text-[13px] font-bold uppercase tracking-widest text-[#0a0a0a] shadow-[0_8px_32px_rgba(34,211,238,0.25)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_12px_40px_rgba(34,211,238,0.38)] active:translate-y-0"
                >
                  Démarrer l'entraînement
                </button>
              </>
            ) : (
              <p className="rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                Impossible de charger les détails de ce programme.
              </p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
