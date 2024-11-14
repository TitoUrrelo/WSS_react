import React, { useState } from 'react';
import { Form, FormGroup, Label, Input, Button, FormFeedback, ListGroup, ListGroupItem, Container, Row, Col, Alert } from 'reactstrap'
import './InicioSesion.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import axios from 'axios';
import { Navigate } from 'react-router-dom';

// Función para validar el formato y dígito verificador del RUT
function validarRut(rut) {
    // Quitar puntos, guiones y convertir a mayúsculas
    rut = rut.replace(/[.-]/g, '').toUpperCase();
    
    // Validar largo mínimo y estructura del RUT
    if (!/^[0-9]{7,8}[0-9K]$/.test(rut)) {
        return false;
    }

    // Separar número y dígito verificador
    const cuerpo = rut.slice(0, -1);
    const dv = rut.slice(-1);

    // Calcular dígito verificador
    let suma = 0;
    let multiplicador = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += multiplicador * parseInt(cuerpo[i]);
        multiplicador = multiplicador < 7 ? multiplicador + 1 : 2;
    }

    const dvEsperado = 11 - (suma % 11);
    const dvCalculado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();

    // Retornar verdadero si el dígito verificador coincide
    return dvCalculado === dv;
}

export function InicioSesion() {
    const [userRut, setUserRut] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [redirect, setRedirect] = useState(null); // Añadido para redirección

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Validar el RUT
        if (!validarRut(userRut)) {
            setError('Usuario o contraseña incorrectos');
            return;
        }
    
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/personal/Login/', { 
                userRut, 
                password 
            });
    
            const { cargo, nombre } = response.data;
            console.log(`Inicio de sesión exitoso: ${nombre}, Cargo: ${cargo}`);
    
            // Redireccionar según el cargo del usuario
            if (cargo === 'Trabajador') {
                setRedirect(`/trabajador/${userRut}`);
            } else if (cargo === 'Supervisor') {
                setRedirect(`/supervisor/${userRut}`);
            } else if (cargo === 'JefeLab') {
                setRedirect(`/Administrador/${userRut}`);
            }
        } catch (error) {
            setError('Usuario o contraseña incorrectos');
            console.error('Error en el inicio de sesión:', error);
        }
    };

    // Redirigir una vez se haya determinado el cargo
    if (redirect) {
        return <Navigate to={redirect} />;
    }

    return (
        <div className='formulario'>
            <Container className="mt-5 align-items-center conInicio">
                <Row className="justify-content-center row">
                    <Col md="9">
                        <h2 className='titulo'>Inicio de Sesión</h2>
                        {error && <Alert color="danger">{error}</Alert>}
                        <Form onSubmit={handleSubmit}>
                            <FormGroup>
                                <Label for="userRut">Rut</Label>
                                <Input
                                    type="text"
                                    name="userRut"
                                    id="userRut"
                                    placeholder="12345678-9"
                                    value={userRut}
                                    onChange={(e) => setUserRut(e.target.value)}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label for="passwordInput">Contraseña</Label>
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    id="passwordInput"
                                    placeholder="Contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </FormGroup>
                            <FormGroup check className="text-start my-3">
                                <Input
                                    type="checkbox"
                                    id="showPasswordCheck"
                                    onChange={() => setShowPassword(!showPassword)}
                                />
                                <Label for="showPasswordCheck" check>
                                    Mostrar contraseña
                                </Label>
                            </FormGroup>
                            <Button className="iniciarSesion" color="primary" type="submit" block>
                                Iniciar Sesión
                            </Button>
                        </Form>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
