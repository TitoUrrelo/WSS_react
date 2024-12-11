from rest_framework import serializers
from art_app.models import *

class ArtPreguntaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArtPregunta
        fields = '__all__'

class RespuestaRiesgoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RespuestaRiesgo
        fields = '__all__'

class ARTSerializer(serializers.ModelSerializer):
    respuestas_riesgo = RespuestaRiesgoSerializer(many=True, read_only=True )
    preguntas_art = ArtPreguntaSerializer(many=True, read_only=True, source='artpregunta_set')  # Relación inversa desde Art
    class Meta:
        model = Art
        fields = '__all__'

class RiesgoCriticoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RiesgoCritico
        fields = '__all__'

class ActividadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Actividad
        fields = '__all__'

class PreguntaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pregunta
        fields = '__all__'