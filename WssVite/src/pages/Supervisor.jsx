import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Form, FormGroup, Label, Input, Card, CardBody, Nav, NavItem, NavLink, Button, TabPane, TabContent, CardTitle, CardText, Offcanvas, OffcanvasHeader, OffcanvasBody, Alert, Table} from 'reactstrap';
import './Supervisor.css';
import 'bootstrap/dist/css/bootstrap.min.css';

export function Supervisor() {
    const { userRut } = useParams();
    console.log(userRut);

    const [empleadosTrab, setEmpleadosTrab] = useState([]);

    useEffect(() => {
        const fetchEmpleadosTrab = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/personal/EmpleadosCargo/Trabajador');
                setEmpleadosTrab(response.data);
            } catch (error) {
                console.error('Error al obtener trabajadores:', error);
            }
        };

        fetchEmpleadosTrab();

        const intervalId = setInterval(() => {
            fetchEmpleadosTrab();
        }, 10000); // Actualiza cada 10 segundos

        return () => clearInterval(intervalId);
    }, []);

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
    }, [userRut]);

    const preguntasTrans = [
        { name: "preg1", label: "¿Conozco el estándar, procedimiento y/o instructivo del trabajo que ejecutaré?" },
        { name: "preg2", label: "¿Cuento con las competencias y salud compatible para ejecutar el trabajo?" },
        { name: "preg3", label: "¿Cuento con la autorización para ingresar al área a ejecutar el trabajo?" },
        { name: "preg4", label: "¿Segregué y señalice el area de trabajo con los elementos segun diseño?" },
        { name: "preg5", label: "¿Conozco el número de teléfono o frecuencia radial para dar aviso en caso de emergencia, segun protocolo de area?" },
        { name: "preg6", label: "¿Uso los EPP definidos para el trabajo y se encuentran en buenas condiciones?" },
    ];

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

    const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);

    const toggleOffcanvas = () => {
        setIsOffcanvasOpen(!isOffcanvasOpen);
    };

    return (
        <Container className="mt-3 contSuper">

            <div>
                <Offcanvas isOpen={isOffcanvasOpen} toggle={toggleOffcanvas}>
                    <OffcanvasHeader toggle={toggleOffcanvas}>
                        Información del Supervisor
                    </OffcanvasHeader>
                    <OffcanvasBody>
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
                    {error && <Alert color="danger">{error}</Alert>}
                    </OffcanvasBody>
                </Offcanvas>
            </div>

            <Row>
                <Col md="12">
                    <div className="text-center">
                        <h2>Supervisor</h2>
                        <p></p>
                    </div>
                    <div>
                        <Nav fill tabs >
                            <NavItem>
                                <Button color="primary" onClick={toggleOffcanvas}>
                                    mi info
                                </Button>
                            </NavItem>
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
                                    asignacion ARTs
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
                                            <Card>
                                                <div className="text-center">
                                                    <h4>
                                                        Lista de trabajadores
                                                    </h4>
                                                    <Table size="sm" striped>
                                                        <thead>
                                                            <tr>
                                                                <th>#</th>
                                                                <th>Nombre</th>
                                                                <th>Rut </th>
                                                                <th>Correo</th>
                                                                <th>Especialidad</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {empleadosTrab.map((trabajador, index) => (
                                                                <tr key={trabajador.emp_rut}>
                                                                    <td>{index + 1}</td>
                                                                    <td>{trabajador.emp_nombre}</td>
                                                                    <td>{trabajador.emp_rut}</td>
                                                                    <td>{trabajador.emp_correo}</td>
                                                                    <td>{trabajador.emp_especialidad}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </Table>
                                                </div>
                                            </Card>
                                        </Col>
                                    </Row>
                                </TabPane>
                                <TabPane tabId="2">
                                    <FormGroup row>
                                        <Label for="exampleSelect" sm={2}>
                                        Seleccionar Actividad:
                                        </Label>
                                        <Col sm={10}>
                                            <Input
                                                id="exampleSelect"
                                                name="select"
                                                type="select"
                                            >
                                                <option>
                                                    Lavado de material
                                                </option>
                                                <option>
                                                    Lecturas en equipo de A.A.
                                                </option>
                                                <option>
                                                    Masado de muestras
                                                </option>
                                                <option>
                                                    Digestion acida de muestras
                                                </option>
                                                <option>
                                                    Lixiviaxión de muestras
                                                </option>
                                            </Input>
                                        </Col>
                                    </FormGroup>
                                    <Row>
                                        <Col ms="6">
                                            <Card>
                                                <p className='text-center'>Grupo Trabajadores</p>

                                            </Card>
                                        </Col>
                                        <Col ms="6">
                                            <Card>
                                                <p className="text-center">Trabajadores</p>
                                            </Card>
                                        </Col>
                                    </Row>
                                </TabPane>
                                <TabPane tabId="3">
                                    <Row >
                                    <FormGroup row>
                                        <Label for="exampleSelect" sm={2}>
                                        Seleccionar Actividad:
                                        </Label>
                                        <Col sm={10}>
                                            <Input
                                                id="exampleSelect"
                                                name="select"
                                                type="select"   
                                            >
                                                <option>
                                                    Lavado de material
                                                </option>
                                                <option>
                                                    Lecturas en equipo de A.A.
                                                </option>
                                                <option>
                                                    Masado de muestras
                                                </option>
                                                <option>
                                                    Digestion acida de muestras
                                                </option>
                                                <option>
                                                    Lixiviaxión de muestras
                                                </option>
                                            </Input>
                                        </Col>
                                    </FormGroup>
                                    <Card>
                                        <h5 className="text-center">Preguntas transversales</h5>
                                    </Card>
                                    <Card className="w-100">
                                    <Row>
                                        <Col sm="3"></Col>
                                    <Col sm="6">
                                    <FormGroup>
                                        {preguntasTrans.map((pregunta) => (
                                            <div key={pregunta.name} className="pregTrans-container">
                                                <Label className="pregTrans-label">{pregunta.label}</Label>
                                                <div className="opcionesTrans">
                                                    <Label check className="opcionTrans">
                                                        <Input
                                                            type="radio"
                                                            name={pregunta.name}
                                                            value="Si"
                                                            checked={respuesta[pregunta.name] === 'Si'}
                                                            onChange={handleChangeRes}
                                                        />
                                                        Si
                                                    </Label>
                                                    <br></br>
                                                    <br></br>
                                                    <Label check className="opcionTrans">
                                                        <Input
                                                            type="radio"
                                                            name={pregunta.name}
                                                            value="No"
                                                            checked={respuesta[pregunta.name] === 'No'}
                                                            onChange={handleChangeRes}
                                                        />
                                                        No
                                                    </Label>
                                                    <br></br>
                                                    <br></br>
                                                </div>
                                            </div>
                                        ))}
                                    </FormGroup>
                                    </Col>
                                    <Col sm="3"></Col>
                                    </Row>
                                    </Card>
                                    <Card>
                                        <h5 className="text-center" >Riesgos criticos especificos del trabajo</h5>
                                    </Card>
                                    <Col sm="6">
                                        <Card body>
                                            <CardTitle>
                                                Riesgos criticos 1
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
                                                Riesgos criticos 2
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