export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:8888";

export type SpotifyProfile = {
  id?: string;
  display_name?: string;
  email?: string;
  images?: { url: string }[];
  error?: { status?: number; message?: string };
};

export function getLoginUrl(): string {
  return `${API_BASE_URL}/login`;
}

export async function fetchProfile(): Promise<SpotifyProfile> {
  const response = await fetch(`${API_BASE_URL}/getme`);
  if (!response.ok) {
    throw new Error(`/getme failed with status ${response.status}`);
  }
  return response.json();
}

export async function fetchGenres(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/genres`);
  if (!response.ok) {
    throw new Error(`/genres failed with status ${response.status}`);
  }
  const data = await response.json();
  return Array.isArray(data.genres) ? data.genres : [];
}

export async function createPlaylist(genres: string[] = []): Promise<void> {
  const params = new URLSearchParams();
  genres.forEach((genre) => params.append("genres", genre));
  const query = params.toString();
  const response = await fetch(`${API_BASE_URL}/create_playlist${query ? `?${query}` : ""}`);
  if (!response.ok) {
    throw new Error(`/create_playlist failed with status ${response.status}`);
  }
}

export function isLoggedInProfile(profile: SpotifyProfile | null): profile is SpotifyProfile {
  return !!profile && !profile.error && !!profile.id;
}
