import { useNavigate } from "react-router-dom";
import { FaBolt, FaClipboardList } from "react-icons/fa";

export function SeancePage() {
  const navigate = useNavigate();

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

        <section className="mb-6 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
              <FaBolt className="text-sm" />
            </div>
            <div>
              <h2 className="text-[17px] font-bold tracking-tight text-white">Entrainement</h2>
              <p className="text-xs text-white/40">Démarre une nouvelle séance maintenant</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/app/entrainement")}
            className="h-11 w-full rounded-xl bg-gradient-to-r from-cyan-400 to-sky-300 text-[13px] font-bold uppercase tracking-widest text-[#0a0a0a] shadow-[0_8px_32px_rgba(34,211,238,0.25)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_12px_40px_rgba(34,211,238,0.38)] active:translate-y-0"
          >
            Commencer un entrainement
          </button>
        </section>

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
            <p className="text-center text-xs text-white/20">Aucun programme pour l'instant.</p>
          </div>
        </section>

      </main>
    </div>
  );
}