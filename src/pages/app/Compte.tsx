import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ListExercices } from "../../components/ListExercices";
import { PersonalInfo } from "../../components/PersonalInfo";
import { getCurrentUserProfile, updateCurrentUserProfile } from "../../API/users";

type UserProfile = {
  id?: number | string;
  nom?: string;
  prenom?: string;
  email?: string;
  date_naissance?: string;
  poids_corps?: number | string;
  sexe?: string;
  [key: string]: unknown;
};

function getCookie(name: string) {
  const encodedName = `${encodeURIComponent(name)}=`;
  const parts = document.cookie.split(";").map((part) => part.trim());
  const match = parts.find((part) => part.startsWith(encodedName));
  if (!match) return "";
  return decodeURIComponent(match.slice(encodedName.length));
}

function formatBirthdate(value?: string) {
  if (!value) return "";
  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, yyyy, mm, dd] = isoMatch;
    return `${dd}/${mm}/${yyyy}`;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  const dd = String(parsed.getDate()).padStart(2, "0");
  const mm = String(parsed.getMonth() + 1).padStart(2, "0");
  const yyyy = String(parsed.getFullYear());
  return `${dd}/${mm}/${yyyy}`;
}

function toApiBirthdate(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const displayMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (displayMatch) {
    const [, dd, mm, yyyy] = displayMatch;
    return `${yyyy}-${mm}-${dd}`;
  }
  return trimmed;
}

function getInitials(nom?: string, prenom?: string) {
  const n = nom ? nom[0].toUpperCase() : "";
  const p = prenom ? prenom[0].toUpperCase() : "";
  return p + n || "?";
}

export function ComptePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"infos" | "exercices">("infos");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    dateNaissance: "",
    poids: "",
    sexe: "",
  });
  const [saveStatus, setSaveStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      setStatus("loading");
      setError("");
      const token = getCookie("token");
      const userId = getCookie("id_utilisateur");
      if (!token) {
        if (isMounted) { setStatus("error"); setError("Vous devez être connecté pour voir votre compte."); }
        return;
      }
      if (!userId) {
        if (isMounted) { setStatus("error"); setError("Identifiant utilisateur introuvable. Reconnectez-vous."); }
        return;
      }
      try {
        const data = await getCurrentUserProfile();
        if (isMounted) {
          const resolvedProfile = data as UserProfile | null;
          const safeProfile = resolvedProfile ?? null;
          setProfile(safeProfile);
          setForm({
            nom: safeProfile?.nom ? String(safeProfile.nom) : "",
            prenom: safeProfile?.prenom ? String(safeProfile.prenom) : "",
            email: safeProfile?.email ? String(safeProfile.email) : "",
            dateNaissance: formatBirthdate(safeProfile?.date_naissance),
            poids: safeProfile?.poids_corps !== undefined && safeProfile?.poids_corps !== null ? String(safeProfile.poids_corps) : "",
            sexe: safeProfile?.sexe ? String(safeProfile.sexe) : "",
          });
          setStatus("success");
        }
      } catch (err) {
        if (!isMounted) return;
        setStatus("error");
        setError(err instanceof Error ? err.message : "Erreur lors du chargement du compte.");
      }
    }
    void loadProfile();
    return () => { isMounted = false; };
  }, []);

  async function handleUpdate() {
    setSaveStatus("loading");
    setSaveMessage("");
    const token = getCookie("token");
    const userId = getCookie("id_utilisateur");
    if (!token || !userId) {
      setSaveStatus("error");
      setSaveMessage("Session invalide. Reconnectez-vous.");
      return;
    }
    try {
      await updateCurrentUserProfile({
        nom: form.nom,
        prenom: form.prenom,
        date_naissance: toApiBirthdate(form.dateNaissance),
        poids_corps: form.poids ? parseFloat(form.poids) : 0,
        sexe: form.sexe,
      });
      setSaveStatus("success");
      setSaveMessage("Informations mises à jour avec succès.");
    } catch (err) {
      setSaveStatus("error");
      setSaveMessage(err instanceof Error ? err.message : "Erreur lors de la mise à jour.");
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a]">
      <div className="pointer-events-none fixed -right-20 -top-24 h-[400px] w-[400px] rounded-full bg-cyan-400/10 blur-[80px]" />
      <div className="pointer-events-none fixed -left-16 bottom-20 h-[300px] w-[300px] rounded-full bg-cyan-400/5 blur-[80px]" />
      <main className="relative z-10 mx-auto w-full max-w-[440px] px-5 pb-28 pt-8">
        {status === "loading" && (
          <div className="flex items-center gap-3 px-5 py-5 text-sm text-white/40">
            <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" />
            Chargement de votre profil…
          </div>
        )}

        {status === "error" && (
          <div className="rounded-2xl border border-red-400/15 bg-red-500/[0.06] px-5 py-5 text-sm text-white/80">
            <p className="mb-4">{error}</p>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-white/10"
            >
              Aller à la connexion
            </button>
          </div>
        )}

        {status === "success" && profile && (
          <>
            <div className="mb-9 flex items-center gap-[18px]">
              <div className="shrink-0">
                <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-sky-300 text-[26px] font-bold tracking-wide text-[#0a0a0a] shadow-[0_0_0_3px_#0a0a0a,0_0_0_5px_rgba(34,211,238,0.35)]">
                  {getInitials(form.nom, form.prenom)}
                </div>
              </div>
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400/80">
                  Mon profil
                </p>
                <p className="text-[32px] font-extrabold leading-none tracking-tight text-white">
                  {form.prenom || <span className="text-white/30">Prénom</span>}{" "}
                  <span className="text-white/30">{form.nom || "Nom"}</span>
                </p>
                <p className="mt-1 text-xs font-light text-white/35">{form.email || "—"}</p>
              </div>
            </div>

            <div className="mb-7 grid grid-cols-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-1">
              <button
                type="button"
                onClick={() => setActiveTab("infos")}
                className={[
                  "h-10 rounded-xl px-3 text-[12px] font-semibold uppercase tracking-[0.12em] transition",
                  activeTab === "infos"
                    ? "bg-cyan-400 text-[#0a0a0a]"
                    : "text-white/55 hover:text-white",
                ].join(" ")}
              >
                Informations personnelles
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("exercices")}
                className={[
                  "h-10 rounded-xl px-3 text-[12px] font-semibold uppercase tracking-[0.12em] transition",
                  activeTab === "exercices"
                    ? "bg-cyan-400 text-[#0a0a0a]"
                    : "text-white/55 hover:text-white",
                ].join(" ")}
              >
                Mes exercices
              </button>
            </div>

            {activeTab === "infos" ? (
              <PersonalInfo
                form={form}
                onFieldChange={(field, value) => setForm((prev) => ({ ...prev, [field]: value }))}
                onSave={handleUpdate}
                saveStatus={saveStatus}
                saveMessage={saveMessage}
              />
            ) : (
              <ListExercices />
            )}
          </>
        )}

        {status === "success" && !profile && (
          <p className="text-sm text-white/35">Aucune information à afficher.</p>
        )}
      </main>
    </div>
  );
}