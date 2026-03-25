type PersonalInfoForm = {
  nom: string;
  prenom: string;
  email: string;
  dateNaissance: string;
  poids: string;
  sexe: string;
};

type PersonalInfoProps = {
  form: PersonalInfoForm;
  onFieldChange: (field: keyof PersonalInfoForm, value: string) => void;
  onSave: () => void;
  saveStatus: "idle" | "loading" | "success" | "error";
  saveMessage: string;
};

const fieldInput =
  "w-full bg-transparent border-b border-white/10 pb-2 pt-1 text-[15px] font-medium text-white placeholder-white/20 outline-none transition-colors duration-200 focus:border-cyan-400";

const fieldLabel =
  "text-[10px] font-semibold tracking-[0.15em] uppercase text-white/30 mb-2 block";

export function PersonalInfo({
  form,
  onFieldChange,
  onSave,
  saveStatus,
  saveMessage,
}: PersonalInfoProps) {
  return (
    <>
      <div className="mb-5 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25">
        Informations personnelles
        <span className="h-px flex-1 bg-white/[0.07]" />
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-7">
        <div>
          <label className={fieldLabel}>Prénom</label>
          <input
            className={fieldInput}
            value={form.prenom}
            placeholder="Prénom"
            onChange={(e) => onFieldChange("prenom", e.target.value)}
          />
        </div>

        <div>
          <label className={fieldLabel}>Nom</label>
          <input
            className={fieldInput}
            value={form.nom}
            placeholder="Nom"
            onChange={(e) => onFieldChange("nom", e.target.value)}
          />
        </div>

        <div className="col-span-2">
          <label className={fieldLabel}>Email</label>
          <input className={fieldInput} value={form.email} readOnly />
        </div>

        <div className="col-span-2">
          <label className={fieldLabel}>Date de naissance</label>
          <input
            className={fieldInput}
            value={form.dateNaissance}
            placeholder="jj/mm/aaaa"
            onChange={(e) => onFieldChange("dateNaissance", e.target.value)}
          />
        </div>

        <div>
          <label className={fieldLabel}>Poids</label>
          <div className="relative">
            <input
              className={`${fieldInput} pr-8`}
              value={form.poids}
              placeholder="0"
              onChange={(e) => onFieldChange("poids", e.target.value)}
            />
            <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[11px] font-semibold tracking-wide text-cyan-400/60">
              KG
            </span>
          </div>
        </div>

        <div>
          <label className={fieldLabel}>Sexe</label>
          <div className="relative">
            <select
              className={`${fieldInput} cursor-pointer appearance-none pr-5`}
              value={form.sexe}
              onChange={(e) => onFieldChange("sexe", e.target.value)}
            >
              <option value="M">Homme</option>
              <option value="F">Femme</option>
            </select>
            <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[10px] text-white/30">
              ▾
            </span>
          </div>
        </div>
      </div>

      <div className="my-8 h-px bg-white/[0.06]" />

      <button
        type="button"
        onClick={onSave}
        disabled={saveStatus === "loading"}
        className={[
          "h-12 w-full rounded-2xl text-[15px] font-bold tracking-widest uppercase transition-all duration-200",
          saveStatus === "loading"
            ? "cursor-not-allowed border border-white/[0.07] bg-white/5 text-white/25"
            : "bg-gradient-to-r from-cyan-400 to-sky-300 text-[#0a0a0a] shadow-[0_8px_32px_rgba(34,211,238,0.25)] hover:-translate-y-px hover:shadow-[0_12px_40px_rgba(34,211,238,0.38)] active:translate-y-0",
        ].join(" ")}
      >
        {saveStatus === "loading" ? "Enregistrement…" : "Enregistrer"}
      </button>

      {saveMessage && (
        <div
          className={[
            "mt-4 rounded-xl border px-4 py-3 text-center text-[13px] font-medium",
            saveStatus === "success"
              ? "border-green-400/15 bg-green-400/[0.07] text-green-400"
              : "border-red-400/15 bg-red-400/[0.07] text-red-400",
          ].join(" ")}
        >
          {saveMessage}
        </div>
      )}
    </>
  );
}
