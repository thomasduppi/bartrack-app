import { API_BASE_URL } from '../config';
import { getCookie } from '../utils/cookies';

export interface ProfilVbtEntry {
  id_utilisateur: number;
  id_exercice: number;
  current_1rm: number;
  slope: number;
  intercept: number;
  last_updated: string;
}

export interface CreateProfilVbtPayload {
  id_exercice: number;
  current_1rm: number;
  slope: number;
  intercept: number;
}

// Get all profil VBT entries for current user
export async function getProfilVbt(): Promise<ProfilVbtEntry[]> {
  const token = getCookie('token');
  
  const response = await fetch(`${API_BASE_URL}/profil_vbt`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail || 'Erreur lors de la récupération du profil VBT');
  }

  const data = await response.json();
  
  // Handle different response formats
  if (Array.isArray(data)) {
    return data;
  }
  if (Array.isArray(data?.data)) {
    return data.data;
  }
  
  return [];
}

// Create or update profil VBT entry
export async function createProfilVbt(payload: CreateProfilVbtPayload): Promise<ProfilVbtEntry> {
  const token = getCookie('token');
  
  const response = await fetch(`${API_BASE_URL}/profil_vbt`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail || 'Erreur lors de la création du profil VBT');
  }

  return response.json();
}
