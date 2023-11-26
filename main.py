from typing import Union
from fastapi import FastAPI, Request
from utils.spotify_client import SpotifyClient
from fastapi.responses import RedirectResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware

spotify_client = SpotifyClient()

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
    spotify_client.get_spotify_access_token(code)
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
    return result

@app.get("/")
def read_item():
    # return user html page 
    # src javascript file
    if getattr(spotify_client, "headers", ""):
        code = cache.get("access_code", "")
        if code:
            success = spotify_client.get_spotify_access_token(code)
            if not success:
                return RedirectResponse("http://localhost:8888/login")
        else:
            return RedirectResponse("http://localhost:8888/login")
    else:
        return RedirectResponse("http://localhost:8888/login")

    return spotify_client.get_me()