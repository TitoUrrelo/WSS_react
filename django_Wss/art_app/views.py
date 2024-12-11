from django.shortcuts import render, redirect
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import status
from art_app.models import *
from art_app.serializers import *
import json
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from io import BytesIO
from django.http import HttpResponse
from PyPDF2 import PdfReader, PdfWriter

@api_view(['PATCH'])
def cambiarEstadoArt(request, art_id):
    try:
        art = Art.objects.get(pk=art_id)
        nuevo_estado = request.data.get('art_estado')
        if nuevo_estado:
            art.art_estado = nuevo_estado
            art.save()
            return Response({'mensaje': 'Estado actualizado correctamente'}, status=200)
        else:
            return Response({'error': 'No se envió un estado válido'}, status=400)
    except Art.DoesNotExist:
        return Response({'error': 'ART no encontrada'}, status=404)

@api_view(['POST'])
def registrarRespuestasSupervisor(request):
    try:
        data = request.data
        
        preguntas = data.get('preguntas', [])
        respuestas_riesgo = data.get('respuestas_riesgo', [])

    
        for pregunta_data in preguntas:
            try:
                art = Art.objects.get(art_id=pregunta_data['art_id'])  
                pregunta = Pregunta.objects.get(pre_id=pregunta_data['id'])  
                
                ArtPregunta.objects.create(
                    id_art=art,
                    id_pregunta=pregunta,
                    respuestaTrans=pregunta_data['respuestaTrans']
                )
            except Art.DoesNotExist:
                return Response({'success': False, 'error': f'ART con id {pregunta_data["art_id"]} no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
            except Pregunta.DoesNotExist:
                return Response({'success': False, 'error': f'Pregunta con id {pregunta_data["id"]} no encontrada.'}, status=status.HTTP_404_NOT_FOUND)

        for respuesta_data in respuestas_riesgo:
            try:
                art = Art.objects.get(art_id=respuesta_data['art_id'])  # Obtener el ART correspondiente
                riesgo_critico = RiesgoCritico.objects.get(rc_id=respuesta_data['riesgo_critico'])  # Obtener el RiesgoCrítico
                empleado = Empleado.objects.get(emp_rut=respuesta_data['empleado'])  # Obtener el Empleado por su RUT
                
                # Crear la respuesta en la tabla RespuestaRiesgo
                RespuestaRiesgo.objects.create(
                    art=art,
                    riesgo_critico=riesgo_critico,
                    pregunta_numero=respuesta_data['pregunta_numero'],
                    respuesta=respuesta_data['respuesta'],
                    empleado=empleado
                )
            except Art.DoesNotExist:
                return Response({'success': False, 'error': f'ART con id {respuesta_data["art_id"]} no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
            except RiesgoCritico.DoesNotExist:
                return Response({'success': False, 'error': f'Riesgo crítico con id {respuesta_data["riesgo_critico"]} no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
            except Empleado.DoesNotExist:
                return Response({'success': False, 'error': f'Empleado con RUT {respuesta_data["empleado"]} no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        # Retornar una respuesta exitosa
        return Response({'success': True, 'message': 'Respuestas y ARTs registrados correctamente.'}, status=status.HTTP_201_CREATED)

    except Exception as e:
        # Manejar cualquier error no esperado
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)



@api_view(['POST'])
def registrarRespuesta(request):
    try:
        # Parseamos los datos del cuerpo de la solicitud
        data = request.data

        # Obtenemos el emp_rut del empleado desde la solicitud
        empleado_rut = data.get('empleado_rut')
        if not empleado_rut:
            return Response({'success': False, 'error': 'El campo empleado_rut es obligatorio'}, status=status.HTTP_400_BAD_REQUEST)

        # Obtenemos al empleado usando el emp_rut
        try:
            empleado = Empleado.objects.get(emp_rut=empleado_rut)
        except Empleado.DoesNotExist:
            return Response({'success': False, 'error': 'Empleado no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        # Datos de la ART
        art_data = data.get('art')
        respuestas = data.get('respuestas')  # Array de respuestas (pregunta_numero, riesgo_critico_id, respuesta)

        # Creamos siempre un nuevo ART
        art = Art.objects.create(
            art_comunicAccions=art_data.get('art_comunicAccions'),
            art_contextTrabSim=art_data.get('art_contextTrabSim'),
            art_coordLider=art_data.get('art_coordLider'),
            art_verfControles=art_data.get('art_verfControles'),
            art_trab_simultaneo=art_data.get('art_trab_simultaneo'),
            art_estado_trab=art_data.get('art_estado_trab'),
            art_hora_inicio=art_data.get('art_hora_inicio'),
            art_hora_fin=art_data.get('art_hora_fin'),
            art_fecha=art_data.get('art_fecha'),
            art_supervisor=art_data.get('art_supervisor'),
            art_estado=art_data.get('art_estado')  # Agregado para manejar el nuevo campo art_estado
        )

        # Asociamos las actividades
        for actividad_id in art_data.get('actividad', []):
            actividad = Actividad.objects.get(act_id=actividad_id)  # Verificar que la actividad exista
            art.actividad.add(actividad)

        # Asociamos los empleados
        for empleado_id in art_data.get('empleado', []):
            empleado_obj = Empleado.objects.get(emp_rut=empleado_id)  # Verificar que el empleado exista
            art.empleado.add(empleado_obj)

        # Asociamos las preguntas manualmente en la tabla intermedia ArtPregunta
        for pregunta in art_data.get('pregunta', []):
            pregunta_id = pregunta.get('pregunta_id')
            respuesta_trans = pregunta.get('respuestaTrans')

            # Validar los datos
            if pregunta_id is None or respuesta_trans is None:
                return Response({'success': False, 'error': 'Cada pregunta debe incluir pregunta_id y respuestaTrans'}, status=status.HTTP_400_BAD_REQUEST)

            pregunta_obj = Pregunta.objects.get(pre_id=pregunta_id)  # Validar que la pregunta existe
            ArtPregunta.objects.create(
                id_art=art,
                id_pregunta=pregunta_obj,
                respuestaTrans=respuesta_trans
            )

        # Ahora guardamos las respuestas de riesgo
        for respuesta in respuestas:
            RespuestaRiesgo.objects.create(
                art=art,
                riesgo_critico=RiesgoCritico.objects.get(rc_id=respuesta['riesgo_critico_id']),
                pregunta_numero=respuesta['pregunta_numero'],
                respuesta=respuesta['respuesta'],
                empleado=empleado
            )

        return Response({'success': True, 'message': 'ART y respuestas registradas correctamente.', 'art_id': art.art_id}, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

def obtenerDatosActividad(request, act_nombre):
    actividad = get_object_or_404(Actividad, act_nombre=act_nombre)
    riesgos_criticos = actividad.riesgo_critico.all()
    actividad_data = {
        "act_id": actividad.act_id,
        "act_nombre": actividad.act_nombre,
        "act_riesgo": actividad.act_riesgo,
        "act_medida_control": actividad.act_medida_control,
    }
    riesgos_data = [
        {
            "rc_id": riesgo.rc_id,
            "rc_nombre": riesgo.rc_nombre,
            "rc_pregunta": riesgo.rc_pregunta,
            "rc_respuesta": riesgo.rc_respuesta,
        }
        for riesgo in riesgos_criticos
    ]
    return JsonResponse({
        "actividad": actividad_data,
        "riesgos_criticos": riesgos_data,
    })

@api_view(['GET'])
def ArtRealizada(request):
    resultados = Art.objects.prefetch_related('empleado', 'actividad', 'pregunta').all()

    datos = []
    for resultado in resultados:
        datos.append({
            'art_id': resultado.art_id,
            'trabajo_simultaneo': resultado.art_trab_simultaneo,
            'estado_trab': resultado.art_estado_trab,
            'hora_inicio': resultado.art_hora_inicio.strftime('%H:%M:%S') ,
            'hora_fin': resultado.art_hora_fin.strftime('%H:%M:%S'),
            'art_estado': resultado.art_estado,  # Añadido art_estado
            'art_fecha': resultado.art_fecha,  # Añadido art_fecha
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
def obtenerArt2(request):
    if request.method == 'GET':
        art_obtener = Art.objects.prefetch_related('artpregunta_set', 'respuestas_riesgo').all()
        serializer = ARTSerializer(art_obtener, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        serializer = ARTSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def obtenerArt(request, art_id=None):
    if not art_id:
        return Response({'error': 'Se requiere el ID de la ART'}, status=status.HTTP_400_BAD_REQUEST)

    # Buscar el objeto ART
    try:
        art = Art.objects.prefetch_related('artpregunta_set', 'respuestas_riesgo').get(art_id=art_id)
    except Art.DoesNotExist:
        return Response({'error': 'ART no encontrada'}, status=status.HTTP_404_NOT_FOUND)

    # Leer el formulario PDF base
    template_path = "static/pdf/Formulario_ART_1.0 .pdf"
    pdf_reader = PdfReader(template_path)
    pdf_writer = PdfWriter()

    # Obtener los campos del formulario
    for page in pdf_reader.pages:
        pdf_writer.add_page(page)

    # Campos a rellenar
    fields_to_fill = {
        "empresa": "Mi Empresa",  # Ejemplo estático
        "gerencia": "Gerencia General",
        "fecha": str(art.art_fecha),
        "horaInicio": str(art.art_hora_inicio),
        "horaTermino": str(art.art_hora_fin),
        "superintendencia": "Superintendencia de Operaciones",
        "lugarEspecifico": "Sitio A",
        "trabajoRealizar": "Revisión de Controles",
        "nombreSuper": art.art_supervisor,
        "trabSimult": "Sí" if art.art_trab_simultaneo else "No",
        "comunicTrabSimult": "Sí" if art.art_comunicAccions else "No",
        "verifCondiTrab": "Sí" if art.art_estado_trab else "No",
        # Añade más campos según los datos y los nombres del formulario
    }

    # Rellenar los campos del formulario
    pdf_writer.update_page_form_field_values(pdf_writer.pages[0], fields_to_fill)

    # Crear respuesta para el PDF
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="ART_{art_id}_relleno.pdf"'

    # Guardar el PDF rellenado en la respuesta
    pdf_writer.write(response)
    return response

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