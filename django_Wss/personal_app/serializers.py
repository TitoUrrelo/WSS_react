from rest_framework import serializers
from personal_app import models
from personal_app.models import Empleado


class PersonalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empleado
        fields = '__all__'