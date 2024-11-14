from django.urls import path
from art_app.views import *

urlpatterns = [

    path('RiesgoCritico/', obtenerRiesgoCritico),
    path('Actividad/', obtenerActividad),
    path('Arts/', obtenerArt),
    path('RiesgoCritico/<int:id>/', modificarRiesgoCritico),
    path('ART/ObtenerFecha/<str:fecha>', obtenerArtPorFecha),
    path('ART/ObtenerRut/<str:rut>', obtenerArtPorRut),
    path('ArtRealizadas/', ArtRealizada),
]