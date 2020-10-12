import html
import os
import sys
from pymongo import MongoClient

from django.conf import settings
from django.core.wsgi import get_wsgi_application
from django.http import HttpResponse
from django.urls import path
from django.utils.crypto import get_random_string

settings.configure(
  DEBUG=(os.environ.get("DEBUG", "") == "1"),
  ALLOWED_HOSTS=["*"],  # Disable host header validation
  ROOT_URLCONF=__name__,  # Make this module the urlconf
  SECRET_KEY=os.environ.get("djangokey"),  # We aren't using any security features but Django requires this setting
)

mongoclient = MongoClient(os.environ.get("mongouri"))

def index(request):
  name = request.GET.get("name", "World")
  return HttpResponse(f"Hello, {html.escape(name)}!")

def gettrip(request):
  tripid = request.POST.get("tripid")
  
urlpatterns = [
  path("", index),
]

if __name__ == "__main__":
  from django.core.management import execute_from_command_line
  execute_from_command_line(sys.argv)