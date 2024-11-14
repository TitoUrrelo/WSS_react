from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import status
from art_app.models import *
from art_app.serializers import *


@api_view(['GET'])
def ArtRealizada(request):
    # Utilizamos prefetch_related para las relaciones Many-to-Many
    resultados = Art.objects.prefetch_related('empleado', 'actividad', 'pregunta').all()

    datos = []
    for resultado in resultados:
        datos.append({
            'art_id': resultado.art_id,
            'trabajo_simultaneo': resultado.art_trab_simultaneo,
            'estado_trab': resultado.art_estado_trab,
            'hora_inicio': resultado.art_hora_inicio,
            'hora_fin': resultado.art_hora_fin,
            'empleados': [{'rut': empleado.emp_rut, 'nombre': empleado.emp_nombre} for empleado in resultado.empleado.all()],
            'actividades': [{'nombre': actividad.act_nombre, 'riesgo': actividad.act_riesgo, 'medida_control': actividad.act_medida_control} for actividad in resultado.actividad.all()],
        })

    return Response(datos)

@api_view(['GET', 'POST'])
def obtenerRiesgoCritico(request):
    if request.method == 'GET':
        riesgoCrit_obt = RiesgoCritico.objects.all()
        serializado = RiesgoCriticoSerializer(riesgoCrit_obt, many=True)
        return Response(serializado.data)

    if request.method == 'POST':
        deserializado = RiesgoCriticoSerializer(data=request.data)
        if deserializado.is_valid():
            deserializado.save()
            return Response(deserializado.data)

@api_view(['DELETE', 'PATCH'])
def modificarRiesgoCritico(request, id):
    try:
        riesgoCritico = RiesgoCritico.objects.get(id=id)
    except:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PATCH':
        serializado = RiesgoCriticoSerializer(riesgoCritico, data=request.data)
        if serializado.is_valid():
            serializado.save()
            return Response(serializado.data)

    if request.method == 'DELETE':
        riesgoCritico.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'POST'])
def obtenerActividad(request):
    if request.method == 'GET':
        act_obtener = Actividad.objects.all()
        serializer = ActividadSerializer(act_obtener, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        deserializado = ActividadSerializer(data=request.data)
        if deserializado.is_valid():
            deserializado.save()
            return Response(deserializado.data)

        return Response(deserializado.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE', 'PATCH'])
def modificarActividad(request, pk):
    try:
        actividad = Actividad.objects.get(pk=pk)
    except:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PATCH':
        serializado = RiesgoCriticoSerializer(actividad, data=request.data)
        if serializado.is_valid():
            serializado.save()
            return Response(serializado.data)

    if request.method == 'DELETE':
        actividad.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'POST'])
def obtenerArt(request):
    if request.method == 'GET':
        art_obtener = Art.objects.all()
        serializer = ARTSerializer(art_obtener, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        serializer = ARTSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE', 'PATCH'])
def modificarArt(request, pk):
    try:
        art = Art.objects.get(pk=pk)
    except:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PATCH':
        serializado = RiesgoCriticoSerializer(art, data=request.data)
        if serializado.is_valid():
            serializado.save()
            return Response(serializado.data)

    if request.method == 'DELETE':
        art.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
def obtenerArtPorFecha(request, fecha):
    if not fecha:
        return Response({'error': 'Por favor, proporciona una fecha.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Filtra los objetos Art por la fecha proporcionada
        art_obtener = Art.objects.filter(art_fecha=fecha)

        if not art_obtener.exists():
            return Response({'message': 'No se encontraron registros para la fecha proporcionada.'},
                            status=status.HTTP_404_NOT_FOUND)

        # Utiliza el serializador adecuado para Art
        serializer = ARTSerializer(art_obtener, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except ValueError:
        return Response({'error': 'Formato de fecha inválido. Usa el formato AAAA-MM-DD.'},
                        status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def obtenerArtPorRut(request, rut):
    if not rut:
        return Response({'error': 'Por favor, proporciona un RUT.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Filtra los objetos Art por el RUT del empleado
        art_obtener = Art.objects.filter(empleado__emp_rut=rut)

        if not art_obtener.exists():
            return Response({'message': 'No se encontraron registros para el RUT proporcionado.'},
                            status=status.HTTP_404_NOT_FOUND)

        # Utiliza el serializador adecuado para Art
        serializer = ARTSerializer(art_obtener, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except ValueError:
        return Response({'error': 'Formato de RUT inválido.'}, status=status.HTTP_400_BAD_REQUEST)