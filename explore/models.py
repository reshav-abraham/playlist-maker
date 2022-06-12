from django.db import models

# Create your models here.
class UserProfile(models.Model):
    user_name = models.CharField(max_length=50)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.CharField(max_length=50)


class Artist(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    artist_name = models.CharField(max_length=140)
    genre = models.CharField(max_length=50)

class RecordCompany(models.Model):
    name = models.CharField(max_length=140)
    artists = models.ForeignKey(Artist, on_delete=models.CASCADE)

class Producer(models.Model):
    name = models.CharField(max_length=140)
    company = models.ForeignKey(RecordCompany, on_delete=models.CASCADE)

class Album(models.Model):
    name = models.CharField(max_length=140)
    primary_artist = models.ForeignKey(Artist, on_delete=models.CASCADE)
    producer = models.ForeignKey(Producer, on_delete=models.CASCADE)
    

class Track(models.Model):
    name = models.CharField(max_length=140)
    primary_artist = models.ForeignKey(Artist, on_delete=models.CASCADE)
    genre = models.CharField(max_length=140)
    instruments =  models.CharField(max_length=140)

class Blog(models.Model):
    # Will try to scrape Artists, Labels, from site
    description = models.CharField(max_length=50)
    link = models.CharField(max_length=50)
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE)
    album = models.ForeignKey(Album, on_delete=models.CASCADE)
    track = models.ForeignKey(Track, on_delete=models.CASCADE)
    producer = models.ForeignKey(Producer, on_delete=models.CASCADE)