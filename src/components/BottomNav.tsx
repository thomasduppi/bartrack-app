import { FaBolt, FaCalendarAlt, FaChartLine, FaUser } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { to: "/app/seance", label: "Séance", icon: FaBolt },
  { to: "/app/historique", label: "Historique", icon: FaCalendarAlt },
  { to: "/app/performance", label: "Performance", icon: FaChartLine },
  { to: "/app/compte", label: "Compte", icon: FaUser },
];

export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-4 pb-5">
      <div className="mx-auto max-w-[440px] overflow-hidden rounded-[32px] border border-white/[0.08] bg-[#0f0f0f]/90 shadow-[0_-4px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        <div className="grid grid-cols-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.to;

            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={isActive ? "page" : undefined}
                className="group relative flex flex-col items-center justify-center py-2 transition-all duration-200"
              >
                {isActive && (
                  <span className="absolute inset-x-4 top-0 h-[2px] rounded-full bg-gradient-to-r from-cyan-400 to-sky-300" />
                )}

                <span
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-cyan-400/15 text-cyan-400"
                      : "text-white/30 group-hover:text-white/60",
                  ].join(" ")}
                >
                  <Icon className="text-base" />
                </span>

                <span
                  className={[
                    "text-[10px] font-semibold tracking-wide transition-colors duration-200",
                    isActive ? "text-cyan-400" : "text-white/30 group-hover:text-white/50",
                  ].join(" ")}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}