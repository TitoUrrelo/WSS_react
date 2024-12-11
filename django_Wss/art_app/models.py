from django.db import models
from personal_app.models import Empleado

# Create your models here.
class RiesgoCritico(models.Model):
    rc_id = models.BigAutoField(primary_key=True)
    rc_nombre = models.CharField(max_length=100)
    rc_pregunta = models.CharField(max_length=200)
    rc_respuesta = models.BooleanField()

class Actividad(models.Model):
    act_id = models.BigAutoField(primary_key=True)
    act_nombre = models.CharField(max_length=100)
    act_riesgo = models.CharField(max_length=300)
    act_medida_control = models.CharField(max_length=300)

    riesgo_critico = models.ManyToManyField(RiesgoCritico)

class Pregunta(models.Model):
    pre_id = models.BigAutoField(primary_key=True)
    pre_descripcion = models.CharField(max_length=200)
    pre_cargo = models.CharField(max_length=50)
    pre_respuesta = models.BooleanField()

class Art(models.Model):
    art_id = models.BigAutoField(primary_key=True)
    art_trab_simultaneo = models.BooleanField(default=False)
    art_estado_trab = models.BooleanField(default=False)
    art_hora_inicio = models.TimeField()
    art_hora_fin = models.TimeField()
    art_fecha = models.DateField()
    art_supervisor = models.CharField(max_length=200)
    art_estado = models.CharField(max_length=200)
    art_comunicAccions = models.BooleanField()
    art_contextTrabSim = models.TextField(max_length=150, default='')
    art_coordLider = models.BooleanField()
    art_verfControles = models.BooleanField()

    # Método para establecer la lista en el campo art_contextTrabSim
    def set_art_contextTrabSim(self, context_list):
        # Convierte la lista en una cadena separada por comas
        self.art_contextTrabSim = ','.join(context_list)

    # Método para recuperar la lista desde art_contextTrabSim
    def get_art_contextTrabSim(self):
        # Convierte la cadena separada por comas en una lista
        return self.art_contextTrabSim.split(',') if self.art_contextTrabSim else []

    pregunta = models.ManyToManyField(Pregunta, through='ArtPregunta')
    actividad = models.ManyToManyField(Actividad)
    empleado = models.ManyToManyField(Empleado)

class ArtPregunta(models.Model):
    id_art = models.ForeignKey(Art, on_delete=models.CASCADE)
    id_pregunta = models.ForeignKey(Pregunta, on_delete=models.CASCADE)
    respuestaTrans = models.BooleanField()

class RespuestaRiesgo(models.Model):
    id = models.BigAutoField(primary_key=True)
    art = models.ForeignKey('Art', on_delete=models.CASCADE, related_name='respuestas_riesgo')  # Relación con art_app_art
    riesgo_critico = models.ForeignKey('RiesgoCritico', on_delete=models.CASCADE)  # Relación con el riesgo crítico
    pregunta_numero = models.IntegerField()  # Número de la pregunta
    respuesta = models.BooleanField()  # Respuesta dada (True o False)
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE)  # Empleado que responde