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

export async function createPlaylist(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/create_playlist`);
  if (!response.ok) {
    throw new Error(`/create_playlist failed with status ${response.status}`);
  }
}

export function isLoggedInProfile(profile: SpotifyProfile | null): profile is SpotifyProfile {
  return !!profile && !profile.error && !!profile.id;
}
