from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.http import FileResponse, HttpResponse
import os

def react_app(request, path=''):
    index_path = os.path.join(settings.BASE_DIR, 'frontend', 'build', 'index.html')
    return FileResponse(open(index_path, 'rb'))

def serve_media(request, path):
    file_path = os.path.join(settings.MEDIA_ROOT, path)
    if os.path.exists(file_path):
        response = FileResponse(open(file_path, 'rb'), content_type='audio/mpeg')
        response['Access-Control-Allow-Origin'] = '*'
        return response
    return HttpResponse(status=404)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    re_path(r'^media/(?P<path>.*)$', serve_media),
    re_path(r'^(?!api|admin|media|static).*$', react_app),
]