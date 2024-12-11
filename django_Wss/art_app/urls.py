from django.urls import path
from art_app.views import *

urlpatterns = [

    path('RiesgoCritico/', obtenerRiesgoCritico),
    path('ObtenerArt2/', obtenerArt2),
    path('ObtenerArt/<int:art_id>/', obtenerArt),
    path('regisRespArt/', registrarRespuesta),
    path('RiesgoCritico/<int:id>/', modificarRiesgoCritico),
    path('ART/ObtenerFecha/<str:fecha>', obtenerArtPorFecha),
    path('ART/ObtenerRut/<str:rut>', obtenerArtPorRut),
    path('ArtRealizadas/', ArtRealizada),
    path('Actividad/<str:act_nombre>/', obtenerDatosActividad),
    path('Estado/<int:art_id>/', cambiarEstadoArt),
    path('regisRespArtSuper/', registrarRespuestasSupervisor,)
]