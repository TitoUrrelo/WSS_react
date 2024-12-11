import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Form, FormGroup, Label, Input, Card, CardBody, Nav, NavItem, NavLink, Button, TabPane, TabContent, CardTitle, CardText, Offcanvas, OffcanvasHeader, OffcanvasBody, Alert, Table} from 'reactstrap';
import './Supervisor.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const RiesgoCritico = ({ riesgo, handleRiesgoChange }) => (
    <Card className="mb-4">
        <CardBody>
            <h5>{riesgo.rc_nombre}</h5>
            <FormGroup>
                <Label>Código del Riesgo</Label>
                <Input type="text" value={riesgo.rc_id} disabled />
            </FormGroup>
            {[...Array(Number(riesgo.rc_pregunta))].map((_, index) => (
                <FormGroup key={index}>
                    <Label>N°{index + 1}</Label>
                    <div>
                        <Input
                            type="radio"
                            name={`riesgo${riesgo.rc_id}_pregunta${index}`}
                            value="si"
                            onChange={() => handleRiesgoChange(index, riesgo.rc_id, 'si')}
                        /> Sí
                        <Input
                            type="radio"
                            name={`riesgo${riesgo.rc_id}_pregunta${index}`}
                            value="no"
                            className="ms-2"
                            onChange={() => handleRiesgoChange(index, riesgo.rc_id, 'no')}
                        /> No
                    </div>
                </FormGroup>
            ))}
        </CardBody>
    </Card>
);

// Componente para las preguntas transversales
const PreguntasTransversales = ({ handleChange }) => {
    const preguntas = [
        "¿El trabajo que asignaré cuenta con un estándar, procedimiento y/o instructivo?",
        "¿El personal que asignaré para realizar el trabajo, cuenta con las capacitaciones, competencias, salud compatible y/o acreditaciones requeridas?",
        "¿Durante la planificación del trabajo, me aseguro de solicitar los permisos para ingresar a las áreas, intervenir equipos y/o interactuar con energías?",
        "¿Verifiqué que el personal cuenta con los elementos requeridos para realizar la segregación y señalización del área de trabajo, según diseño?",
        "¿El personal a mi cargo cuenta con sistema de comunicación de acuerdo al protocolo de emergencia del área?",
        " ¿El personal que asignaré para realizar el trabajo, cuenta con los EPP definidos en el procedimiento de trabajo?"
    ];

    return (
        <>
            {preguntas.map((pregunta, index) => (
                <FormGroup key={index}>
                    <Label>{pregunta}</Label>
                    <div>
                        <Input type="radio" name={`preguntaTransversal${index + 1}`} value="si" onChange={handleChange} /> Sí
                        <Input type="radio" name={`preguntaTransversal${index + 1}`} value="no" className="ms-2" onChange={handleChange} /> No
                    </div>
                </FormGroup>
            ))}
        </>
    );
};

export function Supervisor() {
    const { userRut } = useParams();
    console.log(userRut);

    const [riesgosCriticos, setRiesgosCriticos] = useState([]);
    const [empleadosTrab, setEmpleadosTrab] = useState([]);
    const [formData, setFormData] = useState({});
    const [transversalData, setTransversalData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [alertMessage, setAlertMessage] = useState(null);
    const [actividadSeleccionada, setActividadSeleccionada] = useState("");
    const [empleadosSeleccionados, setEmpleadosSeleccionados] = useState([]);
    const [actividadRellenarSeleccionada, setActividadRellenarSeleccionada] = useState("");

    const handleSelectChangerellenar = async (event) => {
        const selectedActivity = event.target.value;
        setActividadRellenarSeleccionada(selectedActivity);
        setIsLoading(true);

        try {
            // Llamar al backend para obtener riesgos críticos relacionados con la actividad seleccionada
            const response = await axios.get(`http://127.0.0.1:8000/api/art/Actividad/${selectedActivity}/`);
            setRiesgosCriticos(response.data.riesgos_criticos || []);
        } catch (error) {
            console.error('Error al cargar los datos:', error);
            setAlertMessage({ type: 'danger', text: 'Error al cargar los datos de la actividad seleccionada.' });
        } finally {
            setIsLoading(false);
        }
    };

    
    const handleSelectChangeAct = (event) => {
        setActividadSeleccionada(event.target.value);
    };

    const handleCheckboxChange = (rut) => {
        setEmpleadosSeleccionados((prevSeleccionados) =>
            prevSeleccionados.includes(rut)
                ? prevSeleccionados.filter((id) => id !== rut) // Desmarcar
                : [...prevSeleccionados, rut] // Marcar
        );
    };

    const handleRiesgoChange = (preguntaIndex, riesgoId, value) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            [`riesgo${riesgoId}_pregunta${preguntaIndex}`]: value,
        }));
    };

    const handleTransversalChange = (e) => {
        const { name, value } = e.target;
        setTransversalData((prevData) => ({
            ...prevData,
            [name]: value === 'si' // Convertir 'si' a true, 'no' a false
        }));
    };

    const handleSubmit = async (art_id) => {
        // Construir el JSON de las respuestas de riesgos críticos
        const respuestas_riesgo = riesgosCriticos.flatMap((riesgo) =>
            [...Array(Number(riesgo.rc_pregunta))].map((_, index) => ({
                art_id: art_id, // Añadir el art_id
                riesgo_critico: riesgo.rc_id,
                pregunta_numero: index + 1,
                respuesta: formData[`riesgo${riesgo.rc_id}_pregunta${index}`] === 'si', // Convertir 'si' a true, 'no' a false
                empleado: userRut // Rut del empleado
            }))
        );
    
        // Construir el JSON de las preguntas transversales (con números 7 a 12)
        const preguntas_transversales = Object.keys(transversalData).map((key, index) => ({
            art_id: art_id, // Añadir el art_id
            id: 7 + index, // Esto asigna los números 7, 8, 9, ..., 12
            respuestaTrans: transversalData[key]
        }));
    
        const data = {
            preguntas: preguntas_transversales,
            respuestas_riesgo: respuestas_riesgo,
        };
    
        console.log("Datos que se van a enviar:", data);
    
        try {
            // Enviar los datos al backend
            const response = await axios.post(`http://127.0.0.1:8000/api/art/regisRespArtSuper/`, data);
            setAlertMessage({ type: 'success', text: 'Formulario enviado exitosamente.' });
            console.log('ART creada:', response.data);
    
            // Cambiar el estado de la ART a "Completado"
            try {
                await axios.patch(`http://127.0.0.1:8000/api/art/Estado/${art_id}/`, { art_estado: "Completado" });
                // Actualizar el estado local para reflejar el cambio de estado
                setArts((prevArts) =>
                    prevArts.map((art) =>
                        art.art_id === art_id ? { ...art, art_estado: "Completado" } : art
                    )
                );
                console.log(`Estado de ART ${art_id} cambiado a "Completado"`);
            } catch (error) {
                console.error('Error al cambiar el estado de la ART:', error);
            }
        } catch (error) {
            console.error('Error al crear ART:', error);
            setAlertMessage({ type: 'danger', text: 'Error al enviar el formulario. Intente nuevamente.' });
        }
    };
    

    const handleModificarActGlobal = async () => {
        try {
            const updates = empleadosSeleccionados.map(async (rut) => {
                const response = await fetch(`http://127.0.0.1:8000/api/personal/Actividad/${rut}/`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        emp_actividad: actividadSeleccionada,
                    }),
                });

                if (response.ok) {
                    return rut; // Devuelve el RUT del trabajador actualizado/
                } else {
                    const data = await response.json();
                    throw new Error(`Error con el RUT ${rut}: ${data.detail}`);
                }
            });

            const actualizados = await Promise.all(updates);

            // Actualizar la tabla en el estado
            setEmpleadosTrab((prevTrabajadores) =>
                prevTrabajadores.map((trabajador) =>
                    actualizados.includes(trabajador.emp_rut)
                        ? { ...trabajador, emp_actividad: actividadSeleccionada }
                        : trabajador
                )
            );

            alert('Actividades actualizadas correctamente');
            setEmpleadosSeleccionados([]); // Limpiar la selección
        } catch (error) {
            console.error('Error al actualizar actividades:', error);
            alert(`Error: ${error.message}`);
        }
    };

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
                const response = await axios.get(`http://127.0.0.1:8000/api/personal/Empleado/${userRut}`);
                setWorker(response.data);  // Actualiza el estado con los datos del trabajador
            } catch (err) {
                setError('Error al obtener los datos del trabajador');
            }
        };
        fetchWorkerData();
    }, [userRut]);

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

    const [arts, setArts] = useState([]);
    const [artsRev, setArtsRev] = useState([]);
    const [artsCom, setArtsCom] = useState([]);

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/art/ArtRealizadas/')
            .then((response) => {
                const artVerdes = response.data.filter(art => art.art_estado === "tarjeta verde");
                const artRevisado = response.data.filter(art => art.art_estado === "Pendiente");
                const artCompleto = response.data.filter(art => art.art_estado === "Completado");
                
                setArts(artVerdes);
                setArtsRev(artRevisado);
                setArtsCom(artCompleto)
            })
            .catch((error) => {
                console.error('Error al obtener las ARTs:', error);
            });
    }, []);

    const handleChangeState = (artId) => {
        axios
            .patch(`http://127.0.0.1:8000/api/art/Estado/${artId}/`, { art_estado: "Revisado" })
            .then(() => {
            setArts((prevArts) =>
                prevArts.map((art) =>
                art.art_id === artId ? { ...art, art_estado: "Revisado" } : art
                )
            );
            })
            .catch((error) => {
            console.error('Error al cambiar el estado de la ART:', error);
            });
        };

        const handleDescargarPDF = (artId) => {
            // Generar la URL del PDF (aquí asumimos que el endpoint es /api/obtenerArt/{art_id}/)
            const url = `http://127.0.0.1:8000/api/art/ObtenerArt/${artId}/`;
        
            // Abrir el PDF en una nueva pestaña
            window.open(url, '_blank');
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
                                        <Label for="cambioActividadTrab" sm={2}>
                                            Seleccionar Actividad:
                                        </Label>
                                        <Col sm={10}>
                                            <Input
                                                id="cambioActividadTrab"
                                                name="select"
                                                type="select"
                                                value={actividadSeleccionada}
                                                onChange={handleSelectChangeAct}
                                            >
                                                <option value="">Seleccionar...</option>
                                                <option value="Lavado de material">Lavado de material</option>
                                                <option value="Lecturas en equipo de A.A.">Lecturas en equipo de A.A.</option>
                                                <option value="Masado de muestras">Masado de muestras</option>
                                                <option value="Digestion acida de muestras">Digestion acida de muestras</option>
                                                <option value="Lixiviaxión de muestras">Lixiviaxión de muestras</option>
                                                <option value="sin actividad">sin actividad</option>
                                            </Input>
                                        </Col>
                                    </FormGroup>
                                    <Row>
                                        <Card>
                                            <div className="text-center">
                                                <h4>Lista de trabajadores</h4>
                                                <Table size="sm" striped>
                                                    <thead>
                                                        <tr>
                                                            <th>#</th>
                                                            <th>Seleccionar</th>
                                                            <th>Nombre</th>
                                                            <th>Rut</th>
                                                            <th>Correo</th>
                                                            <th>Especialidad</th>
                                                            <th>Actividad</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {empleadosTrab.map((trabajador, index) => (
                                                            <tr key={trabajador.emp_rut}>
                                                                <td>{index + 1}</td>
                                                                <td>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={empleadosSeleccionados.includes(trabajador.emp_rut)}
                                                                        onChange={() => handleCheckboxChange(trabajador.emp_rut)}
                                                                    />
                                                                </td>
                                                                <td>{trabajador.emp_nombre}</td>
                                                                <td>{trabajador.emp_rut}</td>
                                                                <td>{trabajador.emp_correo}</td>
                                                                <td>{trabajador.emp_especialidad}</td>
                                                                <td>{trabajador.emp_actividad}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                                <Button
                                                    color="primary"
                                                    size="sm"
                                                    onClick={handleModificarActGlobal}
                                                    disabled={empleadosSeleccionados.length === 0 || !actividadSeleccionada}
                                                >
                                                    Asignar Actividad a Seleccionados
                                                </Button>
                                            </div>
                                        </Card>
                                    </Row>
                                </TabPane>
                                <TabPane tabId="3">
                                    <br></br>
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
                                                    onChange={handleSelectChangerellenar} // Actualiza el estado cuando cambie el valor
                                                >
                                                    <option value="">Seleccionar...</option>
                                                    <option value="Lavado de material">Lavado de material</option>
                                                <option value="Lecturas en equipo de A.A.">Lecturas en equipo de A.A.</option>
                                                <option value="Masado de muestras">Masado de muestras</option>
                                                <option value="Digestion acida de muestras">Digestion acida de muestras</option>
                                                <option value="Lixiviaxión de muestras">Lixiviaxión de muestras</option>
                                                </Input>
                                            </Col>
                                        </FormGroup>
                                            <h3 className="text-center">Preguntas transversales</h3>
                                        <Card className="w-100">
                                        <Row>
                                            <Col sm="2"></Col>
                                            <Col sm="8">
                                                <Form onSubmit={(e) => e.preventDefault()}>
                                                    <PreguntasTransversales handleChange={handleTransversalChange} />
                                                    <Row>
                                                        <h3 className="text-center" >Riesgos criticos</h3>
                                                        {riesgosCriticos.map((riesgo) => (
                                                            <RiesgoCritico
                                                                key={riesgo.rc_id}
                                                                riesgo={riesgo}
                                                                handleRiesgoChange={handleRiesgoChange}
                                                            />
                                                        ))}
                                                    </Row>
                                                    <Row>
                                                        <Card>
                                                            <div className="text-center">
                                                                <Table size="sm" striped style={{ width: '100%' }}>
                                                                    <thead>
                                                                        <tr>
                                                                            <th>Nombre Empleado</th>
                                                                            <th>Hora Inicio</th>
                                                                            <th>Turno</th>
                                                                            <th>Fecha</th>
                                                                            <th>Actividad ART</th>
                                                                            <th>Estado</th>
                                                                            <th>Acciones</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {artsRev
                                                                            .filter((art) =>
                                                                                actividadRellenarSeleccionada === "" ||
                                                                                art.actividades.some((actividad) =>
                                                                                    actividad.nombre.toLowerCase().includes(actividadRellenarSeleccionada.toLowerCase())
                                                                                )
                                                                            )
                                                                            .map((art) => (
                                                                                <tr key={art.art_id}>
                                                                                    <td>{art.empleados[0]?.nombre}</td>
                                                                                    <td>{art.hora_inicio}</td>
                                                                                    <td>{art.hora_fin}</td>
                                                                                    <td>{art.art_fecha}</td>
                                                                                    <td>
                                                                                        {art.actividades.map((actividad, index) => (
                                                                                            <div key={index}>
                                                                                                {actividad.nombre}
                                                                                            </div>
                                                                                        ))}
                                                                                    </td>
                                                                                    <td>{art.art_estado}</td>
                                                                                    <td>
                                                                                        <button
                                                                                            type="button"
                                                                                            color="primary"
                                                                                            className="mt-3"
                                                                                            onClick={() => handleSubmit(art.art_id)}
                                                                                        >
                                                                                            Completar
                                                                                        </button>
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                    </tbody>
                                                                </Table>
                                                            </div>
                                                        </Card>
                                                    </Row>
                                                </Form>
                                            </Col>
                                            <Col sm="2"></Col>
                                        </Row>
                                        </Card>
                                    </Row>
                                </TabPane>
                                <TabPane tabId="4">
                                    <Table size="sm" striped style={{ width: '100%' }}>
                                        <thead>
                                            <tr>
                                                <th>Nombre Empleado</th>
                                                <th>Hora Inicio</th>
                                                <th>Turno</th>
                                                <th>Fecha</th>
                                                <th>Actividad ART</th>
                                                <th>Estado</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {artsCom.map((art) => (
                                                <tr key={art.art_id}>
                                                    <td>{art.empleados[0]?.nombre}</td>
                                                    <td>{art.hora_inicio}</td>
                                                    <td>{art.hora_fin}</td>
                                                    <td>{art.art_fecha}</td>
                                                    <td>
                                                        {art.actividades.map((actividad, index) => (
                                                            <div key={index}>
                                                                {actividad.nombre}
                                                            </div>
                                                        ))}
                                                    </td>
                                                    <td>{art.art_estado}</td>
                                                    <td>
                                                        <button
                                                            color="primary"
                                                            size="sm"
                                                            onClick={() => handleDescargarPDF(art.art_id)}
                                                        >
                                                            Descargar
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </TabPane>
                                <TabPane tabId="5">
                                    <Row>
                                        <Card>
                                            <div className="text-center">
                                                <Table size="sm" striped style={{ width: '100%' }}>
                                                    <thead>
                                                        <tr>
                                                            <th>Nombre Empleado</th>
                                                            <th>Fecha</th>
                                                            <th>Actividad ART</th>
                                                            <th>Estado</th>
                                                            <th>Acciones</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {arts.map((art) => (
                                                            <tr key={art.art_id}>
                                                                <td>{art.empleados[0]?.nombre}</td>
                                                                <td>{art.art_fecha}</td>
                                                                <td>
                                                                    {art.actividades.map((actividad, index) => (
                                                                        <div key={index}>
                                                                            {actividad.nombre}
                                                                        </div>
                                                                    ))}
                                                                </td>
                                                                <td>{art.art_estado}</td>
                                                                <td>
                                                                    <button color="primary"
                                                                            size="sm" 
                                                                            onClick={() => handleChangeState(art.art_id, art.art_estado)}>
                                                                        Cambiar Estado
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        </Card>
                                    </Row>
                                </TabPane>
                        </TabContent>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}