import { API_BASE_URL } from '../config';
import { getCookie } from '../utils/cookies';

export interface Rm1UsersPayload {
  id_exercice: number;
  current_1rm: number;
}

export interface Rm1UsersResponse {
  [key: string]: unknown;
}

// Create or update 1RM for user
export async function createRm1User(payload: Rm1UsersPayload): Promise<Rm1UsersResponse> {
  const token = getCookie('token');
  
  const response = await fetch(`${API_BASE_URL}/rm1_users`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail || 'Erreur lors de l\'enregistrement du 1RM');
  }

  return response.json();
}
