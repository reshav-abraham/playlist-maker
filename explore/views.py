from wsgiref import headers
from django.shortcuts import render, redirect
from django.http import HttpResponse
import requests
import os, json
from utils.helpers import generate_random_string
from urllib.parse import urlencode

# Create your views here.
def index(request):
    return HttpResponse("something")

class SpotifyClient:
    def __init__(self):
        self.client_id = os.environ.get("SPOTIFY_CLIENT_ID")
        self.client_secret = client_id = os.environ.get("SPOTIFY_CLIENT_SECRET")
        self.redirect_uri = os.environ.get("SPOTIFY_APPROVED_REDIRECT")
        self.scope = os.environ.get("SPOTIFY_SCOPES")
        self.access_token = ""
    
    def login(self):
        state = generate_random_string(16);
        query_params = urlencode({
            "response_type": 'code',
            "client_id": self.client_id,
            "scope": self.scope,
            "redirect_uri": self.redirect_uri,
            "state": state
        })
        return redirect(f'https://accounts.spotify.com/authorize?{query_params}')
    
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
        self.headers = {f'Authorization': f'Bearer {self.access_token}'}
    
    def get_spotify_top_artists(self):
        url = "https://api.spotify.com/v1/me/top/artists"
        print("headers", url, self.headers)
        response = requests.get(url, headers=self.headers)
        print("123", response.json())
        return response.json()

spotify_client = SpotifyClient()   
def spotify_login(request):
    return spotify_client.login()

def get_spotify_access_token(request):
    code = request.GET.get("code", '')
    spotify_client.get_spotify_access_token(code)
    return redirect("http://localhost:8888")

def get_top_artists(request):
    print("spotify_client.get_spotify_top_artists", spotify_client.get_spotify_top_artists())
    return HttpResponse(str(spotify_client.get_spotify_top_artists()))

