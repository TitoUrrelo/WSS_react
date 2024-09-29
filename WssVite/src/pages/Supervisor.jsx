import { useState } from 'react';
import { Container, Row, Col, Form, FormGroup, Label, Input, Card, CardBody, Nav, NavItem, NavLink, Button, TabPane, TabContent, CardTitle, CardText} from 'reactstrap';
import './Supervisor.css';
import 'bootstrap/dist/css/bootstrap.min.css';

export function Supervisor() {
    const [worker, setWorker] = useState({
    });

    const [activeTab, setActiveTab] = useState("1");

    const toggleTab = (tab) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
        }
    };
    const [respuesta, setRespuesta] = useState({
        preg1: '',
    });

    const handleChangeRes = (event) => {
        setRespuesta({
            ...respuesta, 
            [event.target.name]: event.target.value,
        });
    };
    return (
        <Container className="mt-5 containerSuper">
            <Row>
                <Col md="3" className="d-flex justify-content-center align-items-center">
                    <Card className="w-100">
                        <CardBody>
                            <h2>Información del Supervisor</h2>
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
                    <Col md="7">
                        <div className="text-center">
                            <h2>Llenar ART</h2>
                            <p></p>
                        </div>
                        <div>
                            <Nav tabs>
                                <NavItem>
                                    <NavLink
                                        className={activeTab === "1" ? "active" : ""}
                                        onClick={() => toggleTab("1")}
                                    >
                                        Trabajadores
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                        className={activeTab === "2" ? "active" : ""}
                                        onClick={() => toggleTab("2")}
                                    >
                                        Solicitud Trabajadores
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                        className={activeTab === "3" ? "active" : ""}
                                        onClick={() => toggleTab("3")}
                                    >
                                        Llenar ART
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                        className={activeTab === "4" ? "active" : ""}
                                        onClick={() => toggleTab("4")}
                                    >
                                        Descargar ART
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                        className={activeTab === "5" ? "active" : ""}
                                        onClick={() => toggleTab("5")}
                                    >
                                        Tarjeta verde
                                    </NavLink>
                                </NavItem>
                            </Nav>
                            <TabContent activeTab={activeTab}>
                                <TabPane tabId="1">
                                    <Row>
                                        <Col sm="12">
                                            <h4>
                                                Tab 1 Contents
                                            </h4>
                                        </Col>
                                    </Row>
                                </TabPane>
                                <TabPane tabId="3">
                                    <Row>
                                    <h5 className="text-center">Preguntas transversales</h5>

                                    <FormGroup>
                                        <div className="preg-container">
                                            <Label className="mr-3">¿Conozco el estándar, procedimiento y/o instructivo del trabajo que ejecutaré?</Label>
                                            <div className="opciones">
                                                <Label check className="mr-3">
                                                    <Input
                                                        type="radio"
                                                        name="preg1"
                                                        value="Si"
                                                        checked={respuesta.preg1 === 'Si'}
                                                        onChange={handleChangeRes}
                                                    />
                                                    Si
                                                </Label>
                                                <Label check>
                                                    <Input
                                                        type="radio"
                                                        name="preg1"
                                                        value="No"
                                                        checked={respuesta.preg1 === 'No'}
                                                        onChange={handleChangeRes}
                                                    />
                                                    No
                                                </Label>
                                            </div>
                                        </div>

                                        <div className="preg-container">
                                            <Label className="mr-3">¿Cuento con las competencias y salud compatible para ejecutar el trabajo?</Label>
                                            <div className="opciones">
                                                <Label check className="mr-3">
                                                    <Input
                                                        type="radio"
                                                        name="preg2"
                                                        value="Si"
                                                        checked={respuesta.preg2 === 'Si'}
                                                        onChange={handleChangeRes}
                                                    />
                                                    Si
                                                </Label>
                                                <Label check>
                                                    <Input
                                                        type="radio"
                                                        name="preg2"
                                                        value="No"
                                                        checked={respuesta.preg2 === 'No'}
                                                        onChange={handleChangeRes}
                                                    />
                                                    No
                                                </Label>
                                            </div>
                                        </div>

                                        <div className="preg-container">
                                            <Label className="mr-3">¿Cuento con la autorización para ingresar al área a ejecutar el trabajo?</Label>
                                            <div className="opciones">
                                                <Label check className="mr-3">
                                                    <Input
                                                        type="radio"
                                                        name="preg3"
                                                        value="Si"
                                                        checked={respuesta.preg3 === 'Si'}
                                                        onChange={handleChangeRes}
                                                    />
                                                    Si
                                                </Label>
                                                <Label check>
                                                    <Input
                                                        type="radio"
                                                        name="preg3"
                                                        value="No"
                                                        checked={respuesta.preg3 === 'No'}
                                                        onChange={handleChangeRes}
                                                    />
                                                    No
                                                </Label>
                                            </div>
                                        </div>

                                        <div className="preg-container">
                                            <Label className="mr-3">¿Segregué y señalice el area de trabajo con los elementos segun diseño?</Label>
                                            <div className="opciones">
                                                <Label check className="mr-3">
                                                    <Input
                                                        type="radio"
                                                        name="preg4"
                                                        value="Si"
                                                        checked={respuesta.preg4 === 'Si'}
                                                        onChange={handleChangeRes}
                                                    />
                                                    Si
                                                </Label>
                                                <Label check>
                                                    <Input
                                                        type="radio"
                                                        name="preg4"
                                                        value="No"
                                                        checked={respuesta.preg4 === 'No'}
                                                        onChange={handleChangeRes}
                                                    />
                                                    No
                                                </Label>
                                            </div>
                                        </div>

                                        <div className="preg-container">
                                            <Label className="mr-3">¿Conozco el número de teléfono o frecuencia radial para dar aviso en caso de emergencia, segun protocolo de area?</Label>
                                            <div className="opciones">
                                                <Label check className="mr-3">
                                                    <Input
                                                        type="radio"
                                                        name="preg5"
                                                        value="Si"
                                                        checked={respuesta.preg5 === 'Si'}
                                                        onChange={handleChangeRes}
                                                    />
                                                    Si
                                                </Label>
                                                <Label check>
                                                    <Input
                                                        type="radio"
                                                        name="preg5"
                                                        value="No"
                                                        checked={respuesta.preg5 === 'No'}
                                                        onChange={handleChangeRes}
                                                    />
                                                    No
                                                </Label>
                                            </div>
                                        </div>

                                        <div className="preg-container">
                                            <Label className="mr-3">¿Uso los EPP definidos para el trabajo y se encuentran en buenas condiciones?</Label>
                                            <div className="opciones">
                                                <Label check className="mr-3">
                                                    <Input
                                                        type="radio"
                                                        name="preg6"
                                                        value="Si"
                                                        checked={respuesta.preg6 === 'Si'}
                                                        onChange={handleChangeRes}
                                                    />
                                                    Si
                                                </Label>
                                                <Label check>
                                                    <Input
                                                        type="radio"
                                                        name="preg6"
                                                        value="No"
                                                        checked={respuesta.preg6 === 'No'}
                                                        onChange={handleChangeRes}
                                                    />
                                                    No
                                                </Label>
                                            </div>
                                        </div>
                                    </FormGroup>

                                    <h5 className="text-center" >Riesgos criticos especificos del trabajo</h5>
                                    <Col sm="6">
                                        <h5 className="text-center" >Riesgos criticos 1</h5>
                                    </Col>
                                    <Col sm="6">
                                        <h5 className="text-center" >Riesgos criticos 2</h5>
                                    </Col>
                                    <Col sm="6">
                                        <Card body>
                                            <CardTitle>
                                                Special Title Treatment
                                            </CardTitle>
                                            <CardText>
                                                With supporting text below as a natural lead-in to additional content.
                                            </CardText>
                                            <Button>
                                                Go somewhere
                                            </Button>
                                        </Card>
                                    </Col>
                                    <Col sm="6">
                                        <Card body>
                                            <CardTitle>
                                                Special Title Treatment
                                            </CardTitle>
                                            <CardText>
                                                With supporting text below as a natural lead-in to additional content.
                                            </CardText>
                                            <Button>
                                                Go somewhere
                                            </Button>
                                        </Card>
                                    </Col>
                                </Row>
                            </TabPane>
                        </TabContent>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}