import { useState } from "react";

export function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle"|"loading"|"done"|"error">("idle");

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setStatus("loading");
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
        } catch {
            // on reste neutre aussi côté UI (pas de “email inconnu”)
        } finally {
            setStatus("done");
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
                <h1 className="text-2xl font-bold text-white">Mot de passe oublié</h1>
                <p className="text-white/70 mt-2">Entre ton email pour recevoir un lien de réinitialisation.</p>

                {status === "done" ? (
                    <p className="mt-4 text-emerald-300">
                        Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.
                    </p>
                ) : (
                    <form onSubmit={onSubmit} className="mt-6 space-y-4">
                        <input
                            className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-white outline-none"
                            placeholder="john.doe@.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            required
                        />
                        <button
                            className="w-full rounded-xl bg-white text-black font-semibold py-3 disabled:opacity-50"
                            disabled={status === "loading"}
                            type="submit"
                        >
                            {status === "loading" ? "Envoi..." : "Reset password"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
