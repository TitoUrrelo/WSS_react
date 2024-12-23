import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Form, FormGroup, Label, Input, Card, CardBody, Button, Spinner, Alert, Table } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const PreguntasTransversales = ({ handleChange, handleShowText }) => {
    const preguntas = [
        "¿Conozco el estándar, procedimiento y/o instructivo del trabajo que ejecutaré?",
        "¿Cuento con las competencias y salud compatible para ejecutar el trabajo?",
        "¿Cuento con la autorización para ingresar al área a ejecutar el trabajo?",
        "¿Segregué y señalicé el área de trabajo con los elementos según diseño?",
        "¿Conozco el número de teléfono o frecuencia radial para dar aviso en caso de emergencia, según protocolo del área?",
        "¿Uso los EPP definidos para el trabajo y se encuentran en buenas condiciones?",
    ];

    const [respuestas, setRespuestas] = useState({});
    const [warnings, setWarnings] = useState([]);

    useEffect(() => {
        const noRespondidas = preguntas
            .map((_, index) => `preguntaTransversal${index + 1}`)
            .filter((name) => !(name in respuestas));
        setWarnings(noRespondidas);
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
            <h2 className="text-center">Preguntas Transversales del Trabajador</h2>
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


const PreguntasTrabajoSimultaneo = ({ simultaneoData, handleSimultaneoChange, trabajoSimultaneo }) => (
    <Card className="mb-4">
        <CardBody>
            <h5 className="text-center">Preguntas para Trabajo Simultáneo</h5>
            <FormGroup>
                <Label>Si su respuesta es SÍ, describa el contexto del trabajo en simultáneo y verifique:</Label>
                <div>
                    <FormGroup check>
                        <Input
                            type="checkbox"
                            name="trabajoSimultaneoContexto"
                            value="personal_aseo"
                            checked={simultaneoData.contextTrabSim?.includes("no existe trabajo simultáneo") ? false : simultaneoData.contextTrabSim?.includes("personal_aseo")}
                            onChange={handleSimultaneoChange}
                            disabled={!trabajoSimultaneo}
                        />
                        <Label check>Trabajo junto a personal de aseo</Label>
                    </FormGroup>
                    <FormGroup check>
                        <Input
                            type="checkbox"
                            name="trabajoSimultaneoContexto"
                            value="sala_compartida"
                            checked={simultaneoData.contextTrabSim?.includes("no existe trabajo simultáneo") ? false : simultaneoData.contextTrabSim?.includes("sala_compartida")}
                            onChange={handleSimultaneoChange}
                            disabled={!trabajoSimultaneo}
                        />
                        <Label check>Trabajo sala compartida</Label>
                    </FormGroup>
                    <FormGroup check>
                        <Input
                            type="checkbox"
                            name="trabajoSimultaneoContexto"
                            value="trabajo_equipo"
                            checked={simultaneoData.contextTrabSim?.includes("no existe trabajo simultáneo") ? false : simultaneoData.contextTrabSim?.includes("trabajo_equipo")}
                            onChange={handleSimultaneoChange}
                            disabled={!trabajoSimultaneo}
                        />
                        <Label check>Trabajo en equipo</Label>
                    </FormGroup>
                    <FormGroup check>
                        <Input
                            type="checkbox"
                            name="trabajoSimultaneoContexto"
                            value="entre_actividades"
                            checked={simultaneoData.contextTrabSim?.includes("no existe trabajo simultáneo") ? false : simultaneoData.contextTrabSim?.includes("entre_actividades")}
                            onChange={handleSimultaneoChange}
                            disabled={!trabajoSimultaneo}
                        />
                        <Label check>Trabajo entre actividades</Label>
                    </FormGroup>
                    <FormGroup check>
                        <Input
                            type="checkbox"
                            name="trabajoSimultaneoContexto"
                            value="Personal_externo"
                            checked={simultaneoData.contextTrabSim?.includes("no existe trabajo simultáneo") ? false : simultaneoData.contextTrabSim?.includes("Personal_externo")}
                            onChange={handleSimultaneoChange}
                            disabled={!trabajoSimultaneo}
                        />
                        <Label check>Trabajo con personal externo</Label>
                    </FormGroup>
                </div>
            </FormGroup>

            <FormGroup>
                <Label>¿Se realizó la coordinación con el líder de la cuadrilla que realiza el trabajo en simultáneo?</Label>
                <div>
                    <Input
                        type="radio"
                        name="coordLider"
                        value="true"
                        checked={simultaneoData.coordLider === true}
                        onChange={handleSimultaneoChange}
                        disabled={!trabajoSimultaneo}
                    />
                    Sí
                    <Input
                        type="radio"
                        name="coordLider"
                        value="false"
                        checked={simultaneoData.coordLider === false}
                        onChange={handleSimultaneoChange}
                        disabled={!trabajoSimultaneo}
                    />
                    No
                </div>
            </FormGroup>

            <FormGroup>
                <Label>¿Se realizó la verificación cruzada de Controles Críticos?</Label>
                <div>
                    <Input
                        type="radio"
                        name="verfControles"
                        value="true"
                        checked={simultaneoData.verfControles === true}
                        onChange={handleSimultaneoChange}
                        disabled={!trabajoSimultaneo}
                    />
                    Sí
                    <Input
                        type="radio"
                        name="verfControles"
                        value="false"
                        checked={simultaneoData.verfControles === false}
                        onChange={handleSimultaneoChange}
                        disabled={!trabajoSimultaneo}
                    />
                    No
                </div>
            </FormGroup>

            <FormGroup>
                <Label>¿Se comunicó a todos los trabajadores las acciones de control que deben aplicar en trabajos simultáneos?</Label>
                <div>
                    <Input
                        type="radio"
                        name="comunicAccions"
                        value="true"
                        checked={simultaneoData.comunicAccions === true}
                        onChange={handleSimultaneoChange}
                        disabled={!trabajoSimultaneo}
                    />
                    Sí
                    <Input
                        type="radio"
                        name="comunicAccions"
                        value="false"
                        checked={simultaneoData.comunicAccions === false}
                        onChange={handleSimultaneoChange}
                        disabled={!trabajoSimultaneo}
                    />
                    No
                </div>
            </FormGroup>
        </CardBody>
    </Card>
);

export function FormularioART({ actNombre, }) {


    const [showTextInput, setShowTextInput] = useState(false);
    const [textInputValue, setTextInputValue] = useState("");

    const handleShowText = (show) => setShowTextInput(show);

    const handleTextChange = (e) => {
        const value = e.target.value;
        // Limitar el texto a 185 caracteres
        if (value.length <= 185) {
            setTextInputValue(value);
        }
    };


    const location = useLocation();
    const worker = location.state;

    const [riesgosCriticos, setRiesgosCriticos] = useState([]);
    const [actividades, setActividades] = useState([]);
    const [formData, setFormData] = useState({});
    const [transversalData, setTransversalData] = useState({});
    const [estadoTrabajador, setEstadoTrabajador] = useState(null);
    const [trabajoSimultaneo, setTrabajoSimultaneo] = useState(null);
    const [simultaneoData, setSimultaneoData] = useState({
        contextTrabSim: [],
        coordLider: false,
        verfControles: false,
        comunicAccions: false,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [alertMessage, setAlertMessage] = useState(null);

    const [empleados, setEmpleados] = useState([]);
    const [selectedEmpleados, setSelectedEmpleados] = useState([]);

    const selectedRuts = selectedEmpleados.map(empleado => empleado.emp_rut);
    
    useEffect(() => {
        axios
            .get(`http://127.0.0.1:8000/api/personal/Filtrar/${worker.emp_supervisorAcargo}/${worker.emp_nombre}`)
            .then((response) => {
                setEmpleados(response.data);
            })
            .catch((error) => {
                console.error('Error al obtener los empleados:', error);
            });
        }, [worker.emp_supervisorAcargo]);

        const handleCheckboxChange = (empleado) => {
            setSelectedEmpleados((prevSelected) => {
                if (prevSelected.some((item) => item.emp_rut === empleado.emp_rut)) {
                    // Si ya está seleccionado, se elimina de la lista
                    return prevSelected.filter((item) => item.emp_rut !== empleado.emp_rut);
                } else {
                    // Si no está seleccionado, se agrega a la lista
                    return [...prevSelected, empleado];
                }
                });
            };

    useEffect(() => {
        const fetchDatos = async () => {
            try {
                const empleadoResponse = await axios.get(`http://127.0.0.1:8000/api/personal/Empleado/${worker.emp_rut}`);
                
                // Verificamos si emp_actividad es "sin actividad"
                if (empleadoResponse.data.emp_actividad === "sin actividad") {
                    setNoActividad(true); // Cambiamos el estado para mostrar el mensaje
                    return; // Detenemos la ejecución si no hay actividad asignada
                }
    
                const actividadResponse = await axios.get(`http://127.0.0.1:8000/api/art/Actividad/${empleadoResponse.data.emp_actividad}/`);
                // Actualizamos los estados con los datos obtenidos
                setActividades(actividadResponse.data.actividad);
                setRiesgosCriticos(actividadResponse.data.riesgos_criticos);
            } catch (error) {
                console.error('Error al cargar los datos:', error);
                setAlertMessage({ type: 'danger', text: 'Error al cargar los datos. Intente nuevamente.' });
            } finally {
                setIsLoading(false);
            }
        };
    
        fetchDatos();
    }, [actNombre, worker.emp_rut]);
    
    // Estado para controlar si no hay actividad asignada
    const [noActividad, setNoActividad] = useState(false);

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
            [name]: value === 'si'? true : false
        }));
    };

    const handleEstadoTrabajadorChange = (e) => {
        setEstadoTrabajador(e.target.value === 'true');
        setAlertVisibleCon(false)
    };

    const [alertVisible, setAlertVisible] = useState(true); // Estado para la visibilidad del alert
    const [alertVisibleCon, setAlertVisibleCon] = useState(true);

    const handleTrabajoSimultaneoChange = (value) => {
        setTrabajoSimultaneo(value);
        setAlertVisible(false); // Ocultar alerta cuando se selecciona una opción
        if (!value) {
            setSelectedEmpleados([]);
            setSimultaneoData({
                contextTrabSim: ["no existe trabajo simultáneo"],
                coordLider: false,
                verfControles: false,
                comunicAccions: false,
            });
        } else {
            setSimultaneoData({
                contextTrabSim: [],
                coordLider: null,
                verfControles: null,
                comunicAccions: null,
            });
        }
    };

    const handleSimultaneoChange = (e) => {
        const { name, value, type, checked } = e.target;

        setSimultaneoData((prevData) => {
            if (type === "checkbox") {
                const contextTrabSim = prevData.contextTrabSim || [];
                return {
                    ...prevData,
                    contextTrabSim: checked
                        ? [...contextTrabSim.filter((item) => item !== "no existe trabajo simultáneo"), value]
                        : contextTrabSim.filter((item) => item !== value),
                };
            }

            return {
                ...prevData,
                [name]: value === "true",
            };
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSubmitted(true); // Marca el formulario como enviado
            setTimeout(() => {
                window.history.back();
            }, 5000);
        }, 2000);

        try {
            const response = await axios.put(
                `http://127.0.0.1:8000/api/personal/ActualizarActividad/${worker.emp_rut}/`, 
                { emp_actividad: "sin actividad" }
            );
            if (response.status === 200) {
            }
        } catch (error) {
            console.error("Error al actualizar la actividad:", error);
        }

        const now = new Date();
        const horaActual = now.toTimeString().split(' ')[0];
        const fechaActual = now.toISOString().split('T')[0];
        const horaFin = worker.emp_turno === 'Día' ? '21:00' : worker.emp_turno === 'Noche' ? '09:00' : null;

        const respuestas = riesgosCriticos.flatMap((riesgo) =>
            [...Array(Number(riesgo.rc_pregunta))].map((_, index) => ({
                riesgo_critico_id: riesgo.rc_id,
                pregunta_numero: index + 1,
                respuesta: formData[`riesgo${riesgo.rc_id}_pregunta${index}`] === 'si' ? true : false
            }))
        );

        const respuestasTransversales = Object.keys(transversalData).map((key, index) => ({
            pregunta_id: index + 1,
            respuestaTrans: transversalData[key]
        }));

        const data = {
            empleado_rut: worker.emp_rut,
            art: {
                art_trab_simultaneo: trabajoSimultaneo,
                art_estado_trab: estadoTrabajador,
                art_hora_inicio: horaActual,
                art_hora_fin: horaFin,
                art_fecha: fechaActual,
                art_supervisor: worker.emp_supervisorAcargo,
                art_estado: "Pendiente",
                actividad: [actividades.act_id],
                empleado: [worker.emp_rut, ...selectedRuts],
                pregunta: respuestasTransversales,
                art_contextTrabSim: simultaneoData.contextTrabSim || [],
                art_coordLider: simultaneoData.coordLider,
                art_verfControles: simultaneoData.verfControles,
                art_comunicAccions: simultaneoData.comunicAccions,
            },
            respuestas: respuestas
        };

        console.log('Datos a enviar al backend:', data);

        // Cambiar el estado de art_estado a "tarjeta verde" si alguna de las respuestas es "no"
        const todasLasRespuestas = [
            ...respuestasTransversales.map((resp) => ({ respuesta: resp.respuestaTrans })), // Respuestas de las preguntas transversales, adaptadas
            ...respuestas.map((resp) => ({ respuesta: resp.respuesta })), // Respuestas de los riesgos críticos
            { respuesta: estadoTrabajador === false ? false : true } // Respuesta de estado trabajador
        ];
        
        // Ahora evaluamos si alguna de las respuestas es "false"
        if (todasLasRespuestas.some((respuesta) => respuesta.respuesta === false)) {
            // Si alguna respuesta es "no" o "false"
            data.art.art_estado = "tarjeta verde" + (textInputValue ? "\n" + textInputValue : "\nno está en condiciones para trabajar");
        } else {
            // Si todas son "sí" o "true"
            data.art.art_estado = "Pendiente";
        }
        
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/art/regisRespArt/', data);
            setAlertMessage({ type: 'success', text: 'Formulario enviado exitosamente.' });
            console.log('ART creada:', response.data);
        } catch (error) {
            console.error('Error al crear ART:', error.response ? error.response.data : error.message);
            setAlertMessage({ type: 'danger', text: 'Error al enviar el formulario. Intente nuevamente.' });
        }
    };

    return (
        <Container>
            {noActividad ? (
                <Alert color="danger" className="text-center">
                <h4>No puedes rellenar el formulario porque ya rellenaste uno y/o no se te ha asignado una actividad.</h4>
            </Alert>
            ) : (
                <>
                    <h1 className="text-center">Formulario ART: {worker.emp_actividad}</h1><br />

                    {isLoading ? (
                        <Spinner color="primary" />
                    ) : (
                        <Form onSubmit={handleSubmit}>
                            <Row>
                                <Col md="2"></Col>
                                <Col md="6">
                                    <h2>Supervisor</h2>
                                    <Label for="supervisorSpinner">Supervisor a cargo: {worker.emp_supervisorAcargo} </Label>
                                </Col>
    
                                <Col md="4">
                                    <h2>Turno</h2>
                                    <Label>Turno de la actividad: {worker.emp_turno} </Label><br />
                                </Col>
                                <Col md="2"></Col>
                                <Row>
                                    <Col md="2"></Col>
                                    <Col md="8">
                                        <PreguntasTransversales
                                            handleChange={handleTransversalChange}
                                            handleShowText={handleShowText}
                                        />

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
                                </Row>
    
                                <Row>
                                    <Col md="2"></Col>
                                    <Col md="8">
                                        <h3 className="text-center">Riesgos y medidas de control</h3>
                                        <Card>
                                            <Row>
                                                <Col ms="6">
                                                    <strong>Riesgos</strong>
                                                    <p>
                                                        {actividades?.act_riesgo
                                                            ?.split(',')
                                                            .map((riesgo, index) => (
                                                                <span key={index}>
                                                                    {riesgo.trim()}
                                                                    <br />
                                                                </span>
                                                            )) || "No hay riesgos disponibles"}
                                                    </p>
                                                </Col>
                                                <Col ms="6">
                                                    <strong>Medidas de Control</strong>
                                                    <p>
                                                        {actividades?.act_medida_control
                                                            ?.split(',')
                                                            .map((medida, index) => (
                                                                <span key={index}>
                                                                    {medida.trim()}
                                                                    <br />
                                                                </span>
                                                            )) || "No hay medidas de control disponibles"}
                                                    </p>
                                                </Col>
                                            </Row>
                                        </Card>
                                    </Col>
                                    <Col md="2"></Col>
                                </Row>
    
                                <Row>
                                    <Col md="2"></Col>
                                    <Col md="8">
                                        <br />
                                        <h3 className="text-center">Trabajo Simultáneo</h3>
                                        <Row>
                                            <Col md="4"></Col>
                                            <Col md="4">
                                                <div>
                                                    <FormGroup>
                                                        <Label>¿Existen trabajos en simultáneo?</Label><br />
                                                        <Input
                                                            type="radio"
                                                            name="trabajoSimultaneo"
                                                            value="si"
                                                            onChange={() => handleTrabajoSimultaneoChange(true)}
                                                        /> Sí
                                                        <Input
                                                            type="radio"
                                                            name="trabajoSimultaneo"
                                                            value="no"
                                                            className="ms-2"
                                                            onChange={() => handleTrabajoSimultaneoChange(false)}
                                                        /> No
                                                    </FormGroup>
                                                    
                                                    {alertVisible && (
                                                        <Alert color="danger">
                                                            Por favor, seleccione si existen trabajos simultáneos.
                                                        </Alert>
                                                    )}
                                                </div>
                                            </Col>
                                            <Col md="4"></Col>
                                        </Row>
    
                                        <PreguntasTrabajoSimultaneo
                                            simultaneoData={simultaneoData}
                                            handleSimultaneoChange={handleSimultaneoChange}
                                            trabajoSimultaneo={trabajoSimultaneo}
                                        />
                                        <Card>
                                        <div className="text-center">
                                                <h4>
                                                    Empleados a Cargo activos de: {worker.emp_supervisorAcargo}
                                                </h4>
                                                <Table size="sm" striped>
                                                    <thead>
                                                        <tr>
                                                            <th>Nombre</th>
                                                            <th>Rut </th>
                                                            <th>Seleccionar </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {empleados.map((empleado) => (
                                                            <tr key={empleado.emp_rut}>
                                                            <td>{empleado.emp_nombre}</td>
                                                            <td>{empleado.emp_rut}</td>
                                                            <td>
                                                                <input
                                                                type="checkbox"
                                                                onChange={() => handleCheckboxChange(empleado)}
                                                                disabled={!trabajoSimultaneo}
                                                                checked={selectedEmpleados.includes(empleado)}
                                                                />
                                                            </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                                <h3>Seleccionados:</h3>
                                                <ul>
                                                    {selectedEmpleados.map((empleado) => (
                                                    <li key={empleado.emp_rut}>
                                                        {empleado.emp_nombre} ({empleado.emp_rut})
                                                    </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </Card>
                                        <Card className="mb-4">
                                            <CardBody>
                                                <div>
                                                    <h5>Confirmo que estoy en condiciones de hacer el trabajo</h5>
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
                                        <Button type="submit" disabled={isSubmitting || isSubmitted}>
                                            {isSubmitting ? "Enviando..." : isSubmitted ? "Enviado" : "Enviar"}
                                        </Button>
                                    </Col>
                                    <Col md="2"></Col>
                                </Row>
                            </Row>
                        </Form>
                    )}
                </>
            )}
        </Container>
    );
}
