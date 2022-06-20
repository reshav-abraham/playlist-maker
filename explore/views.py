from wsgiref import headers
from django.shortcuts import render, redirect
from django.http import HttpResponse
import requests
import os, json
from utils.helpers import generate_random_string
from urllib.parse import urlencode
from scrapers.band_camp.band_camp_scraper import BandCampScraper
from utils.spotify_client import SpotifyClient

spotify_client = SpotifyClient()
# will change this to be configurable by scraper, got lazy
scraper = BandCampScraper()

# Create your views here.
def index(request):
    return HttpResponse("something")

def spotify_login(request):
    return redirect(spotify_client.get_login_redirect())

def get_spotify_access_token(request):
    code = request.GET.get("code", '')
    spotify_client.get_spotify_access_token(code)
    return redirect("http://localhost:8888")

def get_top_artists(request):
    print("spotify_client.get_spotify_top_artists", spotify_client.get_spotify_top_artists())
    return HttpResponse(str(spotify_client.get_spotify_top_artists()))

def create_random_playlist(request):
    # this will return a list of random artists
    # by random genre. Will refactor
    artists = scraper.scrape_artists()
    spotify_client.create_playlist_by_artist(artists)
    return HttpResponse("something")