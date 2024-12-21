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
from pdfrw import PdfReader, PdfWriter, PdfDict
from datetime import datetime
from django.db.models import Count
import io

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
                art = Art.objects.get(art_id=respuesta_data['art_id']) 
                riesgo_critico = RiesgoCritico.objects.get(rc_id=respuesta_data['riesgo_critico']) 
                empleado = Empleado.objects.get(emp_rut=respuesta_data['empleado']) 
                
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

        return Response({'success': True, 'message': 'Respuestas y ARTs registrados correctamente.'}, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)



@api_view(['POST'])
def registrarRespuesta(request):
    try:
        data = request.data

        empleado_rut = data.get('empleado_rut')
        if not empleado_rut:
            return Response({'success': False, 'error': 'El campo empleado_rut es obligatorio'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            empleado = Empleado.objects.get(emp_rut=empleado_rut)
        except Empleado.DoesNotExist:
            return Response({'success': False, 'error': 'Empleado no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        art_data = data.get('art')
        respuestas = data.get('respuestas') 
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
            art_estado=art_data.get('art_estado') 
        )

        for actividad_id in art_data.get('actividad', []):
            actividad = Actividad.objects.get(act_id=actividad_id)
            art.actividad.add(actividad)
        for empleado_id in art_data.get('empleado', []):
            empleado_obj = Empleado.objects.get(emp_rut=empleado_id)
            art.empleado.add(empleado_obj)
        for pregunta in art_data.get('pregunta', []):
            pregunta_id = pregunta.get('pregunta_id')
            respuesta_trans = pregunta.get('respuestaTrans')

            # Validar los datos
            if pregunta_id is None or respuesta_trans is None:
                return Response({'success': False, 'error': 'Cada pregunta debe incluir pregunta_id y respuestaTrans'}, status=status.HTTP_400_BAD_REQUEST)

            pregunta_obj = Pregunta.objects.get(pre_id=pregunta_id)
            ArtPregunta.objects.create(
                id_art=art,
                id_pregunta=pregunta_obj,
                respuestaTrans=respuesta_trans
            )
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
def ArtRealizadaPorSupervisor(request, supervisor_nombre):
    resultados = Art.objects.prefetch_related('empleado', 'actividad', 'pregunta').filter(art_supervisor__icontains=supervisor_nombre)

    datos = []
    for resultado in resultados:
        datos.append({
            'art_id': resultado.art_id,
            'trabajo_simultaneo': resultado.art_trab_simultaneo,
            'estado_trab': resultado.art_estado_trab,
            'hora_inicio': resultado.art_hora_inicio.strftime('%H:%M:%S'),
            'hora_fin': resultado.art_hora_fin.strftime('%H:%M:%S'),
            'art_estado': resultado.art_estado,
            'art_fecha': resultado.art_fecha,
            'art_comunicAccions': resultado.art_comunicAccions,
            'art_contextTrabSim': resultado.art_contextTrabSim,
            'art_coordLider': resultado.art_coordLider,
            'art_verfControles': resultado.art_verfControles,
            'art_supervisor': resultado.art_supervisor,
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

@api_view(['GET'])
def obtenerArt2(request, art_id=None):
    if not art_id:
        return Response({'error': 'Se requiere el ID de la ART'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        art = Art.objects.prefetch_related('artpregunta_set', 'respuestas_riesgo', 'actividad__riesgo_critico').get(art_id=art_id)
    except Art.DoesNotExist:
        return Response({'error': 'ART no encontrada'}, status=status.HTTP_404_NOT_FOUND)

    art_serializer = ARTSerializer(art)
    art_data = art_serializer.data
    actividades = art.actividad.all()
    actividades_data = []

    for actividad in actividades:
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
        actividad_data["riesgos_criticos"] = riesgos_data
        actividades_data.append(actividad_data)
    art_data["actividades"] = actividades_data

    # Respuestas y empleados
    respuestas_riesgo = art_data.get("respuestas_riesgo", [])
    empleados = art_data.get("empleado", [])

    # Agrupar por trabajador, supervisor y luego por riesgo crítico
    respuestas_trabajador = {}
    respuestas_supervisor = {}

    for respuesta in respuestas_riesgo:
        riesgo_critico = respuesta["riesgo_critico"]
        empleado = respuesta["empleado"]
        respuesta_data = {
            "id": respuesta["id"],
            "pregunta_numero": respuesta["pregunta_numero"],
            "respuesta": respuesta["respuesta"],
        }

        if empleado in empleados:  # Trabajador
            if riesgo_critico not in respuestas_trabajador:
                respuestas_trabajador[riesgo_critico] = []
            respuestas_trabajador[riesgo_critico].append(respuesta_data)
        else:  # Supervisor
            if riesgo_critico not in respuestas_supervisor:
                respuestas_supervisor[riesgo_critico] = []
            respuestas_supervisor[riesgo_critico].append(respuesta_data)

    # Agregar al resultado final
    art_data["respuestas_trabajador"] = respuestas_trabajador
    art_data["respuestas_supervisor"] = respuestas_supervisor

    # Eliminar la clave original si no es necesaria
    del art_data["respuestas_riesgo"]

    return Response(art_data)

preguntas_list = [
    "¿Conozco el estándar, procedimiento y/o instructivo del trabajo que ejecutaré?",
    "¿Cuento con las competencias y salud compatible para ejecutar el trabajo?",
    "¿Cuento con la autorización para ingresar al área a ejecutar el trabajo?",
    "¿Segregué y señalicé el área de trabajo con los elementos según diseño?",
    "¿Conozco el número de teléfono o frecuencia radial para dar aviso en \n caso de emergencia, según protocolo del área?",
    "¿Uso los EPP definidos para el trabajo y se encuentran en buenas \n condiciones?",
    "¿El trabajo que asignaré cuenta con un estándar, procedimiento \n y/o instructivo?",
    "¿El personal que asignaré para realizar el trabajo, cuenta con \n las capacitaciones, competencias, salud compatible y/o acreditaciones requeridas?",
    "¿Durante la planificación del trabajo, me aseguro de solicitar \n los permisos para ingresar a las áreas, intervenir equipos y/o interactuar con energías?",
    "¿Verifiqué que el personal cuenta con los elementos requeridos \n para realizar la segregación y señalización del área de trabajo, según diseño?",
    "¿El personal a mi cargo cuenta con sistema de comunicación de \n acuerdo al protocolo de emergencia del área?",
    "¿El personal que asignaré para realizar el trabajo, cuenta con \n los EPP definidos en el procedimiento de trabajo?"
]

@api_view(['GET'])
def obtenerArt3(request, art_id=None):
    if not art_id:
        return Response({'error': 'Se requiere el ID de la ART'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        art = Art.objects.prefetch_related(
            'artpregunta_set', 'respuestas_riesgo', 'actividad__riesgo_critico'
        ).get(art_id=art_id)
    except Art.DoesNotExist:
        return Response({'error': 'ART no encontrada'}, status=status.HTTP_404_NOT_FOUND)

    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="ART_{art_id}.pdf"'

    p = canvas.Canvas(response, pagesize=letter)
    width, height = letter
    margin = 30
    line_height = 15.5
    y = height - margin

    def draw_text(text, x, y, font="Helvetica", size=10):
        nonlocal p
        p.setFont(font, size)
        text_object = p.beginText(x, y)
        text_object.setFont(font, size)
        text_object.textLines(text)
        p.drawText(text_object)
        return text_object.getY()

    def check_page_space(current_y, decrement):
        nonlocal p, height, margin
        if current_y - decrement < margin:
            p.showPage()
            return height - margin
        return current_y - decrement
    draw_text("PASO 1: PLANIFICACIÓN DEL TRABAJO A REALIZAR", margin, y, font="Helvetica-Bold", size=12)
    y = check_page_space(y, line_height)

    general_info = [
        f"SUPERVISOR QUE ASIGNA EL TRABAJO : {art.art_supervisor:<30} EMPRESA: WSS",
        f"GERENCIA: Minería          FECHA: {art.art_fecha}        HORA INICIO: {art.art_hora_inicio}     HORA TERMINO: {art.art_hora_fin}",
        f"SUPERINTENDENCIA/DIRECCION: Laboratorio   LUGAR ESPECIFICO: Laboratorio WSS",
        f"TRABAJO A REALIZAR : {', '.join([actividad.act_nombre for actividad in art.actividad.all()])}"
    ]
    for info in general_info:
        y = draw_text(info, margin, y)
        y = check_page_space(y, line_height)

    draw_text("RESPUESTAS A PREGUNTAS:", margin, y, font="Helvetica-Bold", size=12)
    y = check_page_space(y, line_height)
    preguntas_art = art.artpregunta_set.all()
    line_heightT = 9.5
    for i, pregunta_art in enumerate(preguntas_art):
        pregunta_texto = preguntas_list[i] if i < len(preguntas_list) else "Pregunta no definida"
        respuesta = 'Sí' if pregunta_art.respuestaTrans else 'No'
        y = draw_text(f"{i+1}. {pregunta_texto}", margin + 20, y)
        y = check_page_space(y, line_heightT)
        y = draw_text(f"Respuesta: {respuesta}", margin + 20, y)
        y = check_page_space(y, line_heightT)

    draw_text("PASO 2: RIESGOS Y CONTROLES CRÍTICOS", margin, y, font="Helvetica-Bold", size=12)
    y = check_page_space(y, line_height)

    respuestas_riesgo = art.respuestas_riesgo.all().select_related('riesgo_critico', 'empleado')
    empleados_riesgos = {}
    for respuesta in respuestas_riesgo:
        empleado = respuesta.empleado.emp_rut
        if empleado not in empleados_riesgos:
            empleados_riesgos[empleado] = []
        empleados_riesgos[empleado].append(respuesta)
    empleado_counter = 0
    for empleado, riesgos in empleados_riesgos.items():
        if empleado_counter == 0:
            etiqueta = "TRABAJADOR"
        elif empleado_counter == 1:
            etiqueta = "SUPERVISOR"
        else:
            etiqueta = f"EMPLEADO: {empleado}"
        draw_text(etiqueta, margin, y, font="Helvetica-Bold", size=10)
        y = check_page_space(y, line_height)
        riesgos_agrupados = {}
        for riesgo in riesgos:
            rc_nombre = riesgo.riesgo_critico.rc_nombre
            if rc_nombre not in riesgos_agrupados:
                riesgos_agrupados[rc_nombre] = []
            riesgos_agrupados[rc_nombre].append(riesgo)
        for rc_nombre, respuestas in riesgos_agrupados.items():
            draw_text(f"Riesgo Crítico: {rc_nombre}", margin + 20, y, font="Helvetica-Bold", size=10)
            y = check_page_space(y, line_height)
            for respuesta in respuestas:
                draw_text(
                    f"- Pregunta {respuesta.pregunta_numero}, Respuesta: {'Sí' if respuesta.respuesta else 'No'}",
                    margin + 40, y
                )
                y = check_page_space(y, line_height)
        empleado_counter += 1
        y = check_page_space(y, line_height)
    draw_text("PASO 3: OTROS RIESGOS", margin, y, font="Helvetica-Bold", size=12)
    y = check_page_space(y, line_height)

    otros_riesgos = [actividad.act_riesgo for actividad in art.actividad.all()]
    medidas_control = [actividad.act_medida_control for actividad in art.actividad.all()]
    
    draw_text("RIESGOS:", margin, y)
    y = check_page_space(y, line_height)

    for riesgo in otros_riesgos:
        lineas = riesgo.split('\n')
        for linea in lineas:
            draw_text(f"- {linea.strip()}", margin + 20, y)
            y = check_page_space(y, line_height)
    draw_text("MEDIDAS DE CONTROL:", margin, y)
    y = check_page_space(y, line_height)
    for medida in medidas_control:
        lineas = medida.split('\n')
        for linea in lineas:
            draw_text(f"- {linea.strip()}", margin + 20, y)
            y = check_page_space(y, line_height)
    draw_text("PASO 4: TRABAJOS SIMULTÁNEOS", margin, y, font="Helvetica-Bold", size=12)
    y = check_page_space(y, line_height)
    draw_text(f"¿Existen trabajos simultáneos?: {'Sí' if art.art_trab_simultaneo else 'No'}", margin, y)
    y = check_page_space(y, line_height)
    if art.art_trab_simultaneo:
        draw_text(f"Contexto: {art.art_contextTrabSim}", margin + 20, y)
        y = check_page_space(y, line_height)
        draw_text(f"¿Coordinación con líder?: {'Sí' if art.art_coordLider else 'No'}", margin + 20, y)
        y = check_page_space(y, line_height)
        draw_text(f"¿Verificación cruzada?: {'Sí' if art.art_verfControles else 'No'}", margin + 20, y)
        y = check_page_space(y, line_height)
    draw_text("PASO 5: VALIDACIÓN ART POR EQUIPO EJECUTOR", margin, y, font="Helvetica-Bold", size=12)
    y = check_page_space(y, line_height)
    draw_text(f"LÍDER: {art.art_supervisor} Supervisor en turno: {art.art_estado_Super}   Firma: _______________", margin, y)
    y = check_page_space(y, line_height)

    equipo_ejecutor = art.empleado.all()
    for empleado in equipo_ejecutor:
        empleado_texto = f"TRABAJADOR {empleado.emp_nombre} ({empleado.emp_especialidad})  {art.art_estado_trab}   Firma: _______________"
        y = draw_text(empleado_texto, margin + 20, y)
        y = check_page_space(y, line_height)

    p.showPage()
    p.save()
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
        art_obtener = Art.objects.filter(art_fecha=fecha)

        if not art_obtener.exists():
            return Response({'message': 'No se encontraron registros para la fecha proporcionada.'},
                            status=status.HTTP_404_NOT_FOUND)
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
        art_obtener = Art.objects.filter(empleado__emp_rut=rut)

        if not art_obtener.exists():
            return Response({'message': 'No se encontraron registros para el RUT proporcionado.'},
                            status=status.HTTP_404_NOT_FOUND)
        serializer = ARTSerializer(art_obtener, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except ValueError:
        return Response({'error': 'Formato de RUT inválido.'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
def editarEstadoSuper(request, art_id):

    try:
        art = get_object_or_404(Art, pk=art_id)
        nuevo_estado = request.data.get('art_estado_Super', None)
        if nuevo_estado is None:
            return Response(
                {"error": "Debe proporcionar un valor para art_estado_Super."},
                status=status.HTTP_400_BAD_REQUEST
            )
        art.art_estado_Super = nuevo_estado
        art.save()
        return Response(
            {"message": "El estado art_estado_Super fue actualizado correctamente."},
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response(
            {"error": f"Ha ocurrido un error: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def contarArtActividad(request):
    try:
        today = datetime.today()
        current_month = today.month
        current_year = today.year
        actividades = Actividad.objects.all()
        actividades_resumen = []
        for actividad in actividades:
            cantidad = Art.objects.filter(actividad=actividad, art_fecha__month=current_month, art_fecha__year=current_year).count()
            actividades_resumen.append({
                'actividad': actividad.act_nombre,
                'cantidad': cantidad
            })
        return Response(actividades_resumen, status=status.HTTP_200_OK)
    except ValueError:
        return Response({'error': 'Hubo un error al procesar la solicitud.'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def obtener_arts_por_empleado(request, emp_rut):
    try:
        empleado = Empleado.objects.get(emp_rut=emp_rut)
    except Empleado.DoesNotExist:
        return Response({"error": "Empleado no encontrado."}, status=404)
    fecha_actual = datetime.now()
    arts_del_empleado = Art.objects.filter(
        empleado=empleado,
        art_fecha__year=fecha_actual.year,
        art_fecha__month=fecha_actual.month
    )
    actividades_count = arts_del_empleado.values("actividad__act_nombre").annotate(total_arts=Count("actividad"))
    data_art = [
        {
            "name": actividad["actividad__act_nombre"],
            "ARTs": actividad["total_arts"],
        }
        for actividad in actividades_count
    ]

    return Response(data_art)


@api_view(['GET'])
def obtenerArt(request, art_id=None):
    if not art_id:
        return Response({'error': 'Se requiere el ID de la ART'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        art = Art.objects.prefetch_related('artpregunta_set', 'respuestas_riesgo', 'actividad__riesgo_critico').get(art_id=art_id)
    except Art.DoesNotExist:
        return Response({'error': 'ART no encontrada'}, status=status.HTTP_404_NOT_FOUND)

    art_serializer = ARTSerializer(art)
    art_data = art_serializer.data
    actividades = art.actividad.all()
    actividades_data = []

    for actividad in actividades:
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
        actividad_data["riesgos_criticos"] = riesgos_data
        actividades_data.append(actividad_data)
    art_data["actividades"] = actividades_data

    # Procesar respuestas y empleados
    respuestas_riesgo = art_data.get("respuestas_riesgo", [])
    empleados = art_data.get("empleado", [])

    # Agrupar respuestas por trabajador, supervisor y luego por riesgo crítico
    respuestas_trabajador = {}
    respuestas_supervisor = {}

    for respuesta in respuestas_riesgo:
        riesgo_critico = respuesta["riesgo_critico"]
        empleado = respuesta["empleado"]
        respuesta_data = {
            "id": respuesta["id"],
            "pregunta_numero": respuesta["pregunta_numero"],
            "respuesta": respuesta["respuesta"],
        }

        if empleado in empleados:  # Trabajador
            if riesgo_critico not in respuestas_trabajador:
                respuestas_trabajador[riesgo_critico] = []
            respuestas_trabajador[riesgo_critico].append(respuesta_data)
        else:  # Supervisor
            if riesgo_critico not in respuestas_supervisor:
                respuestas_supervisor[riesgo_critico] = []
            respuestas_supervisor[riesgo_critico].append(respuesta_data)

    # Agregar al resultado final
    art_data["respuestas_trabajador"] = respuestas_trabajador
    art_data["respuestas_supervisor"] = respuestas_supervisor

    # Eliminar la clave original si no es necesaria
    del art_data["respuestas_riesgo"]

    # Aquí procesas la plantilla PDF
    pdf_data = generar_pdf(art_data)

    # Enviar el archivo PDF como respuesta HTTP
    response = HttpResponse(pdf_data, content_type='application/pdf')
    response['Content-Disposition'] = f'inline; filename="art_{art_id}.pdf"'
    return response

def generar_pdf(art_data):
    """
    Genera un archivo PDF con los datos de la ART y lo retorna como un objeto de bytes.
    """
    try:
        # Leer la plantilla PDF
        template_path = 'static/pdf/Formulario_ART_1.0.pdf'
        template_pdf = PdfReader(template_path)

        # Aquí construirás el diccionario de datos y radio buttons para llenar el PDF
        data_dict = {
            'empresa': 'WSS',
            'gerencia': 'Gerencia General',
            'superintendencia': "Laboratorio",
            "nombreLider": art_data['art_supervisor'],
            "nombreSuper": art_data['art_supervisor'],
            "fecha": art_data['art_fecha'],
            "horaInicio": art_data['art_hora_inicio'],
            "horaTermino": art_data['art_hora_fin'] ,
            "trabajoRealizar": ', '.join(actividad['act_nombre'] for actividad in art_data['actividades']),
            "riesgo": ', '.join(actividad['act_riesgo'] for actividad in art_data['actividades']),
            "medida": ', '.join(actividad['act_medida_control'] for actividad in art_data['actividades']),
            # Agrega más campos según sea necesario
        }

        # Construir dinámicamente los radio buttons
        radio_button_dict = {}
        for pregunta in art_data['preguntas_art']:
            id_pregunta = pregunta['id_pregunta']
            value = pregunta['respuestaTrans']
            
            if id_pregunta >= 1 and id_pregunta <= 6:  # Para PT1 a PT6
                if value == False:
                    radio_button_dict[f"/PT{id_pregunta}_no"] = 'NO'
                else:
                    radio_button_dict[f"/PT{id_pregunta}_si"] = 'SI'
            elif id_pregunta >= 7 and id_pregunta <= 12:  # Para PS1 a PS6
                if value == False:
                    radio_button_dict[f"/PS{id_pregunta - 6}_no"] = 'NO'
                else:
                    radio_button_dict[f"/PS{id_pregunta - 6}_si"] = 'SI'
        
        if art_data.get('art_trab_simultaneo') is not None:
            if art_data['art_trab_simultaneo'] == False:
                radio_button_dict["/trabSimult_no"] = 'NO'
            else:
                radio_button_dict["/trabSimult_si"] = 'SI'

        if art_data.get('art_estado_trab') is not None:
            if art_data['art_estado_trab'] == False:
                radio_button_dict["/condiTrab1_no"] = 'NO'
            else:
                radio_button_dict["/condiTrab1_si"] = 'SI'

        if art_data.get('art_comunicAccions') is not None:
            if art_data['art_comunicAccions'] == False:
                radio_button_dict["/comunicTrabSimult_no"] = 'NO'
            else:
                radio_button_dict["/comunicTrabSimult_si"] = 'SI'

        if art_data.get('art_coordLider') is not None:
            if art_data['art_coordLider'] == False:
                radio_button_dict["/coordTrabSimult_no"] = 'NO'
            else:
                radio_button_dict["/coordTrabSimult_si"] = 'SI'

        if art_data.get('art_verfControles') is not None:
            if art_data['art_verfControles'] == False:
                radio_button_dict["/verifTrabSimult_no"] = 'NO'
            else:
                radio_button_dict["/verifTrabSimult_si"] = 'SI'

        # Definir las claves de radio button según el tipo de respuesta (trabajador o supervisor)
        if empleado in empleados:  # Trabajador
            if riesgo_critico == 6:
                key_base = f"/RcTrabr1_{pregunta_numero}"
            elif riesgo_critico == 7:
                key_base = f"/RcTrabr2_{pregunta_numero}"

            # Asignar los valores de radio button basados en la respuesta (True/False)
            if respuesta["respuesta"]:
                radio_button_dict[f"{key_base}_si"] = 'SI'
            else:
                radio_button_dict[f"{key_base}_no"] = 'NO'

            if riesgo_critico not in respuestas_trabajador:
                respuestas_trabajador[riesgo_critico] = []
            respuestas_trabajador[riesgo_critico].append(respuesta_data)

        else:  # Supervisor
            if riesgo_critico == 6:
                key_base = f"/Rcsuper1_{pregunta_numero}"
            elif riesgo_critico == 7:
                key_base = f"/Rcsuper2_{pregunta_numero}"

            # Asignar los valores de radio button basados en la respuesta (True/False)
            if respuesta["respuesta"]:
                radio_button_dict[f"{key_base}_si"] = 'SI'
            else:
                radio_button_dict[f"{key_base}_no"] = 'NO'

            if riesgo_critico not in respuestas_supervisor:
                respuestas_supervisor[riesgo_critico] = []
            respuestas_supervisor[riesgo_critico].append(respuesta_data)

        # Procesar los campos del formulario en el PDF
        pdf_writer = PdfWriter()
        for page in template_pdf.pages:
            annotations = page['/Annots']
            if annotations:
                for annotation in annotations:
                    if annotation['/Subtype'] == '/Widget':
                        field_name = annotation.get('/T')
                        if field_name:
                            field_key = field_name[1:-1]  # Eliminar paréntesis
                            if field_key in data_dict:
                                annotation.update(PdfDict(V='{}'.format(data_dict[field_key])))
                                annotation.update(PdfDict(AP=''))  # Actualización visual

                        ap_dict = annotation.get('/AP')
                        if ap_dict:
                            normal_appearance = ap_dict.get('/N')
                            if normal_appearance:
                                for ap_key in normal_appearance.keys():
                                    if ap_key in radio_button_dict:
                                        annotation.update(PdfDict(AS=ap_key))

            pdf_writer.addpage(page)

        # Guardar PDF en memoria en lugar de en disco
        output_pdf = io.BytesIO()
        pdf_writer.write(output_pdf)
        output_pdf.seek(0)
        return output_pdf.read()

    except Exception as e:
        raise Exception(f"Error al generar el PDF: {e}")