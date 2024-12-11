from django.shortcuts import render
from django.http import HttpResponse
from personal_app.models import Empleado
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import status
from personal_app.serializers import PersonalSerializer
import re

def validar_rut(rut):

    if '-' not in rut:
        return False, "El RUT debe incluir el guion, ejemplo: 12345678-9"

    if not re.match(r'^\d{1,8}-[0-9Kk]$', rut):
        return False, "El formato del RUT es incorrecto. Debe ser 'XXXXXXXX-X', donde X es un número y el DV puede ser un número o 'K'."
    
    rut_sin_dv, dv = rut.split('-')
    rut_sin_dv = int(rut_sin_dv)
    dv = dv.upper()

    suma = 0
    factor = 2
    for digit in reversed(str(rut_sin_dv)):
        suma += int(digit) * factor
        factor = 9 if factor == 7 else factor + 1
    resto = suma % 11
    dv_calculado = 'K' if resto == 10 else str(11 - resto)

    return dv_calculado == dv, None

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


@api_view(['GET','POST'])
def obtenerTrabajadores(request):
    if request.method == 'GET':
        personas_obtenidas = Empleado.objects.all()
        serialzado = PersonalSerializer(personas_obtenidas, many=True)
        return Response(serialzado.data,status=status.HTTP_200_OK)

    if request.method == 'POST':
        deserializado = PersonalSerializer(data=request.data)

        if deserializado.is_valid():
            deserializado.save()
            return Response(deserializado.data,status=status.HTTP_200_OK)
        else:
            return Response(deserializado.errors,status=status.HTTP_400_BAD_REQUEST)


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
