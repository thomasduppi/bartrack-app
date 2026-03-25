import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { API_BASE_URL } from "../../config";

function setCookie(name: string, value: string, maxAgeSeconds = 60 * 60 * 24 * 7) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=/; SameSite=Strict; Max-Age=${maxAgeSeconds}${secure}`;
}

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => {
    const okEmail = email.trim().length >= 3 && email.includes("@")
    const okPwd = password.length >= 6
    return okEmail && okPwd && status !== "loading"
  }, [email, password, status]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setStatus("loading");

    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        let message = "Identifiants invalides."
        if (data?.detail) message = data.detail
        setError(message)
        setStatus("error");
        return;
      }

      if (data?.access_token) {
        setCookie("token", data.access_token);
      }

      if (data?.user?.id_utilisateur !== undefined && data?.user?.id_utilisateur !== null) {
        setCookie("id_utilisateur", String(data.user.id_utilisateur));
      }

      setStatus("success");
      navigate("/app");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-[380px] w-[380px] rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-[420px] w-[420px] rounded-full bg-teal-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(255,255,255,0.08),transparent_45%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold tracking-tight">Connexion</h1>
              <p className="mt-1 text-sm text-white/70">Connecte-toi pour accéder à ton espace.</p>
            </div>

            {error ? (
              <div className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-white">
                <span className="font-semibold">Erreur :</span> {error}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-white/85">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  autoComplete="email"
                  placeholder="ex: john.doe@gmail.com"
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-white placeholder:text-white/30 outline-none ring-0 transition focus:border-cyan-300/40 focus:outline-none focus:ring-4 focus:ring-cyan-400/10"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-white/85">Mot de passe</label>
                <div className="relative">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPwd ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Minimum 6 caractères"
                    className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 pr-11 text-white placeholder:text-white/30 outline-none transition focus:border-cyan-300/40 focus:ring-4 focus:ring-cyan-400/10"
                  />
                  <button type="button" onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/80 hover:bg-white/10"
                    aria-label={showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPwd ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <Link to="/forgot-password" className="text-sm text-cyan-200/90 hover:text-cyan-200 hover:underline">
                    Mot de passe oublié ?
                  </Link>
                </div>
              </div>

              <button type="submit" disabled={!canSubmit}
                className={[
                  "h-11 w-full rounded-xl font-semibold transition",
                  "border border-white/10",
                  canSubmit ? "bg-cyan-500/90 hover:bg-cyan-400 text-black" : "bg-white/10 text-white/40 cursor-not-allowed",
                ].join(" ")}
              >
                {status === "loading" ? "Connexion…" : "Se connecter"}
              </button>

              <div className="pt-2 text-center text-sm text-white/65">
                Pas de compte ?{" "}
                <Link to="/register" className="text-cyan-200/90 hover:text-cyan-200 hover:underline">
                  Créer un compte
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
