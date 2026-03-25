export function Footer() {
  return (
    <footer className="bg-black border-t border-[#0f3140] text-slate-300 text-center">
      <div className="border-t border-[#0f3140]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-2 text-xs text-[#ffffff]">
          <span>© {new Date().getFullYear()} BarTrack. Tous droits réservés.</span>
          <span className="text-[#ffffff]">
            Conçu pour les passionnés de musculation et de performance.
          </span>
        </div>
      </div>
    </footer>
  );
}
