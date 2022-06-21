from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings
from rest_framework.documentation import include_docs_urls

urlpatterns = [
    path('api-auth/', include('rest_framework.urls')),
    path('api/v1/', include([
        path('admin/', admin.site.urls),
        path('swagger/', include_docs_urls(title='Checklist pro API', permission_classes=[], authentication_classes=[])),
        path('core/', include(('core.urls', 'core'), namespace='core')),
        path('users/', include(('users.urls', 'user'), namespace='users')),
        path('main/', include(('main.urls', 'user'), namespace='main')),
    ])),
    path('sentry/', lambda request: 1 / 0),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
