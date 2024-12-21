from django.urls import path
from art_app.views import *

urlpatterns = [

    path('RiesgoCritico/', obtenerRiesgoCritico),
    path('ObtenerArt2/<int:art_id>/', obtenerArt2),
    path('ObtenerArt/<int:art_id>/', obtenerArt),
    path('regisRespArt/', registrarRespuesta),
    path('RiesgoCritico/<int:id>/', modificarRiesgoCritico),
    path('ART/ObtenerFecha/<str:fecha>', obtenerArtPorFecha),
    path('ART/ObtenerRut/<str:rut>', obtenerArtPorRut),
    path('ArtRealizadas/<str:supervisor_nombre>', ArtRealizadaPorSupervisor),
    path('Actividad/<str:act_nombre>/', obtenerDatosActividad),
    path('Estado/<int:art_id>/', cambiarEstadoArt),
    path('regisRespArtSuper/', registrarRespuestasSupervisor),
    path('editarEstadoSuper/<int:art_id>/', editarEstadoSuper),
    path('artPorActividad/', contarArtActividad),
    path('arts_por_empleado/<str:emp_rut>/', obtener_arts_por_empleado, name='arts_por_empleado'),
]