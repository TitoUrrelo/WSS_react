import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Form, FormGroup, Label, Input, Card, CardBody, Button, Alert } from 'reactstrap';
import './Trabajador.css';
import 'bootstrap/dist/css/bootstrap.min.css';

export function Trabajador() {
    const { userRut } = useParams();
    console.log(userRut);

    // Define el estado para los datos del trabajador
    const [worker, setWorker] = useState({
        emp_nombre: '',
        emp_direccion: '',
        emp_telefono: '',
        emp_correo: ''
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
                                    <Input
                                        type="text"
                                        name="fullName"
                                        id="fullName"
                                        value={worker.emp_nombre}  // Usa el valor del estado
                                        readOnly
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="address">Dirección de Residencia</Label>
                                    <Input
                                        type="text"
                                        name="address"
                                        id="address"
                                        value={worker.emp_direccion}  // Usa el valor del estado
                                        readOnly
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="phone">Teléfono</Label>
                                    <Input
                                        type="text"
                                        name="phone"
                                        id="phone"
                                        value={worker.emp_telefono}  // Usa el valor del estado
                                        readOnly
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="email">Correo Electrónico</Label>
                                    <Input
                                        type="email"
                                        name="email"
                                        id="email"
                                        value={worker.emp_correo}  // Usa el valor del estado
                                        readOnly
                                    />
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
                    <div className="botonesTrab">
                        <Button color="primary" className="botonIniciar">
                            Iniciar ART
                        </Button>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}
