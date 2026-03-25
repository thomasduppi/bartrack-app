export function getCookie(name: string): string {
  const encodedName = `${encodeURIComponent(name)}=`;
  const parts = document.cookie.split(';').map((part) => part.trim());
  const match = parts.find((part) => part.startsWith(encodedName));
  if (!match) return '';
  return decodeURIComponent(match.slice(encodedName.length));
}