import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Form, FormGroup, Label, Input, Card, CardBody, Nav, NavItem, NavLink, Button, TabPane, TabContent, CardTitle, CardText, Offcanvas, OffcanvasHeader, OffcanvasBody, Alert, Table} from 'reactstrap';
import './Supervisor.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Swal from 'sweetalert2';

const PreguntasTransversales = ({ handleChange, handleShowText }) => {
    const preguntas = [
        "¿El trabajo que asignaré cuenta con un estándar, procedimiento y/o instructivo?",
        "¿El personal que asignaré para realizar el trabajo, cuenta con las capacitaciones, competencias, salud compatible y/o acreditaciones requeridas?",
        "¿Durante la planificación del trabajo, me aseguro de solicitar los permisos para ingresar a las áreas, intervenir equipos y/o interactuar con energías?",
        "¿Verifiqué que el personal cuenta con los elementos requeridos para realizar la segregación y señalización del área de trabajo, según diseño?",
        "¿El personal a mi cargo cuenta con sistema de comunicación de acuerdo al protocolo de emergencia del área?",
        " ¿El personal que asignaré para realizar el trabajo, cuenta con los EPP definidos en el procedimiento de trabajo?"
    ];

    const [respuestas, setRespuestas] = useState({});
    const [warnings, setWarnings] = useState([]);

    useEffect(() => {
        const noRespondidas = preguntas
            .map((_, index) => `preguntaTransversal${index + 1}`)
            .filter((name) => !(name in respuestas));
        setWarnings(noRespondidas);

        // Ocultar el campo de texto si todas son "sí"
        const allYes = preguntas.every(
            (_, index) => respuestas[`preguntaTransversal${index + 1}`] === "si"
        );
        if (allYes) handleShowText(false);
    }, [respuestas]);

    const handleSelectionChange = (name, value) => {
        setRespuestas((prev) => ({
            ...prev,
            [name]: value,
        }));
        handleChange({ target: { name, value } });

        if (value === "no") handleShowText(true);
    };

    return (
        <>
            <h2 className="text-center">Preguntas Transversales del Supervisor</h2>
            {preguntas.map((pregunta, index) => {
                const name = `preguntaTransversal${index + 1}`;
                return (
                    <FormGroup key={name}>
                        <Label>{pregunta}</Label>
                        <div>
                            <Input
                                type="radio"
                                name={name}
                                value="si"
                                onChange={(e) => handleSelectionChange(name, e.target.value)}
                                checked={respuestas[name] === "si"}
                            />{" "}
                            Sí
                            <Input
                                type="radio"
                                name={name}
                                value="no"
                                className="ms-2"
                                onChange={(e) => handleSelectionChange(name, e.target.value)}
                                checked={respuestas[name] === "no"}
                            />{" "}
                            No
                        </div>
                        {warnings.includes(name) && (
                            <div className="text-danger mt-1">Por favor, selecciona una respuesta.</div>
                        )}
                    </FormGroup>
                );
            })}
            {warnings.length > 0 && (
                <Alert color="danger" className="mt-3">
                    Hay preguntas sin responder. Por favor, responde todas antes de continuar.
                </Alert>
            )}
        </>
    );
};

const RiesgoCritico = ({ riesgo, handleRiesgoChange, handleShowText }) => {
    const [respuestas, setRespuestas] = useState({});
    const [warnings, setWarnings] = useState([]);

    const handleSelectionChange = (index, value) => {
        setRespuestas((prev) => ({
            ...prev,
            [index]: value,
        }));

        handleRiesgoChange(index, riesgo.rc_id, value);

        if (value === "no") handleShowText(true);
    };

    useEffect(() => {
        const noRespondidas = [...Array(Number(riesgo.rc_pregunta))]
            .map((_, index) => index)
            .filter((index) => !respuestas[index]);
        setWarnings(noRespondidas);

        // Ocultar el campo de texto si todas son "sí"
        const allYes = [...Array(Number(riesgo.rc_pregunta))].every(
            (_, index) => respuestas[index] === "si"
        );
        if (allYes) handleShowText(false);
    }, [respuestas, riesgo.rc_pregunta]);

    return (
        <Card className="mb-4">
            <CardBody>
                <h5 className="text-center">{riesgo.rc_nombre}</h5>
                <FormGroup>
                    <Label>Código del Riesgo:</Label>
                    <Input type="text" value={riesgo.rc_id} disabled />
                </FormGroup>
                {[...Array(Number(riesgo.rc_pregunta))].map((_, index) => (
                    <FormGroup key={index}>
                        <Label>Pregunta N°{index + 1}:</Label>
                        <div>
                            <Input
                                type="radio"
                                name={`riesgo${riesgo.rc_id}_pregunta${index}`}
                                value="si"
                                onChange={() => handleSelectionChange(index, "si")}
                            />{" "}
                            Sí
                            <Input
                                type="radio"
                                name={`riesgo${riesgo.rc_id}_pregunta${index}`}
                                value="no"
                                className="ms-2"
                                onChange={() => handleSelectionChange(index, "no")}
                            />{" "}
                            No
                        </div>
                        {warnings.includes(index) && (
                            <div className="text-danger mt-1">
                                Por favor, selecciona una respuesta.
                            </div>
                        )}
                    </FormGroup>
                ))}
                {warnings.length > 0 && (
                    <Alert color="danger" className="mt-3">
                        Hay preguntas sin responder. Por favor, responde todas.
                    </Alert>
                )}
            </CardBody>
        </Card>
    );
};

export function Supervisor() {

    const [showTextInput, setShowTextInput] = useState(false);
    const [textInputValue, setTextInputValue] = useState("");

    const handleShowText = (show) => {
        setShowTextInput(show);
        if (!show) setTextInputValue(""); // Borrar el contenido del texto
    };

    const handleTextChange = (e) => {
        const value = e.target.value;
        // Limitar el texto a 185 caracteres
        if (value.length <= 185) {
            setTextInputValue(value);
        }
    };

    const navigate = useNavigate();
    const { userRut } = useParams();
    console.log(userRut);

    const [rutFilter, setRutFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    const [estadoTrabajador, setEstadoTrabajador] = useState(null);

    const [rutFilterTarVerde, setRutFilterTarVerde] = useState('');
    const [dateFilterTarVerde, setDateFilterTarVerde] = useState('');

    const [riesgosCriticos, setRiesgosCriticos] = useState([]);
    const [empleadosTrab, setEmpleadosTrab] = useState([]);

    const [formData, setFormData] = useState({});
    const [transversalData, setTransversalData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [alertMessage, setAlertMessage] = useState(null);
    const [actividadSeleccionada, setActividadSeleccionada] = useState("");
    const [empleadosSeleccionados, setEmpleadosSeleccionados] = useState([]);
    const [actividadRellenarSeleccionada, setActividadRellenarSeleccionada] = useState("");

    const [alertVisibleCon, setAlertVisibleCon] = useState(true);

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

    const handleEstadoTrabajadorChange = (e) => {
        setEstadoTrabajador(e.target.value === 'true');
        setAlertVisibleCon(false)
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
    
        // Unir las respuestas transversales, de riesgos críticos y el estado del trabajador
        const todasLasRespuestas = [
            ...preguntas_transversales.map((resp) => ({ respuesta: resp.respuestaTrans })), // Respuestas de las preguntas transversales
            ...respuestas_riesgo.map((resp) => ({ respuesta: resp.respuesta })), // Respuestas de los riesgos críticos
            { respuesta: estadoTrabajador === false ? false : true } // Respuesta de estado trabajador
        ];
    
        // Verificar si alguna respuesta es false
        const artEstado = todasLasRespuestas.some((respuesta) => respuesta.respuesta === false)
            ? "tarjeta verde" + (textInputValue ? "\n" + textInputValue : "")
            : "Completado"; // Si alguna respuesta es "false", se usa "tarjeta verde"
    
        try {
            // Enviar los datos al backend
            const response = await axios.post(`http://127.0.0.1:8000/api/art/regisRespArtSuper/`, data);
            setAlertMessage({ type: 'success', text: 'Formulario enviado exitosamente.' });
            console.log('ART creada:', response.data);
    
            // Cambiar el estado de la ART según la lógica anterior
            await axios.patch(`http://127.0.0.1:8000/api/art/Estado/${art_id}/`, { art_estado: artEstado });
    
            // **Actualizar el campo art_estado_Super**
            await axios.patch(`http://127.0.0.1:8000/api/art/editarEstadoSuper/${art_id}/`, { art_estado_Super: estadoTrabajador });
    
            // Actualizar el estado local para reflejar el cambio de estado
            setArtsRev((prevArts) =>
                prevArts.map((art) =>
                    art.art_id === art_id ? { ...art, art_estado: artEstado, art_estado_Super: estadoTrabajador } : art
                )
            );
            console.log(`Estado de ART ${art_id} cambiado a "${artEstado}" y art_estado_Super a "${estadoTrabajador}"`);
    
            setTimeout(() => {
                axios
                    .get('http://127.0.0.1:8000/api/art/ArtRealizadas/')
                    .then((response) => {
                        const artRevisado = response.data.filter(art => art.art_estado === "Pendiente");
                        setArtsRev(artRevisado);
                    })
                    .catch((error) => {
                        console.error('Error al actualizar las ARTs:', error);
                    });
            }, 5000);
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

            await Swal.fire({
                title: '¡Éxito!',
                text: 'Actividades actualizadas correctamente',
                icon: 'success',
                confirmButtonText: 'Aceptar',
            });
            setEmpleadosSeleccionados([]); // Limpiar la selección
        } catch (error) {
            console.error('Error al actualizar actividades:', error);
            alert(`Error: ${error.message}`);
        }
    };

    // Define el estado para los datos del trabajador
    const [worker, setWorker] = useState({
        emp_nombre: '',
        emp_direccion: '',
        emp_telefono: '',
        emp_correo: '',
        emp_especialidad: '',
        emp_actividad: '',
        emp_presente: true,  // Inicializado en true para que la lógica funcione
    });
    const [error, setError] = useState(null);

    // Usamos useEffect para hacer la solicitud a la API cuando el componente se monta
    useEffect(() => {
        const fetchWorkerData = async () => {
            try {
                // Hacemos la solicitud a la API para obtener los datos del trabajador
                const response = await axios.get(`http://localhost:8000/api/personal/Empleado/${userRut}`);
                
                // Verificar si el trabajador está presente
                if (response.data.emp_presente === false) {
                    setWorker({ ...response.data, emp_presente: false });
                } else {
                    setWorker(response.data);  // Actualiza el estado con los datos del trabajador
                }
            } catch (err) {
                setError('Error al obtener los datos del trabajador');
            }
        };
        
        // Llamada inicial para obtener los datos
        fetchWorkerData();

        // Configurar intervalo para verificar el estado de emp_presente cada 10 segundos
        const intervalId = setInterval(() => {
            fetchWorkerData();
        }, 2000); // 10 segundos de intervalo

        // Limpiar el intervalo cuando el componente se desmonte
        return () => clearInterval(intervalId);
    }, [userRut]);  // Re-ejecutar cuando cambie emp_rut

    // Si emp_presente es false, mostrar solo mensaje y botón para iniciar sesión

    useEffect(() => {
        if (worker.emp_nombre) {
            const fetchEmpleadosTrab = async () => {
                try {
                    const response = await axios.get(`http://127.0.0.1:8000/api/personal/EmpleadosCargoSuper/${worker.emp_nombre}`);
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
        }
    }, [worker.emp_nombre]);

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
        if (worker.emp_nombre) {
            const fetchArt = () => {
                axios.get(`http://127.0.0.1:8000/api/art/ArtRealizadas/${worker.emp_nombre}`)
                    .then((response) => {
                        const artVerdes = response.data.filter(art => art.art_estado !== "Pendiente" && art.art_estado !== "Completado");
                        const artRevisado = response.data.filter(art => art.art_estado === "Pendiente");
                        const artCompleto = response.data.filter(art => art.art_estado === "Completado");
                        
                        setArts(artVerdes);
                        setArtsRev(artRevisado);
                        setArtsCom(artCompleto);
                    })
                    .catch((error) => {
                        console.error('Error al obtener las ARTs:', error);
                    });
            };
    
            // Ejecutar la primera vez
            fetchArt();
    
            const intervalId = setInterval(() => {
                fetchArt();
            }, 2500); // Actualiza cada 2.5 segundos
    
            // Limpiar el intervalo cuando el componente se desmonte
            return () => clearInterval(intervalId);
        }
    }, [worker.emp_nombre]); // Dependencia de emp_nombre

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
            // Generar la URL del PDF 
            const url = `http://127.0.0.1:8000/api/art/ObtenerArt/${artId}/`;
        
            // Abrir el PDF en una nueva pestaña
            window.open(url, '_blank');
        };

    const filteredArts = artsCom.filter((art) => {
        const matchesRut = rutFilter
            ? art.empleados.some((empleado) =>
                    empleado.rut.toLowerCase().includes(rutFilter.toLowerCase())
                )
            : true;

        const matchesDate = dateFilter
            ? art.art_fecha === dateFilter
            : true;

        return matchesRut && matchesDate;
    });

    const filteredArtsTarVerde = arts.filter((art) => {
        const matchesRut = rutFilter
            ? art.empleados.some((empleado) =>
                    empleado.rut.toLowerCase().includes(rutFilter.toLowerCase())
                )
            : true;

        const matchesDate = dateFilter
            ? art.art_fecha === dateFilter
            : true;

        return matchesRut && matchesDate;
    });

    if (worker.emp_presente === false) {
        return (
            <Container className="mt-3 contSuper">
                <Row>
                    <Col>
                        <Alert color="danger">Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.</Alert>
                        <Button color="primary" onClick={() => navigate('/InicioSesion')}>Volver a iniciar sesión</Button>
                    </Col>
                </Row>
            </Container>
        );
    }

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
                                    Mi info
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
                                    Asignación ARTs
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
                                                <option value="Digestión acida de muestras">Digestión acida de muestras</option>
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
                                                        {empleadosTrab
                                                            .filter(trabajador => trabajador.emp_presente) // Filtrar solo los trabajadores con emp_presente en true
                                                            .map((trabajador, index) => (
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
                                                <option value="Digestión acida de muestras">Digestión acida de muestras</option>
                                                <option value="Lixiviaxión de muestras">Lixiviaxión de muestras</option>
                                                </Input>
                                            </Col>
                                        </FormGroup>
                                            
                                        <Card className="w-100">
                                        <Row>
                                            <Col md="2"></Col>
                                            <Col md="8">
                                                <PreguntasTransversales
                                                    handleChange={handleTransversalChange}
                                                    handleShowText={handleShowText}
                                                />
                                                <h3 className="text-center" >Riesgos criticos</h3>
        
                                                {riesgosCriticos.map((riesgo) => (
                                                    <RiesgoCritico
                                                        key={riesgo.rc_id}
                                                        riesgo={riesgo}
                                                        handleRiesgoChange={handleRiesgoChange}
                                                        handleShowText={handleShowText}
                                                    />
                                                ))}

                                                {showTextInput && (
                                                    <FormGroup className="mt-3">
                                                        <Label>Por favor, describe el motivo:</Label>
                                                        <Input
                                                            type="textarea"
                                                            maxLength={185} // Limitar a 185 caracteres
                                                            value={textInputValue}
                                                            onChange={handleTextChange}
                                                        />
                                                        <div className="text-muted mt-2">
                                                            {185 - textInputValue.length} caracteres restantes
                                                        </div>
                                                    </FormGroup>
                                                )}
                                            </Col>
                                            <Col md="2"></Col>

                                            <Row>
                                                <Col md="2"></Col>
                                                <Col md="8">
                                                    <Card className="mb-4">
                                                        <CardBody>
                                                            <div>
                                                                <h5>¿Verifiqué las condiciones físicas y psicológicas
                                                                de todo el Equipo Ejecutor del Trabajo?</h5>
                                                                <FormGroup>
                                                                    <Input type="radio" name="estadoTrabajador" value="true" onChange={handleEstadoTrabajadorChange} /> Sí
                                                                    <Input type="radio" name="estadoTrabajador" value="false" className="ms-2" onChange={handleEstadoTrabajadorChange} /> No
                                                                </FormGroup>
                                                                {alertVisibleCon && (
                                                                    <Alert color="danger">
                                                                        Por favor, seleccione si una opción.
                                                                    </Alert>
                                                                )}
                                                            </div>
                                                        </CardBody>
                                                    </Card>
                                                        {alertMessage && <Alert color={alertMessage.type}>{alertMessage.text}</Alert>}
                                                </Col>
                                                <Col md="2"></Col>
                                            </Row>

                                            <Col sm="12">
                                                <Row>
                                                    <Card>
                                                        <div className="text-center" >
                                                            <Table size="sm" striped style={{ width: '100%' }}>
                                                                <thead>
                                                                    <tr>
                                                                        <th>Nombre Empleado(s)</th>
                                                                        <th>Rut Empleado(s)</th>
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
                                                                                <td>
                                                                                    <ul>
                                                                                        {art.empleados.map((empleado, index) => (
                                                                                            <li key={index}>{empleado.nombre}</li>
                                                                                        ))}
                                                                                    </ul>
                                                                                </td>
                                                                                <td>
                                                                                    <ul>
                                                                                        {art.empleados.map((empleado, index) => (
                                                                                            <li key={index}>{empleado.rut}</li>
                                                                                        ))}
                                                                                    </ul>
                                                                                </td>
                                                                                <td>{art.hora_inicio}</td>
                                                                                <td>
                                                                                    {(() => {
                                                                                        const horaFinStr = art.hora_fin; // Hora en formato HH:mm:ss.ffffff
                                                                                        const horaFin = new Date(`1970-01-01T${horaFinStr}Z`); // Agregar una fecha ficticia
                                                                                        if (isNaN(horaFin.getTime())) {
                                                                                            return 'Hora no válida';
                                                                                        }
                                                                                        const hora = horaFin.getUTCHours(); // Usar UTC porque se asume formato ISO con "Z"
                                                                                        return hora >= 0 && hora < 12 ? 'Noche' : 'Día';
                                                                                    })()}
                                                                                </td>
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
                                            </Col>
                                        </Row>
                                        </Card>
                                    </Row>
                                </TabPane>
                                <TabPane tabId="4">
                                    {/* Filtros */}
                                    <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
                                        <input
                                            type="text"
                                            placeholder="Filtrar por RUT"
                                            value={rutFilter}
                                            onChange={(e) => setRutFilter(e.target.value)}
                                            style={{ padding: '0.5rem', flex: 1 }}
                                        />
                                        <input
                                            type="date"
                                            value={dateFilter}
                                            onChange={(e) => setDateFilter(e.target.value)}
                                            style={{ padding: '0.5rem', flex: 1 }}
                                        />
                                    </div>

                                    {/* Tabla */}
                                    <Table size="sm" striped style={{ width: '100%' }}>
                                        <thead>
                                            <tr>
                                                <th>Nombre Empleado(s)</th>
                                                <th>Rut Empleado(s)</th>
                                                <th>Hora Inicio</th>
                                                <th>Turno</th>
                                                <th>Fecha</th>
                                                <th>Actividad ART</th>
                                                <th>Estado</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredArts.map((art) => (
                                                <tr key={art.art_id}>
                                                    <td>
                                                        <ul>
                                                            {art.empleados.map((empleado, index) => (
                                                                <li key={index}>{empleado.nombre}</li>
                                                            ))}
                                                        </ul>
                                                    </td>
                                                    <td>
                                                        <ul>
                                                            {art.empleados.map((empleado, index) => (
                                                                <li key={index}>{empleado.rut}</li>
                                                            ))}
                                                        </ul>
                                                    </td>
                                                    <td>{art.hora_inicio}</td>
                                                    <td>
                                                        {(() => {
                                                            const horaFinStr = art.hora_fin;
                                                            const horaFin = new Date(`1970-01-01T${horaFinStr}Z`);
                                                            if (isNaN(horaFin.getTime())) {
                                                                return 'Hora no válida';
                                                            }
                                                            const hora = horaFin.getUTCHours();
                                                            return hora >= 0 && hora < 12 ? 'Noche' : 'Día';
                                                        })()}
                                                    </td>
                                                    <td>{art.art_fecha}</td>
                                                    <td>
                                                        {art.actividades.map((actividad, index) => (
                                                            <div key={index}>{actividad.nombre}</div>
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
                                            <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
                                                <input
                                                    type="text"
                                                    placeholder="Filtrar por RUT"
                                                    value={rutFilterTarVerde}
                                                    onChange={(e) => setRutFilterTarVerde(e.target.value)}
                                                    style={{ padding: '0.5rem', flex: 1 }}
                                                />
                                                <input
                                                    type="date"
                                                    value={dateFilterTarVerde}
                                                    onChange={(e) => setDateFilterTarVerde(e.target.value)}
                                                    style={{ padding: '0.5rem', flex: 1 }}
                                                />
                                            </div>
                                            <div className="text-center">
                                                <Table size="sm" striped style={{ width: '100%' }}>
                                                    <thead>
                                                        <tr>
                                                            <th>Nombre Empleado(s)</th>
                                                            <th>Rut Empleado(s)</th>
                                                            <th>Hora Inicio</th>
                                                            <th>Turno</th>
                                                            <th style={{ width: '150px' }}>Fecha</th>
                                                            <th>Actividad ART</th>
                                                            <th>Estado</th>
                                                            <th>Acciones</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {filteredArtsTarVerde.map((art) => (
                                                            <tr key={art.art_id}>
                                                                <td>
                                                                    <ul>
                                                                        {art.empleados.map((empleado, index) => (
                                                                            <li key={index}>{empleado.nombre}</li>
                                                                        ))}
                                                                    </ul>
                                                                </td>
                                                                <td>
                                                                    <ul>
                                                                        {art.empleados.map((empleado, index) => (
                                                                            <li key={index}>{empleado.rut}</li>
                                                                        ))}
                                                                    </ul>
                                                                </td>
                                                                <td>{art.hora_inicio}</td>
                                                                <td>
                                                                    {(() => {
                                                                        const horaFinStr = art.hora_fin;
                                                                        const horaFin = new Date(`1970-01-01T${horaFinStr}Z`);
                                                                        if (isNaN(horaFin.getTime())) {
                                                                            return 'Hora no válida';
                                                                        }
                                                                        const hora = horaFin.getUTCHours();
                                                                        return hora >= 0 && hora < 12 ? 'Noche' : 'Día';
                                                                    })()}
                                                                </td>
                                                                <td>{art.art_fecha}</td>
                                                                <td>
                                                                    {art.actividades.map((actividad, index) => (
                                                                        <div key={index}>{actividad.nombre}</div>
                                                                    ))}
                                                                </td>
                                                                <td>
                                                                    {art.art_estado.split('\n').map((line, index) => {
                                                                        if (index === 0) {
                                                                            // Primera línea con los dos puntos y espacio antes del salto de línea
                                                                            return <span key={index}>{line} : </span>;
                                                                        }
                                                                        return <span key={index} style={{ marginLeft: '20px' }}>"{line}"</span>; // Segunda línea entre comillas y con margen
                                                                    })}
                                                                </td>
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