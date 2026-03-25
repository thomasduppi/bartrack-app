import { useState } from "react";
import { ListExercices } from "../../components/ListExercices";

export function ProgrammeCreerPage() {
  const [titreProgramme, setTitreProgramme] = useState("");
  const [noteProgramme, setNoteProgramme] = useState("");
  const [showExercices, setShowExercices] = useState(false);

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10 text-white">
      <h1 className="text-3xl font-bold">Creer un programme</h1>

      <div className="mt-8 space-y-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
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

        <button
          type="button"
          onClick={() => setShowExercices(true)}
          className="inline-flex items-center rounded-xl border border-cyan-400/40 bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/25"
        >
          Ajouter des exercices
        </button>
      </div>

      {showExercices ? (
        <section className="mt-8">
          <ListExercices />
        </section>
      ) : null}
    </main>
  );
}
