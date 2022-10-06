import requests
from django.test import TestCase
from urllib.parse import urlencode
from utils.spotify_client import SpotifyClient

class TestSpotifyClient(TestCase):
    def setUp(self):
        # https://api.spotify.com/v1/me/top/artists 
        self.headers = {'Authorization': 'Bearer xxxx'}
        self.spotify_client = SpotifyClient()

    def test_search_artist(self):
        url = "https://api.spotify.com/v1/search"
        query_params = urlencode({
            "q": "Miles Davis", "type": "artist", "market": "US"
        })
        response = requests.get(f'{url}?{query_params}', headers=self.headers)
        print(response.json()["artists"]["items"][0]["id"])
    
    def test_get_artist_top_tracks(self):
        url = "https://api.spotify.com/v1/artists/0kbYTNQb4Pb1rPbbaF0pT4/top-tracks?market=US"
        response = requests.get(url, headers=self.headers)
        print(response.json()["tracks"][0]["id"])
    
    def test_add_item_to_playlist(self):
        url = "https://api.spotify.com/v1/me/playlists"
        playlist_id= "3DgDR6rGNZpB7boASQSkyJ"
        response = requests.get(url, headers=self.headers)
        print(response.json())


