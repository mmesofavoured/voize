from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.http import FileResponse
import os

def react_app(request, path=''):
    index_path = os.path.join(settings.BASE_DIR, 'frontend', 'build', 'index.html')
    return FileResponse(open(index_path, 'rb'))

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    re_path(r'^(?!api|admin|media|static).*$', react_app),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)