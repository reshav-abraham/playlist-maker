import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import {
  createPlaylist,
  fetchGenres,
  fetchProfile,
  getLoginUrl,
  isLoggedInProfile,
  SpotifyProfile,
} from "./src/api";

type BusyState = "idle" | "checkingProfile" | "creatingPlaylist";

function formatGenreLabel(genre: string): string {
  return genre
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function App() {
  const [profile, setProfile] = useState<SpotifyProfile | null>(null);
  const [busy, setBusy] = useState<BusyState>("idle");
  const [message, setMessage] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const checkProfile = useCallback(async () => {
    setBusy("checkingProfile");
    setMessage("");
    try {
      const data = await fetchProfile();
      if (!isLoggedInProfile(data)) {
        setProfile(null);
        setMessage("Not logged in yet — connect with Spotify, then try again.");
        return;
      }
      setProfile(data);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not reach the server.");
    } finally {
      setBusy("idle");
    }
  }, []);

  useEffect(() => {
    checkProfile();
    fetchGenres()
      .then(setGenres)
      .catch(() => {
        // genre picker is optional — Surprise Me still works without it
      });
  }, [checkProfile]);

  const handleLogin = useCallback(async () => {
    await WebBrowser.openBrowserAsync(getLoginUrl());
    checkProfile();
  }, [checkProfile]);

  const toggleGenre = useCallback((genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  }, []);

  const runCreatePlaylist = useCallback(async (genresToUse: string[]) => {
    setBusy("creatingPlaylist");
    setMessage("");
    try {
      await createPlaylist(genresToUse);
      setMessage(
        genresToUse.length
          ? `Playlist created from ${genresToUse.length} genre${
              genresToUse.length > 1 ? "s" : ""
            } — check Spotify!`
          : "Playlist created — check Spotify!"
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not create the playlist.");
    } finally {
      setBusy("idle");
    }
  }, []);

  const handleCreatePlaylist = useCallback(
    () => runCreatePlaylist(selectedGenres),
    [runCreatePlaylist, selectedGenres]
  );

  const handleSurpriseMe = useCallback(() => {
    setSelectedGenres([]);
    runCreatePlaylist([]);
  }, [runCreatePlaylist]);

  const handleLogOut = useCallback(() => {
    setProfile(null);
    setMessage("");
  }, []);

  const avatarUrl = profile?.images?.[0]?.url;
  const loggedIn = isLoggedInProfile(profile);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        <Text style={styles.title}>Playlist Maker</Text>
        <Text style={styles.subtitle}>
          Discover Bandcamp artists and drop their top tracks into your Spotify playlist.
        </Text>

        <View style={styles.card}>
          {loggedIn ? (
            <>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarInitial}>
                    {(profile?.display_name?.[0] ?? "?").toUpperCase()}
                  </Text>
                </View>
              )}
              <Text style={styles.name}>{profile?.display_name ?? "Spotify user"}</Text>
              {!!profile?.email && <Text style={styles.email}>{profile.email}</Text>}

              {genres.length > 0 && (
                <View style={styles.genreSection}>
                  <Text style={styles.genreLabel}>Pick genres (optional)</Text>
                  <View style={styles.genreGrid}>
                    {genres.map((genre) => {
                      const selected = selectedGenres.includes(genre);
                      return (
                        <TouchableOpacity
                          key={genre}
                          style={[styles.genreChip, selected && styles.genreChipSelected]}
                          onPress={() => toggleGenre(genre)}
                          disabled={busy === "creatingPlaylist"}
                        >
                          <View style={[styles.checkbox, selected && styles.checkboxChecked]}>
                            {selected && <Text style={styles.checkmark}>✓</Text>}
                          </View>
                          <Text
                            style={[
                              styles.genreChipText,
                              selected && styles.genreChipTextSelected,
                            ]}
                          >
                            {formatGenreLabel(genre)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={[styles.button, busy === "creatingPlaylist" && styles.buttonDisabled]}
                onPress={handleCreatePlaylist}
                disabled={busy === "creatingPlaylist"}
              >
                {busy === "creatingPlaylist" ? (
                  <ActivityIndicator color="#121212" />
                ) : (
                  <Text style={styles.buttonText}>
                    {selectedGenres.length
                      ? `Create Playlist (${selectedGenres.length})`
                      : "Create Playlist"}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.surpriseButton, busy === "creatingPlaylist" && styles.buttonDisabled]}
                onPress={handleSurpriseMe}
                disabled={busy === "creatingPlaylist"}
              >
                <Text style={styles.surpriseButtonText}>🎲 Surprise Me</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton} onPress={handleLogOut}>
                <Text style={styles.secondaryButtonText}>Log out</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.button, busy === "checkingProfile" && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={busy === "checkingProfile"}
              >
                <Text style={styles.buttonText}>Connect with Spotify</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton} onPress={checkProfile}>
                {busy === "checkingProfile" ? (
                  <ActivityIndicator color="#1DB954" />
                ) : (
                  <Text style={styles.secondaryButtonText}>I already logged in — refresh</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>

        {!!message && <Text style={styles.message}>{message}</Text>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  content: { flex: 1, padding: 24, justifyContent: "center" },
  title: { fontSize: 32, fontWeight: "700", color: "#fff", textAlign: "center" },
  subtitle: {
    fontSize: 14,
    color: "#a7a7a7",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 32,
  },
  card: {
    backgroundColor: "#1e1e1e",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  avatar: { width: 88, height: 88, borderRadius: 44, marginBottom: 16 },
  avatarPlaceholder: {
    backgroundColor: "#2a2a2a",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: { fontSize: 32, color: "#fff", fontWeight: "600" },
  name: { fontSize: 20, fontWeight: "600", color: "#fff" },
  email: { fontSize: 13, color: "#a7a7a7", marginTop: 4, marginBottom: 20 },
  button: {
    backgroundColor: "#1DB954",
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: "100%",
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#121212", fontWeight: "700", fontSize: 16 },
  surpriseButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#3a3a3a",
    paddingVertical: 12,
    paddingHorizontal: 32,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  surpriseButtonText: { color: "#e6e6e6", fontWeight: "600", fontSize: 14 },
  secondaryButton: { marginTop: 16, alignItems: "center", padding: 8 },
  secondaryButtonText: { color: "#1DB954", fontSize: 14, fontWeight: "600" },
  genreSection: { width: "100%", marginTop: 20, marginBottom: 4 },
  genreLabel: { color: "#a7a7a7", fontSize: 13, marginBottom: 10, fontWeight: "600" },
  genreGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  genreChip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3a3a3a",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  genreChipSelected: { borderColor: "#1DB954", backgroundColor: "rgba(29, 185, 84, 0.15)" },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#666",
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: "#1DB954", borderColor: "#1DB954" },
  checkmark: { color: "#121212", fontSize: 11, fontWeight: "700" },
  genreChipText: { color: "#e6e6e6", fontSize: 13 },
  genreChipTextSelected: { color: "#fff", fontWeight: "600" },
  message: {
    color: "#f28b82",
    textAlign: "center",
    marginTop: 20,
    fontSize: 13,
  },
});
