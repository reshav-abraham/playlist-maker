from typing import Union
from fastapi import FastAPI, Request
from utils.spotify_client import SpotifyClient
from fastapi.responses import RedirectResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

spotify_client = SpotifyClient()

app = FastAPI()

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