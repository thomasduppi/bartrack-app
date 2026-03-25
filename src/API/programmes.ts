import { API_BASE_URL } from "../config";
import { getCookie } from "../utils/cookies";

export interface ExerciceForProgramme {
  id_exercice: number;
  ordre_passage: number;
  nombre_series: number;
  nombre_reps: number;
  charge_prevue: number;
  rpe_cible: number;
}

export interface CreateProgrammePayload {
  nom_programme: string;
  description: string;
  exercices: ExerciceForProgramme[];
}

export interface Programme {
  id_programme?: number;
  nom_programme: string;
  description: string;
}

export async function createProgramme(
  payload: CreateProgrammePayload
): Promise<Programme> {
  const token = getCookie("token");

  const response = await fetch(`${API_BASE_URL}/programmes/full`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.detail || `Erreur lors de la création du programme: ${response.status}`
    );
  }

  return response.json();
}
