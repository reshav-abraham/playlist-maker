from scrapers.base import BaseScraper
from utils.constants import GENRES
from random import sample
import re

class BandCampScraper(BaseScraper):
    def __init__(self, genre_settings=[]):
        super().__init__()
        self.url = "https://bandcamp.com/"
        self.genres = sample(GENRES, 12) if len(genre_settings) == 0 else genre_settings

    def get_artists_by_genre(self, genre):
        genre_url = f"{self.url}/tag/{genre}"
        html_data = self.get_html_data(genre_url)

        # band camp likes using div courousels for holding artist info
        # maybe this can be a configurable setting
        # courousel_divs = html_data.find_all("div", {"id": re.compile('carousel')})

        # Will most likely refactor
        artists = [artist_div.text.replace("by", "").strip() for artist_div in html_data.find_all("div", {"class": re.compile('artist')})]
        # will probably filter for good data
        artists = set(artists)
        if len(artists) > 4:
            return sample(artists, 3)
        return list(artists)
    
    def scrape_artists(self):
        # good oporutunity for multiprocessing
        # will loop for now
        return [self.get_artists_by_genre(genre) for genre in sample(GENRES, 12)]
