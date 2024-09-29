import { useState } from 'react';
import { Container, Row, Col, Form, FormGroup, Label, Input, Card, CardBody, Button } from 'reactstrap';
import './Trabajador.css';
import 'bootstrap/dist/css/bootstrap.min.css';
export function Trabajador() {
    // Datos del trabajador, puedes reemplazar estos valores con datos reales o manejarlo a través del estado
    const [worker, setWorker] = useState({
    });


    return (
        <Container className="mt-5">
            <Row>
                <Col md="5" className="d-flex justify-content-center align-items-center">
                    <Card className="w-100">
                        <CardBody>
                            <h2>Información del Trabajador</h2>
                            <Form>
                                <FormGroup>
                                    <Label for="fullName">Nombre Completo</Label>
                                    <Input
                                        type="text"
                                        name="fullName"
                                        id="fullName"
                                        value={worker.fullName}
                                        readOnly
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="address">Dirección de Residencia</Label>
                                    <Input
                                        type="text"
                                        name="address"
                                        id="address"
                                        value={worker.address}
                                        readOnly
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="phone">Teléfono</Label>
                                    <Input
                                        type="text"
                                        name="phone"
                                        id="phone"
                                        value={worker.phone}
                                        readOnly
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="email">Correo Electrónico</Label>
                                    <Input
                                        type="email"
                                        name="email"
                                        id="email"
                                        value={worker.email}
                                        readOnly
                                    />
                                </FormGroup>
                            </Form>
                        </CardBody>
                    </Card>
                </Col>
                <Col md="1" className="divider-col">
                        <div className="divider"></div>
                    </Col>
                    <Col md="6">
                        <div className="text-center">
                            <h2>Llenar ART</h2>
                            <p></p>
                        </div>
                        <div className="d-flex justify-content-between mt-3">
                                <Button color="primary">
                                    Iniciar ART
                                </Button>
                                <Button color="primary">
                                    Cancelar
                                </Button>
                        </div>
                    </Col>
                </Row>
            </Container>
        );
}