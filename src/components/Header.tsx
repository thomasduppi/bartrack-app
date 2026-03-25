import { Link } from "react-router-dom"
import { FaUserCircle } from "react-icons/fa";

export function Header() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-black backdrop-blur border-b border-[#0f3140]">
      <div className="max-w-7xl mx-auto py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src="/src/assets/img/bar_track_logo.png" alt="BarTrack logo" className="h-12 w-auto object-contain drop-shadow-[0_0_12px_#5ce1e6]" />
        </Link>
        <Link to="/app/seance" className="text-[#5ce1e6] transition-colors text-lg font-medium">
          App
        </Link>
        <Link to="/login" className="text-[#5ce1e6] transition-colors text-4xl">
          <FaUserCircle />
        </Link>
      </div>
    </header>
  )
}
