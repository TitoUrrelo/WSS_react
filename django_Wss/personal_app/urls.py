from django.urls import path
from personal_app import views

urlpatterns = [
    path('Trabajadores/', views.obtenerTrabajadores),
    path('Empleado/<str:id>', views.obtenerEmpleado),
    path('Empleado/modificar/<str:id>/<str:idEmpleado>', views.modificarEmpleado),
    path('EmpleadosCargo/<str:cargo>', views.obtenerEmpleadosCargo),
    path('Login/', views.autenticarEmpleado),
    path('Actividad/<str:rut>/', views.modificarActividad),
    path('ActualizarActividad/<str:rut>/', views.actualizarActividadEmpleado),
]