import { useState } from 'react';
import { Container, Row, Col, Form, FormGroup, Label, Input, Card, CardBody, Nav, NavItem, NavLink, Button, TabPane, TabContent, CardTitle, CardText } from 'reactstrap'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import 'bootstrap/dist/css/bootstrap.min.css'

export function Administrador() {
    const [worker, setWorker] = useState({
    });

    const [activeTab, setActiveTab] = useState("1");
    const toggleTab = (tab) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
        }
    };

    const data = [
        { name: 'Lavado de material', ARTs: 30 },
        { name: 'Lectura de equipo de A.A.', ARTs: 45 },
        { name: 'Masado de muestras', ARTs: 50 },
        { name: 'Digestión acida de muestras ', ARTs: 60 },
        { name: 'Lixiviaxión de muestras', ARTs: 70 },
    ];

    return (
    <div>
        <Container className="mt-3 containerSuper">
            <Row>
                <Col md="12" className="d-flex justify-content-center align-items-center">
                    <Col className="w-100">
                        <div className="text-center">
                            <h2>Administrador</h2>
                        </div>
                        <div>
                            <Nav  fill tabs>
                                <NavItem>
                                    <NavLink
                                        className={activeTab === "1" ? "active" : ""}
                                        onClick={() => toggleTab("1")}
                                    >
                                        Agregar trabajadores
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                        className={activeTab === "2" ? "active" : ""}
                                        onClick={() => toggleTab("2")}
                                    >
                                        Eliminar Trabajadores
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                        className={activeTab === "3" ? "active" : ""}
                                        onClick={() => toggleTab("3")}
                                    >
                                        trabajadores
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                        className={activeTab === "4" ? "active" : ""}
                                        onClick={() => toggleTab("4")}
                                    >
                                        Supervisores
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                        className={activeTab === "5" ? "active" : ""}
                                        onClick={() => toggleTab("5")}
                                    >
                                        Supervisores
                                    </NavLink>
                                </NavItem>
                            </Nav>
                            <TabContent activeTab={activeTab}>
                                <TabPane tabId="1">
                                    <Row>
                                        <Col sm="6">
                                        <Card className="w-100">
                                            <CardBody>
                                                <h2>Nuevo trabajador</h2>
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
                                        <Col sm="6">
                                            <h4>
                                                lista de trabajadores
                                            </h4>
                                        </Col>
                                    </Row>
                                </TabPane>
                                <TabPane tabId="2">
                                <Row>
                                        <Col sm="6">
                                        <Card className="w-100">
                                            <CardBody>
                                                <h2>Nuevo Supervisor</h2>
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
                                        <Col sm="6">
                                            <h4>
                                                lista de Supervisores
                                            </h4>
                                        </Col>
                                    </Row>
                                </TabPane>
                                <TabPane tabId="3">
                                    <Row>
                                        <Col sm="12">
                                            <h4>Gráfico de Trabajadores</h4>
                                            <div style={{ width: '100%', height: 300 }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={data}>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis dataKey="name" />
                                                        <YAxis />
                                                        <Tooltip />
                                                        <Legend />
                                                        <Bar dataKey="ARTs" fill="#8884d8" />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </Col>
                                    </Row>
                                </TabPane>
                            </TabContent>
                        </div>
                    </Col>
                </Col>
            </Row>
        </Container>
    </div>
    );
}