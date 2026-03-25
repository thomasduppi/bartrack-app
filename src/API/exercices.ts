import { API_BASE_URL } from '../config';
import { getCookie } from '../utils/cookies';

export interface Exercice {
  id_exercice: number;
  nom: string;
}

// Get all exercices
export async function getAllExercices(): Promise<Exercice[]> {
  const token = getCookie('token');
  
  const response = await fetch(`${API_BASE_URL}/exercices`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail || 'Erreur lors de la récupération des exercices');
  }

  const data = await response.json();

  if (Array.isArray(data)) {
    return data;
  }
  if (Array.isArray(data?.data)) {
    return data.data;
  }
  
  return [];
}