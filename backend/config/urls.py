from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api-auth/', include('rest_framework.urls')),
    path('api/v1/', include([
        path('core/', include(('core.urls', 'core'), namespace='core')),
        path('users/', include(('users.urls', 'user'), namespace='users')),
        path('main/', include(('main.urls', 'user'), namespace='main')),
    ])),
    path('sentry/', lambda request: 1 / 0),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
