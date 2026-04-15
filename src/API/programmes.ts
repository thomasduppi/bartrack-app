import { API_BASE_URL } from "../config";
import { getCookie } from "../utils/cookies";

export interface ExerciceForProgramme {
  id_programme: number;
  id_exercice: number;
  ordre_passage: number;
  nombre_series: number;
  nombre_reps: number;
  charge_prevue: number;
  rpe_cible: number;
  id: number;
}

export interface CreateProgrammePayload {
  nom_programme: string;
  description: string;
  exercices: Omit<ExerciceForProgramme, "id_programme" | "id">[];
}

export interface Programme {
  id?: number;
  nom_programme: string;
  description: string;
  id_utilisateur?: number;
  date_creation?: string;
}

export interface ProgrammeWithExercices extends Programme {
  exercices: ExerciceForProgramme[];
}

export async function createProgramme(
  payload: CreateProgrammePayload
): Promise<ProgrammeWithExercices> {
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

export async function getProgrammeFull(
  id: number
): Promise<ProgrammeWithExercices> {
  const token = getCookie("token");

  const response = await fetch(`${API_BASE_URL}/programmes/full/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.detail ||
        `Erreur lors de la récupération du programme: ${response.status}`
    );
  }

  return response.json();
}

export async function getAllProgrammesFull(): Promise<ProgrammeWithExercices[]> {
  const token = getCookie("token");

  const response = await fetch(`${API_BASE_URL}/programmes/full`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.detail ||
        `Erreur lors de la récupération des programmes: ${response.status}`
    );
  }

  return response.json();
}

export async function updateProgrammeFull(
  programmeId: number,
  payload: CreateProgrammePayload
): Promise<ProgrammeWithExercices> {
  const token = getCookie("token");

  const response = await fetch(`${API_BASE_URL}/programmes/${programmeId}/full`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.detail || `Erreur lors de la modification du programme: ${response.status}`
    );
  }

  return response.json();
}

export async function deleteProgrammeFull(id: number): Promise<void> {
  const token = getCookie("token");

  const response = await fetch(`${API_BASE_URL}/programmes/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.detail || `Erreur lors de la suppression du programme: ${response.status}`
    );
  }
}


