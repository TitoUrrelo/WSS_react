from django.db import models


# Create your models here.
class Empleado(models.Model):
    emp_rut = models.CharField(primary_key=True, max_length=10)
    emp_nombre = models.CharField(max_length=100)
    emp_correo = models.CharField(max_length=100)
    emp_telefono = models.CharField(max_length=9)
    emp_direccion = models.CharField(max_length=100)
    emp_cargo = models.CharField(max_length=100)
    emp_contraseña = models.CharField(max_length=32)
    emp_especialidad = models.CharField(max_length=100)
    emp_actividad = models.CharField(max_length=100)