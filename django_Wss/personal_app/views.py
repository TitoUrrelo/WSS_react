from django.shortcuts import render
from django.http import HttpResponse
from personal_app.models import Empleado
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import status
from personal_app.serializers import PersonalSerializer
import re
import threading

def validar_rut(rut):
    # Comprobar si el RUT tiene el guion
    if '-' not in rut:
        return False, "El RUT debe incluir el guion, ejemplo: 12345678-9"
    
    # Verificar que el formato del RUT sea correcto
    if not re.match(r'^\d+-[0-9Kk]$', rut):
        return False, "El formato del RUT es incorrecto. Debe ser 'XXXXXXXX-X', donde X es un número y el DV puede ser un número o 'K'."

    # Dividir el RUT en número y dígito verificador (DV)
    rut_sin_dv, dv = rut.split('-')
    dv = dv.lower()  # Convertir el DV a minúscula para la comparación
    
    # Comprobar que el RUT sin el DV sea un número válido
    if not rut_sin_dv.isdigit():
        return False, "El RUT debe contener solo números antes del guion."
    
    # Cálculo del dígito verificador (DV)
    def calcular_dv(rut_sin_dv):
        M = 0
        S = 1
        T = int(rut_sin_dv)  # Convertir el RUT a entero
        while T > 0:
            S = (S + T % 10 * (9 - M % 6)) % 11
            M += 1
            T //= 10
        return 'k' if S == 0 else str(S - 1)

    dv_calculado = calcular_dv(rut_sin_dv)
    
    # Comparar el DV calculado con el DV ingresado
    if dv_calculado != dv:
        return False, f"El dígito verificador es incorrecto. El correcto es {dv_calculado}."

    return True, None

@api_view(['GET'])
def verificarPresente(request, emp_rut):
    try:
        # Buscar al empleado por su emp_rut
        empleado = Empleado.objects.get(emp_rut=emp_rut)
        
        # Obtener el valor de emp_presente
        presente = empleado.emp_presente
        
        # Devolver la respuesta
        return Response({'emp_rut': emp_rut, 'emp_presente': presente}, status=status.HTTP_200_OK)

    except Empleado.DoesNotExist:
        # Si el empleado no existe, devolver un error
        return Response({'error': 'Empleado no encontrado'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def filtrarEmpleadoAcargo(request, nombre, excluir_nombre):
    try:
        # Obtener empleados que cumplen las condiciones y excluir el nombre especificado
        empleados = Empleado.objects.filter(
            emp_cargo='Trabajador',
            emp_presente=True,
            emp_supervisorAcargo=nombre
        ).exclude(emp_nombre=excluir_nombre)

        # Si no hay empleados, retornar 404
        if not empleados.exists():
            return Response({"detail": "No se encontraron empleados."}, status=status.HTTP_404_NOT_FOUND)

        # Serializar los empleados encontrados
        serializado = PersonalSerializer(empleados, many=True)
        return Response(serializado.data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
def actualizarActividadEmpleado(request, rut):
    try:
        
        empleado = Empleado.objects.get(emp_rut=rut)
    except Empleado.DoesNotExist:
        raise NotFound("Empleado no encontrado.")
    emp_actividad = request.data.get("emp_actividad")
    if not emp_actividad:
        return Response({"detail": "El campo 'emp_actividad' es obligatorio."}, status=status.HTTP_400_BAD_REQUEST)
    empleado.emp_actividad = emp_actividad
    empleado.save()
    return Response({"detail": "Actividad del empleado actualizada correctamente."}, status=status.HTTP_200_OK)

@api_view(['PATCH'])
def modificarActividad(request, rut):
    try:
        empleado = Empleado.objects.get(emp_rut=rut)
    except Empleado.DoesNotExist:
        return Response({"detail": "Empleado no encontrado"}, status=status.HTTP_404_NOT_FOUND)
    if 'emp_actividad' in request.data:
        actividad = request.data['emp_actividad']
        if actividad.strip() == "": 
            return Response({"detail": "Por favor, elija una opción para la actividad."}, status=status.HTTP_400_BAD_REQUEST)
        empleado.emp_actividad = actividad
        empleado.save()
        return Response({"detail": "Actividad actualizada correctamente"}, status=status.HTTP_200_OK)
    return Response({"detail": "Actividad no proporcionada"}, status=status.HTTP_400_BAD_REQUEST)


def desactivar_presente(emp_rut):
    try:
        empleado = Empleado.objects.get(emp_rut=emp_rut)
        empleado.emp_presente = False
        empleado.save()
        print(f"Empleado {emp_rut} ha sido marcado como no presente.")
    except Empleado.DoesNotExist:
        print(f"Empleado con RUT {emp_rut} no encontrado.")

@api_view(['POST'])
def autenticarEmpleado(request):
    try:
        rut = request.data.get('userRut')
        contraseña = request.data.get('password')

        if not rut or not contraseña:
            return Response({"detail": "Faltan datos de autenticación"}, status=status.HTTP_400_BAD_REQUEST)
        
        if not validar_rut(rut):
            return Response({"detail": "El RUT ingresado no es válido"}, status=status.HTTP_400_BAD_REQUEST)

        empleado = Empleado.objects.get(emp_rut=rut)

        if contraseña != empleado.emp_contraseña:
            return Response({"detail": "Usuario o contraseña incorrectos"}, status=status.HTTP_401_UNAUTHORIZED)
        empleado.emp_presente = True
        empleado.save()
        timer = threading.Timer(3600, desactivar_presente, args=[rut])
        timer.start()
        return Response({"cargo": empleado.emp_cargo, "nombre": empleado.emp_nombre}, status=status.HTTP_200_OK)

    except Empleado.DoesNotExist:
        return Response({"detail": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"detail": f"Error en la autenticación: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def obtenerEmpleado(request,id):
    persona = Empleado.objects.get(emp_rut =id)
    try:
        perfil = Empleado.objects.get(emp_rut=id)
    except:
        return Response(status=status.HTTP_404_NOT_FOUND)

    serializado = PersonalSerializer(persona)
    return Response(serializado.data)


@api_view(['GET', 'POST'])
def obtenerTrabajadores(request):
    if request.method == 'GET':
        personas_obtenidas = Empleado.objects.all()
        serialzado = PersonalSerializer(personas_obtenidas, many=True)
        return Response(serialzado.data, status=status.HTTP_200_OK)

    if request.method == 'POST':
        rut = request.data.get('emp_rut', '')
        is_valid, error_message = validar_rut(rut)

        # Validar el RUT
        if not is_valid:
            return Response({'error': error_message}, status=status.HTTP_400_BAD_REQUEST)

        # Validar el resto de los datos
        deserializado = PersonalSerializer(data=request.data)
        if deserializado.is_valid():
            deserializado.save()
            return Response(deserializado.data, status=status.HTTP_200_OK)
        else:
            return Response(deserializado.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'DELETE'])
def modificarEmpleado(request, id, idEmpleado):
    try:
        persona = Empleado.objects.get(emp_rut=id)
        if persona.emp_cargo == "JefeLab":
            empleado = Empleado.objects.get(emp_rut=idEmpleado)
        else:
            return Response({"detail": "No tiene permisos para modificar."}, status=status.HTTP_403_FORBIDDEN)

    except Empleado.DoesNotExist:
        return Response({"detail": "Empleado no encontrado."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PATCH':
        serializado = PersonalSerializer(empleado, data=request.data, partial=True)
        if serializado.is_valid():
            serializado.save()
            return Response(serializado.data, status=status.HTTP_200_OK)
        print(serializado.errors)  # Esto te mostrará los errores específicos en consola
        return Response(serializado.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == "DELETE":
        empleado.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET','POST'])
def obtenerEmpleadosCargo(request,cargo):
    empleados = Empleado.objects.filter(emp_cargo=cargo)
    if not empleados.exists():
        return Response({"detail": "No se encontraron empleados con este cargo."}, status=status.HTTP_404_NOT_FOUND)

    serializado = PersonalSerializer(empleados, many=True)

    return Response(serializado.data)

@api_view(['GET'])
def obtenerEmpleadosPorSupervisor(request, supervisor_nombre):
    # Filtrar empleados cuyo 'emp_supervisorAcargo' coincida con el nombre proporcionado
    empleados = Empleado.objects.filter(emp_supervisorAcargo__icontains=supervisor_nombre)
    
    # Si no se encuentran empleados, devolver un mensaje de error
    if not empleados.exists():
        return Response(
            {"detail": f"No se encontraron empleados supervisados por '{supervisor_nombre}'."},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Serializar los datos
    serializado = PersonalSerializer(empleados, many=True)
    
    # Retornar la respuesta serializada
    return Response(serializado.data)