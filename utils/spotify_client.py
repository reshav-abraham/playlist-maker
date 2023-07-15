import requests
import os, random
from utils.helpers import generate_random_string
from urllib.parse import urlencode

class SpotifyClient:
    def __init__(self):
        self.client_id = os.environ.get("SPOTIFY_CLIENT_ID")
        self.client_secret = os.environ.get("SPOTIFY_CLIENT_SECRET")
        self.redirect_uri = os.environ.get("SPOTIFY_APPROVED_REDIRECT")
        self.scope = os.environ.get("SPOTIFY_SCOPES")
        self.access_token = ""
    
    def get_login_redirect(self):
        state = generate_random_string(16);
        query_params = urlencode({
            "response_type": 'code',
            "client_id": self.client_id,
            "scope": self.scope,
            "redirect_uri": self.redirect_uri,
            "state": state
        })
        return f'https://accounts.spotify.com/authorize?{query_params}'
    
    def get_spotify_access_token(self, code):
        client_id = os.environ.get("SPOTIFY_CLIENT_ID")
        client_secret = os.environ.get("SPOTIFY_CLIENT_SECRET")
        redirect_uri = os.environ.get("SPOTIFY_APPROVED_REDIRECT")
        # state = request.GET.get("state", '')
        data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": redirect_uri,
            "client_id": client_id,
            "client_secret": client_secret,
        }
        response = requests.post(url="https://accounts.spotify.com/api/token", data=data)
        self.access_token = response.json()['access_token']
        print("access_token", self.access_token)
        self.headers = {f'Authorization': f'Bearer {self.access_token}'}
    
    def get_spotify_top_artists(self):
        url = "https://api.spotify.com/v1/me/top/artists"
        response = requests.get(url, headers=self.headers)
        # print("123", response.json())
        return response.json()
    
    def get_me(self):
        url = "https://api.spotify.com/v1/me"
        response = requests.get(url, headers=self.headers)
        # print("123", response.json())
        return response.json()
    
    def search_spotify(self, search_params):
        url = "https://api.spotify.com/v1/search"
        # sample search params
        # "q": "Miles Davis", "type": "artist", "market": "US"
        query_params = urlencode(
           search_params
        )
        response = requests.get(f'{url}?{query_params}', headers=self.headers)
        # print("search results", response)
        print("search results", f'{url}?{query_params}', response.json())
        if response.status_code != 200 or len(response.json()["artists"]["items"]) == 0:
            return
        print("search results", response.json()["artists"]["items"][0]["id"])
        return response.json()["artists"]["items"][0]["id"]
    
    def get_top_track(self, artist_id):
        url = f"https://api.spotify.com/v1/artists/{artist_id}/top-tracks?market=US"
        response = requests.get(url, headers=self.headers)
        if response.status_code != 200 or len(response.json()["tracks"]) == 0:
            return
        print("get_top_track", response.json()["tracks"][0]["id"])
        
        len(response.json()["tracks"])
        random_track = random.randint(0, len(response.json()["tracks"])-1)
        return response.json()["tracks"][random_track]["id"]
    
    def add_to_playlist(self, playlist_id, track_ids):
        encoded_tracks = urlencode({"uris": track_ids})
        url = f"https://api.spotify.com/v1/playlists/{playlist_id}/tracks?{encoded_tracks}"
        response = requests.post(url, headers=self.headers)
        print(url)
        print(response.content)

    def create_playlist_by_artist(self, artists):
        # search for artist
        artists = sum(artists, [])
        track_ids = []
        for artist in artists:
            query = {"q": artist, "type": "artist", "market": "US"}
            artist_id = self.search_spotify(query)
            if not artist_id:
                print("artist not found", artist)
                continue
            track_id = self.get_top_track(artist_id)
            if not track_id:
                continue
            track_ids += ["spotify:track:"+track_id]
        track_ids = ",".join(track_ids)
        self.add_to_playlist(os.environ.get("SPOTIFY_PLAYLIST_ID"), track_ids)
        # create playlist
        return