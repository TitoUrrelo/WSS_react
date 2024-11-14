from rest_framework import serializers
from art_app.models import *


class ARTSerializer(serializers.ModelSerializer):
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