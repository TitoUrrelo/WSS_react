import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Form, FormGroup, Label, Card, CardBody, Button, Alert } from 'reactstrap';
import './Trabajador.css';
import 'bootstrap/dist/css/bootstrap.min.css';

export function Trabajador() {
    const { userRut } = useParams();
    const navigate = useNavigate(); // Hook de navegación de React Router
    console.log(userRut);

    // Define el estado para los datos del trabajador
    const [worker, setWorker] = useState({
        emp_nombre: '',
        emp_direccion: '',
        emp_telefono: '',
        emp_correo: '',
        emp_especialidad: '',
        emp_actividad: '' // Agregamos el nuevo campo
    });
    const [error, setError] = useState(null);

    // Usamos useEffect para hacer la solicitud a la API cuando el componente se monta
    useEffect(() => {
        const fetchWorkerData = async () => {
            try {
                // Asegúrate de que las comillas sean invertidas para la interpolación
                const response = await axios.get(`http://localhost:8000/api/personal/Empleado/${userRut}`);
                setWorker(response.data);  // Actualiza el estado con los datos del trabajador
            } catch (err) {
                setError('Error al obtener los datos del trabajador');
            }
        };
        fetchWorkerData();
    }, [userRut]);  // Re-ejecutar cuando cambie emp_rut

    // Comprobamos si la actividad está en la lista de actividades permitidas
    const isActivityAllowed = [
        'Lavado de material',
        'Lecturas en equipo de A.A.',
        'Masado de muestras',
        'Digestión acida de muestras',
        'Lixiviaxión de muestras'
    ].includes(worker.emp_actividad);

    // Función para manejar la navegación y pasar datos
    const handleNavigate = () => {
        const workerData = {
            emp_nombre: worker.emp_nombre,
            emp_direccion: worker.emp_direccion,
            emp_telefono: worker.emp_telefono,
            emp_correo: worker.emp_correo,
            emp_especialidad: worker.emp_especialidad,
            emp_actividad: worker.emp_actividad,
            emp_rut: worker.emp_rut
        };
    
        navigate('/art', { state: workerData }); // Pasa solo el objeto con los datos requeridos
    };

    return (
        <Container className="mt-3 conTrab">
            <Row>
                <Col md="4">
                    <Card className="w-100 cardInfoTrab">
                        <CardBody>
                            <h2>Información del Trabajador</h2>
                            <Form>
                                <FormGroup>
                                    <Label for="fullName">Nombre Completo</Label>
                                    <p id="fullName">{worker.emp_nombre}</p> {/* Usamos <p> para mostrar el dato */}
                                </FormGroup>
                                <FormGroup>
                                    <Label for="address">Dirección de Residencia</Label>
                                    <p id="address">{worker.emp_direccion}</p> {/* Usamos <p> para mostrar el dato */}
                                </FormGroup>
                                <FormGroup>
                                    <Label for="phone">Teléfono</Label>
                                    <p id="phone">{worker.emp_telefono}</p> {/* Usamos <p> para mostrar el dato */}
                                </FormGroup>
                                <FormGroup>
                                    <Label for="email">Correo Electrónico</Label>
                                    <p id="email">{worker.emp_correo}</p> {/* Usamos <p> para mostrar el dato */}
                                </FormGroup>
                                <FormGroup>
                                    <Label for="especialidad">Especialidad</Label>
                                    <p id="especialidad">{worker.emp_especialidad}</p> {/* Usamos <p> para mostrar el dato */}
                                </FormGroup>
                            </Form>
                        </CardBody>
                    </Card>
                </Col>
                <Col md="1">
                    <div className="divider"></div>
                </Col>
                <Col md="6">
                    <div className="text-center">
                        <br />
                        <h2>Llenar ART</h2>
                        <br />
                    </div>
                    {error && <Alert color="danger">{error}</Alert>}  {/* Muestra mensaje de error si ocurre */}

                    {/* Mostrar alerta según el valor de emp_actividad */}
                    {worker.emp_actividad === 'sin actividad' && (
                        <Alert color="danger">El trabajador no tiene actividad asignada.</Alert>
                    )}

                    {isActivityAllowed && (
                        <Alert color="success">Actividad "{worker.emp_actividad}" válida para iniciar ART.</Alert>
                    )}

                    {/* Si no es una actividad válida, mostrar una alerta informativa */}
                    {!isActivityAllowed && worker.emp_actividad && worker.emp_actividad !== 'sin actividad' && (
                        <Alert color="warning">Actividad "{worker.emp_actividad}" no válida para iniciar ART.</Alert>
                    )}

                    <div className="botonesTrab">
                        <Button
                            color="primary"
                            className="botonIniciar"
                            disabled={!isActivityAllowed}  // Deshabilitar el botón si no es una actividad permitida
                            onClick={handleNavigate} // Llamar a la función de navegación al hacer clic
                        >
                            Iniciar ART
                        </Button>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}
