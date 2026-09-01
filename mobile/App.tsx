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
  fetchProfile,
  getLoginUrl,
  isLoggedInProfile,
  SpotifyProfile,
} from "./src/api";

type BusyState = "idle" | "checkingProfile" | "creatingPlaylist";

export default function App() {
  const [profile, setProfile] = useState<SpotifyProfile | null>(null);
  const [busy, setBusy] = useState<BusyState>("idle");
  const [message, setMessage] = useState("");

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
  }, [checkProfile]);

  const handleLogin = useCallback(async () => {
    await WebBrowser.openBrowserAsync(getLoginUrl());
    checkProfile();
  }, [checkProfile]);

  const handleCreatePlaylist = useCallback(async () => {
    setBusy("creatingPlaylist");
    setMessage("");
    try {
      await createPlaylist();
      setMessage("Playlist created — check Spotify!");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not create the playlist.");
    } finally {
      setBusy("idle");
    }
  }, []);

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

              <TouchableOpacity
                style={[styles.button, busy === "creatingPlaylist" && styles.buttonDisabled]}
                onPress={handleCreatePlaylist}
                disabled={busy === "creatingPlaylist"}
              >
                {busy === "creatingPlaylist" ? (
                  <ActivityIndicator color="#121212" />
                ) : (
                  <Text style={styles.buttonText}>Create Playlist</Text>
                )}
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
  secondaryButton: { marginTop: 16, alignItems: "center", padding: 8 },
  secondaryButtonText: { color: "#1DB954", fontSize: 14, fontWeight: "600" },
  message: {
    color: "#f28b82",
    textAlign: "center",
    marginTop: 20,
    fontSize: 13,
  },
});
