from typing import Union
from fastapi import FastAPI, Request
from utils.spotify_client import SpotifyClient
from fastapi.responses import RedirectResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from scrapers.band_camp.band_camp_scraper import BandCampScraper

spotify_client = SpotifyClient()
scraper = BandCampScraper()

app = FastAPI()


origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/home/{id}", response_class=HTMLResponse)
async def read_item(request: Request, id: str):
    return templates.TemplateResponse("items.html", {"request": request, "id": id})


# @app.get("/home")
# def home():
#     return StaticFiles('index.html')


# create routes for views
# create api for user management
# create api for playlist/music api
# create api for social interactions
cache = dict()

@app.get("/callback")
def read_root(code):
    cache["access_code"] = code
    # cache the access code for the token
    spotify_client.code = code
    spotify_client.get_spotify_access_token()
    return RedirectResponse("http://localhost:8888/home")

@app.get("/login")
def login():
    # the user can already be logged in 
    # which immediately returns a valid redirect
    # 
    result = spotify_client.get_login_redirect()
    return RedirectResponse(result)

@app.get("/home")
def home():
    result = spotify_client.get_me()
    code = cache.get("access_code", "")
    return RedirectResponse(f"http://localhost:3000/{code}")

@app.get("/yo")
def yo(request: Request):
    print(request)
    code = request.headers['authorization'].split()[-1]
    spotify_client.get_spotify_access_token(code)
    return spotify_client.get_me()

@app.get("/getme")
def test():
    # print(request)
    # code = request.headers['authorization'].split()[-1]
    code = cache.get("access_code", "")
    spotify_client.get_spotify_access_token()
    return spotify_client.get_me()

@app.get("/create_playlist")
def create_play_list():
    artists = scraper.scrape_artists()
    spotify_client.create_playlist_by_artist(artists)

@app.get("/")
def read_item():
    # return user html page 
    # src javascript file
    if getattr(spotify_client, "headers", ""):
        code = cache.get("access_code", "")
        spotify_client.code = code
        if code:
            success = spotify_client.get_spotify_access_token()
            if not success:
                return RedirectResponse("http://localhost:8888/login")
        else:
            return RedirectResponse("http://localhost:8888/login")
    else:
        return RedirectResponse("http://localhost:8888/login")

    return spotify_client.get_me()