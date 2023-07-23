from typing import Union
from fastapi import FastAPI
from utils.spotify_client import SpotifyClient
from fastapi.responses import RedirectResponse

spotify_client = SpotifyClient()

app = FastAPI()


@app.get("/callback")
def read_root(code):
    spotify_client.get_spotify_access_token(code)
    return RedirectResponse("http://localhost:8888")

@app.get("/login")
def login():
    result = spotify_client.get_login_redirect()
    return RedirectResponse(result)

@app.get("/")
def read_item():
    # return user html page 
    # src javascript file
    return spotify_client.get_me()