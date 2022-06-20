from django.test import TestCase
from scrapers.band_camp.band_camp_scraper import BandCampScraper

class TestBandCampScraper(TestCase):
    def setUp(self):
        self.scraper = BandCampScraper()

    def test_scraping_artists(self):
        artists = self.scraper.scrape_artists()
        print(artists)