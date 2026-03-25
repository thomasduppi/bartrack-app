import { useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export function ResetPasswordPage() {
    const [params] = useSearchParams();
    const navigate = useNavigate();

    const email = params.get("email") ?? "";
    const token = params.get("token") ?? "";

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
    const [error, setError] = useState<string>("");

    const valid = useMemo(() => {
        if (!email || !token) return false;
        if (password.length < 8) return false;
        if (password !== confirm) return false;
        return true;
    }, [email, token, password, confirm]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setStatus("loading");
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, token, password }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => null);
                throw new Error(data?.message || `HTTP ${res.status}`);
            }

            setStatus("done");
            setTimeout(() => navigate("/login"), 800);
        } catch {
            setStatus("error");
            setError("Lien invalide ou expiré. Redemande un nouveau lien.");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-24 -left-24 h-[380px] w-[380px] rounded-full bg-cyan-400/20 blur-3xl" />
                <div className="absolute -bottom-24 -right-24 h-[420px] w-[420px] rounded-full bg-teal-500/20 blur-3xl" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(255,255,255,0.08),transparent_45%)]" />
            </div>

            <div className="w-full max-w-md rounded-2xl bg-white/5 border border-white/10 p-6">
                <h1 className="text-2xl font-bold text-white">Nouveau mot de passe</h1>
                <p className="text-white/70 mt-2">Choisis un nouveau mot de passe.</p>

                {!email || !token ? (
                    <p className="mt-4 text-red-300">Lien invalide (token/email manquant).</p>
                ) : status === "done" ? (
                    <p className="mt-4 text-emerald-300">Mot de passe modifié ✅ Redirection…</p>
                ) : (
                    <form onSubmit={onSubmit} className="mt-6 space-y-4">
                        <input
                            className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-white outline-none"
                            placeholder="Nouveau mot de passe (min 8)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            required
                        />
                        <input
                            className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-white outline-none"
                            placeholder="Confirmation"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            type="password"
                            required
                        />

                        {error && <p className="text-red-300 text-sm">{error}</p>}
                        {!valid && (
                            <p className="text-white/60 text-sm">
                                Le mot de passe doit faire au moins 8 caractères et correspondre à la confirmation.
                            </p>
                        )}

                        <button
                            className="w-full rounded-xl bg-white text-black font-semibold py-3 disabled:opacity-50"
                            disabled={!valid || status === "loading"}
                            type="submit"
                        >
                            {status === "loading" ? "Validation..." : "Changer le mot de passe"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
