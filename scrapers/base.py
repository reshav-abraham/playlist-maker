import requests
from bs4 import BeautifulSoup

class BaseScraper:
    # A class for scraping html. Will eventually have some light nlp 
    # functions as well
    def get_html_data(self, url):
        response = requests.get(url)
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, features="html.parser")
            return soup
        else:
            return ""
    
    def is_artist(self, text):
        # title case
        # by
        # emphasized text
        return False