from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('apps.core.urls')),
    path('api/users/', include('apps.users.urls')),
    path('api/auth/', include('apps.users.auth.urls')),
]

# 🔹 Media fayllarni local rejimda ko‘rsatish
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
else:
    # DEBUG=False bo‘lganda serve ishlashi uchun:
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', serve,
                {'document_root': settings.MEDIA_ROOT}),
    ]

# 🔹 Static fayllar
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
