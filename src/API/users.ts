import { API_BASE_URL } from '../config';

// Register a new user
export async function registerUser(userData: {
  nom: string;
  prenom: string;
  email: string;
  mot_de_passe: string;
  date_naissance: string;
  poids_corps: number;
  sexe: string;
}) {
  const response = await fetch(`${API_BASE_URL}/users/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail || 'Erreur lors de l\'inscription');
  }

  return response.json();
}

// Get current user profile
export async function getCurrentUserProfile() {
  const token = getCookie('token');
  
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail || 'Erreur lors de la récupération du profil');
  }

  return response.json();
}

// Update current user profile
export async function updateCurrentUserProfile(userData: {
  nom?: string;
  prenom?: string;
  date_naissance?: string;
  poids_corps?: number;
  sexe?: string;
}) {
  const token = getCookie('access_token');
  
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail || 'Erreur lors de la mise à jour du profil');
  }

  return response.json();
}

// Helper function to get cookie
function getCookie(name: string): string {
  const encodedName = `${encodeURIComponent(name)}=`;
  const parts = document.cookie.split(';').map((part) => part.trim());
  const match = parts.find((part) => part.startsWith(encodedName));
  if (!match) return '';
  return decodeURIComponent(match.slice(encodedName.length));
}
