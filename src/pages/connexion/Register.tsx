import { useMemo, useState } from "react";
import { FaCaretDown, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../API/users";

export function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [firstName, setFirstName] = useState(""); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [birthdateDisplay, setBirthdateDisplay] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState("");
  const [isGenderOpen, setIsGenderOpen] = useState(false);

  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const displayToISO = (display: string) => {
    const parts = display.split("/");
    if (parts.length !== 3) return "";
    const [dd, mm, yyyy] = parts;
    if (dd.length !== 2 || mm.length !== 2 || yyyy.length !== 4) return "";

    const d = Number(dd);
    const m = Number(mm);
    const y = Number(yyyy);
    if (!Number.isFinite(d) || !Number.isFinite(m) || !Number.isFinite(y)) return "";
    if (y < 1900 || y > 2100) return "";
    if (m < 1 || m > 12) return "";
    if (d < 1 || d > 31) return "";

    const iso = `${yyyy}-${mm}-${dd}`;
    const date = new Date(`${iso}T00:00:00`);
    const ok =
      date.getFullYear() === y &&
      date.getMonth() + 1 === m &&
      date.getDate() === d;

    return ok ? iso : "";
  }

  const normalizeBirthDisplay = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    const dd = digits.slice(0, 2);
    const mm = digits.slice(2, 4);
    const yyyy = digits.slice(4, 8);

    let out = dd;
    if (digits.length > 2) out += "/" + mm;
    if (digits.length > 4) out += "/" + yyyy;
    return out;
  }

  const handleBirthdateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = normalizeBirthDisplay(e.target.value);
    setBirthdateDisplay(formatted);

    const iso = displayToISO(formatted);
    if (iso) setBirthdate(iso);
    else setBirthdate("");
  }

  const emailValid = useMemo(() => {
    const value = email.trim().toLowerCase();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return regex.test(value);
  }, [email]);

  const weightValid = useMemo(() => {
    if (weight.trim().length === 0) return true;
    const w = parseFloat(weight);
    return !isNaN(w) && w > 0;
  }, [weight]);
  const passwordHasMinLength = useMemo(() => password.length >= 8, [password]);
  const passwordHasLetter = useMemo(() => /[A-Za-z]/.test(password), [password]);
  const passwordHasDigit = useMemo(() => /[0-9]/.test(password), [password]);
  const passwordHasSpecial = useMemo(() => /[^A-Za-z0-9]/.test(password), [password]);
  const passwordValid = useMemo(
    () => passwordHasMinLength && passwordHasLetter && passwordHasDigit && passwordHasSpecial,
    [passwordHasMinLength, passwordHasLetter, passwordHasDigit, passwordHasSpecial]
  );
  const passwordsMatch = useMemo(() => password === confirm && confirm.length > 0, [password, confirm]);

  const canSubmit = useMemo(() => {
    const ok =
      name.trim().length >= 2 &&
      firstName.trim().length >= 2 &&
      emailValid &&
      passwordValid &&
      passwordsMatch;
    return ok && status !== "loading";
  }, [name, firstName, emailValid, passwordValid, passwordsMatch, weightValid, birthdate, gender, status]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setStatus("loading");

    try {
      await registerUser({
        nom: name.trim(),
        prenom: firstName.trim(),
        email: email.trim(),
        mot_de_passe: password,
        date_naissance: birthdate,
        poids_corps: weight ? parseFloat(weight) : 0,
        sexe: gender,
      });

      navigate("/login");
    } catch (err) {
      setStatus("error");
      const errorMessage = err instanceof Error ? err.message : "Erreur lors de l'inscription.";
      setError(errorMessage);
    } finally {
      setStatus("idle");
      navigate("/login");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-[380px] w-[380px] rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-[420px] w-[420px] rounded-full bg-teal-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(255,255,255,0.08),transparent_45%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-24">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold tracking-tight">Créer un compte</h1>
              <p className="mt-1 text-sm text-white/70">Renseigne tes infos pour t’inscrire.</p>
            </div>

            {error ? (
              <div className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-white">
                <span className="font-semibold">Erreur :</span> {error}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-white/85">Nom</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  autoComplete="name"
                  placeholder="Doe"
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-white placeholder:text-white/30 outline-none transition focus:border-cyan-300/40 focus:ring-4 focus:ring-cyan-400/10"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-white/85">Prénom</label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  type="text"
                  autoComplete="name"
                  placeholder="John"
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-white placeholder:text-white/30 outline-none transition focus:border-cyan-300/40 focus:ring-4 focus:ring-cyan-400/10"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-white/85">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  autoComplete="email"
                  placeholder="john.doe@gmail.com"
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-white placeholder:text-white/30 outline-none transition focus:border-cyan-300/40 focus:ring-4 focus:ring-cyan-400/10"
                />
                <p className="mt-1 text-xs text-white/40">
                  {email.length === 0 ? <span className="mt-1 text-xs text-white/40">Format: nom@domaine</span> : emailValid ? 
                  <span className="mt-1 text-xs text-green-400">Email valide</span> : 
                  <span className="mt-1 text-xs text-red-400">Email invalide</span>}
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-white/85">Date de naissance</label>
                <input
                  value={birthdateDisplay}
                  onChange={handleBirthdateChange}
                  type="text"
                  inputMode="numeric"
                  autoComplete="bday"
                  placeholder="jj/mm/aaaa"
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-white placeholder:text-white/30 outline-none transition focus:border-cyan-300/40 focus:ring-4 focus:ring-cyan-400/10"
                />
                
                  {birthdateDisplay.length === 0 ? "" : birthdate ? 
                  <p className="mt-1 text-xs text-green-400">Date de naissance valide</p> : 
                  <p className="mt-1 text-xs text-red-400">Date de naissance invalide</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-white/85">Poids (kg)</label>
                <input
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  type="text"
                  autoComplete="weight"
                  placeholder="70"
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-white placeholder:text-white/30 outline-none transition focus:border-cyan-300/40 focus:ring-4 focus:ring-cyan-400/10"
                />
                {weight.length === 0 ? (
                  <p className="mt-1 text-xs text-white/40">Entrez votre poids en kg</p>
                ) : weightValid ? (
                  <p className="mt-1 text-xs text-green-400">Poids valide</p>
                ) : (
                  <p className="mt-1 text-xs text-red-400">Entrez un poids valide (ex: 70.5)</p>
                )}
              </div>

              <div
                className="relative"
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                    setIsGenderOpen(false);
                  }
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsGenderOpen((v) => !v)}
                  className="h-11 w-full rounded-xl border border-white/10 bg-black px-3 text-left text-base font-normal text-white outline-none transition focus:border-cyan-300/40 focus:ring-4 focus:ring-cyan-400/10"
                  aria-haspopup="listbox"
                  aria-expanded={isGenderOpen}
                >
                  <span>{gender === "M" ? "Homme" : gender === "F" ? "Femme" : "Sélectionner"}</span>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/80">
                    <FaCaretDown />
                  </span>
                </button>

                {isGenderOpen ? (
                  <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl">
                    <button
                      type="button"
                      onClick={() => {
                        setGender("M");
                        setIsGenderOpen(false);
                      }}
                      className={[
                        "w-full px-3 py-2 text-left text-base font-normal text-white transition",
                        gender === "M" ? "bg-white/10" : "bg-black hover:bg-white/10",
                      ].join(" ")}
                      role="option"
                      aria-selected={gender === "M"}
                    >
                      Homme
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setGender("F");
                        setIsGenderOpen(false);
                      }}
                      className={[
                        "w-full px-3 py-2 text-left text-base font-normal text-white transition",
                        gender === "F" ? "bg-white/10" : "bg-black hover:bg-white/10",
                      ].join(" ")}
                      role="option"
                      aria-selected={gender === "F"}
                    >
                      Femme
                    </button>
                  </div>
                ) : null}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-white/85">Mot de passe</label>
                <div className="relative">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPwd ? "text" : "password"}
                    autoComplete="new-password"
                    className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 pr-20 text-white placeholder:text-white/30 outline-none transition focus:border-cyan-300/40 focus:ring-4 focus:ring-cyan-400/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/80 hover:bg-white/10"
                  >
                    {showPwd ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {password.length === 0 ? (
                  <p className="mt-1 text-xs text-white/40">Utilisez au moins 8 caractères avec lettre, chiffre et caractère spécial.</p>
                ) : (
                  <div className="mt-1 space-y-0.5 text-xs">
                    <p className={passwordHasMinLength ? "text-green-400" : "text-red-400"}>
                      {passwordHasMinLength ? "✓" : "✗"} Au moins 8 caractères
                    </p>
                    <p className={passwordHasLetter ? "text-green-400" : "text-red-400"}>
                      {passwordHasLetter ? "✓" : "✗"} Au moins une lettre
                    </p>
                    <p className={passwordHasDigit ? "text-green-400" : "text-red-400"}>
                      {passwordHasDigit ? "✓" : "✗"} Au moins un chiffre
                    </p>
                    <p className={passwordHasSpecial ? "text-green-400" : "text-red-400"}>
                      {passwordHasSpecial ? "✓" : "✗"} Au moins un caractère spécial
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-white/85">Confirmer le mot de passe</label>
                <div className="relative">
                  <input
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 pr-20 text-white placeholder:text-white/30 outline-none transition focus:border-cyan-300/40 focus:ring-4 focus:ring-cyan-400/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/80 hover:bg-white/10"
                  >
                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {confirm.length === 0 ? (
                  <p className="mt-1 text-xs text-white/40">Ressaisissez votre mot de passe</p>
                ) : passwordsMatch ? (
                  <p className="mt-1 text-xs text-green-400">Les mots de passe correspondent</p>
                ) : (
                  <p className="mt-1 text-xs text-red-400">Les mots de passe ne correspondent pas</p>
                )}
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className={[
                  "h-11 w-full rounded-xl font-semibold transition",
                  "border border-white/10",
                  canSubmit ? "bg-cyan-500/90 hover:bg-cyan-400 text-black" : "bg-white/10 text-white/40 cursor-not-allowed",
                ].join(" ")}
              >
                {status === "loading" ? "Création…" : "Créer mon compte"}
              </button>

              <div className="pt-2 text-center text-sm text-white/65">
                Déjà un compte ?{" "}
                <Link to="/login" className="text-cyan-200/90 hover:text-cyan-200 hover:underline">
                  Se connecter
                </Link>
              </div>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-white/35">Tes données restent privées — aucune revente.</p>
        </div>
      </div>
    </div>
  )
}