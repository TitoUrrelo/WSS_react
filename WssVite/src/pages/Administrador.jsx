import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Form, FormGroup, Label, Input, Card, CardBody, Nav, NavItem, NavLink, Button, TabPane, TabContent, CardTitle, CardText,Table,Modal, ModalHeader, ModalBody, ModalFooter, Alert} from 'reactstrap'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './Administrador.css';
import 'bootstrap/dist/css/bootstrap.min.css'

export function Administrador() {
    const { userRut } = useParams();
    const navigate = useNavigate();

    const [empleadosTrab, setEmpleadosTrab] = useState([]);
    const [empleadosSuper, setEmpleadosSuper] = useState([]);

    const [modalEliminar, setModalEliminar] = useState(false);
    const [modalModificar, setModalModificar] = useState(false);
    const [modalModificarSuper, setModalModificarSuper] = useState(false);

    const [empleadoEliminar, setEmpleadoEliminar] = useState(null);

    const [supervisores, setSupervisores] = useState([]);
    const [supervisorSeleccionado, setSupervisorSeleccionado] = useState('');

    const [empleadoAEditar, setEmpleadoAEditar] = useState(null);
    const [nombreCompleto, setNombreCompleto] = useState('');
    const [direccionResidencia, setDireccionResidencia] = useState('');
    const [telefono, setTelefono] = useState('');
    const [correo, setCorreo] = useState('');
    const [contraseña, setContraseña] = useState('');
    const [especialidad, setEspecialidad] = useState('');
    const [turno, setEmpTurno] = useState('');

    const toggleEliminar = () => setModalEliminar(!modalEliminar);
    const toggleModificar = () => setModalModificar(!modalModificar);
    const toggleModificarSuper = () => setModalModificarSuper(!modalModificarSuper);

    const handleEliminar = (empleado) => {
        setEmpleadoEliminar(empleado);  // Establecemos el empleado a eliminar
        setModalEliminar(true);           // Abrimos el modal de eliminación
    };

    const confirmEliminar = async () => {
        try {
            await axios.delete(`http://127.0.0.1:8000/api/personal/Empleado/modificar/${userRut}/${empleadoEliminar.emp_rut}`);
            setModalEliminar(false);
        } catch (error) {
            console.error("Error al eliminar el empleado:", error);
        }
    };


    const handleModificar = (empleado) => {
        setEmpleadoAEditar(empleado);
        setNombreCompleto(empleado.emp_nombre);
        setDireccionResidencia(empleado.emp_direccion);
        setTelefono(empleado.emp_telefono);
        setCorreo(empleado.emp_correo);
        setContraseña(empleado.emp_contraseña);
        setEspecialidad(empleado.emp_especialidad);
        setSupervisorSeleccionado(empleado.emp_supervisorAcargo);
        setEmpTurno(empleado.emp_turno);
        toggleModificar(); 
    };

    const handleModificarSuper = (empleado) => {
        setEmpleadoAEditar(empleado);
        setNombreCompleto(empleado.emp_nombre);
        setDireccionResidencia(empleado.emp_direccion);
        setTelefono(empleado.emp_telefono);
        setCorreo(empleado.emp_correo);
        setContraseña(empleado.emp_contraseña);
        setEspecialidad(empleado.emp_especialidad);
        setEmpTurno(empleado.emp_turno);
        toggleModificarSuper(); 
    };

    const handleGuardarCambios = async () => {
        const data = {
            emp_nombre: nombreCompleto,
            emp_direccion: direccionResidencia,
            emp_telefono: telefono,
            emp_correo: correo,
            emp_contraseña: contraseña,
            emp_especialidad: especialidad,
            emp_supervisorAcargo: supervisorSeleccionado,
            emp_turno: turno
            
        };
        console.log("Datos enviados: ", data);
        try {
            const response = await axios.patch(`http://127.0.0.1:8000/api/personal/Empleado/modificar/${userRut}/${empleadoAEditar.emp_rut}`, data);
            console.log('Empleado actualizado:', response.data);
            setModalModificar(false);  // Cerrar modal de modificación
        } catch (error) {
            console.error('Error al modificar el empleado:', error);
        }
    };
    
    
    const handleCancelar = () => {
        setModalModificar(false);  // Cerrar modal de modificación
        setModalEliminar(false);   // Cerrar modal de eliminación (por si estaba abierto)
    };

    useEffect(() => {
        const fetchEmpleadosTrab = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/personal/EmpleadosCargo/Trabajador');
                setEmpleadosTrab(response.data);
                const supervisoresResponse = await axios.get('http://127.0.0.1:8000/api/personal/EmpleadosCargo/Supervisor');
                setSupervisores(supervisoresResponse.data);
            } catch (error) {
                console.error('Error al obtener trabajadores:', error);
            }
        };

        fetchEmpleadosTrab();

        const fetchEmpleadosSuper = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/api/personal/EmpleadosCargo/Supervisor');
                setEmpleadosSuper(response.data);
            } catch (error) {
                console.error('Error al obtener supervisores:', error);
            }
        };
        fetchEmpleadosSuper();

        const intervalId = setInterval(() => {
            fetchEmpleadosTrab();
            fetchEmpleadosSuper();
        }, 10000); // Actualiza cada 10 segundos

        return () => clearInterval(intervalId);
    }, []);

    const [activeTab, setActiveTab] = useState("1");
    const toggleTab = (tab) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
        }
    };

    const [isOpen, setIsOpen] = useState(false);

    const [añadirTrab, setAñadirTrab] = useState({
        emp_rut: '',
        emp_nombre: '',
        emp_direccion: '',
        emp_telefono: '',
        emp_correo: '',
        emp_cargo: 'Trabajador',
        emp_contraseña: '',
        emp_especialidad: '',
        emp_actividad: 'sin actividad',
        emp_turno: '',
        emp_presente: false
    });

    const toggleModal = () => {
        setIsOpen(!isOpen); // Alterna la visibilidad del modal
    };

    

    const handleSubmitTrab = async (e) => {
        e.preventDefault(); 
        try {
            await axios.post('http://127.0.0.1:8000/api/personal/Trabajadores/', añadirTrab, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            alert('Trabajador creado exitosamente');
        } catch (error) {
            if (error.response && error.response.data.error) {
                alert(`Error: ${error.response.data.error}`);
            } else {
                console.error('Error al añadir el trabajador:', error);
                console.log('Datos enviados:', añadirTrab); 
                
                alert('Error al añadir el trabajador. Por favor, revise los datos e intente de nuevo.'), console.log('Datos enviados:', añadirTrab); ;
            }
        }
    };

    const handleChangeTrab = (e) => {
        const { name, value } = e.target;
        setAñadirTrab((preAñadirTrab) => ({
            ...preAñadirTrab,
            [name]: value,
        }));
    };

    const handleSupervisorChange = (e) => {
        const supervisor = e.target.value;
        setSupervisorSeleccionado(supervisor);
        setAñadirTrab((prevState) => ({
            ...prevState,
            emp_supervisorAcargo: supervisor,
        }));
    };

    const [isOpenSuper, setIsOpenSuper] = useState(false);

    const [añadirSuper, setAñadirSuper] = useState({
        emp_rut: '',
        emp_nombre: '',
        emp_direccion: '',
        emp_telefono: '',
        emp_correo: '',
        emp_cargo: 'Supervisor',
        emp_contraseña: '',
        emp_especialidad: '',
        emp_actividad: 'sin actividad',
        emp_turno: ''
    });

    const toggleModalSuper = () => {
        setIsOpenSuper(!isOpenSuper); // Alterna la visibilidad del modal
    };

    const handleSubmitSuper = async (e) => {
        e.preventDefault(); 
        try {
            await axios.post('http://127.0.0.1:8000/api/personal/Trabajadores/', añadirSuper, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            alert('Supervisor creado exitosamente');
        } catch (error) {
            if (error.response && error.response.data.error) {
                alert(`Error: ${error.response.data.error}`);
            } else {
                console.error('Error al añadir el trabajador:', error);
                alert('Error al añadir el supervisor. Por favor, revise los datos e intente de nuevo.');
            }
        }
    };

    const handleChangeSuper = (e) => {
        const { name, value } = e.target;
        setAñadirSuper((preAñadirSuper) => ({
            ...preAñadirSuper,
            [name]: value,
        }));
    };

    const [dataArt, setDataArt] = useState([]);

    useEffect(() => {
        // Función para obtener los datos
        const fetchData = () => {
            axios.get('http://127.0.0.1:8000/api/art/artPorActividad/')
                .then(response => {
                    const data = response.data;

                    // Transformar la respuesta para que coincida con el formato requerido por el gráfico
                    const formattedData = data.map(item => ({
                        name: item.actividad,
                        ARTs: item.cantidad,
                    }));

                    // Establecer el estado con los datos formateados
                    setDataArt(formattedData);
                })
                .catch(error => {
                    console.error('Error al obtener los datos:', error);
                });
        };

        // Llamar a la función para obtener los datos inmediatamente cuando el componente se monta
        fetchData();

        // Establecer un intervalo para que se actualice cada 5 segundos
        const intervalId = setInterval(fetchData, 5000);

        // Limpiar el intervalo cuando el componente se desmonte
        return () => clearInterval(intervalId);
    }, []);

    const [data, setData] = useState([]);
    const [empRut, setEmpRut] = useState("");  // Guardar el Rut del trabajador

    // Función para manejar la entrada del Rut
    const handleRutChange = (event) => {
        setEmpRut(event.target.value);
    };

    // Función para obtener los datos de ART por trabajador
    const fetchData = () => {
        fetch(`http://127.0.0.1:8000/api/art/arts_por_empleado/${empRut}/`)
            .then(response => response.json())
            .then(data => {
                const formattedData = data.map(item => ({
                    name: item.name,
                    value: item.ARTs
                }));
                setData(formattedData);
                setTotalValue(formattedData.reduce((sum, item) => sum + item.value, 0));  // Calcular el total de ARTs
            })
            .catch(error => console.error("Error fetching data:", error));
    };

    // Llamar a la API cuando el Rut cambie
    useEffect(() => {
        if (empRut) {
            fetchData();
        }
    }, [empRut]);

    // Función personalizada para mostrar el porcentaje en el gráfico
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, index }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
                {`${data[index].name}: ${value}`}
            </text>
        );
    };

    const totalValue = data.reduce((acc, item) => acc + item.value, 0);
    
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA7777'];


    useEffect(() => {
        const timeoutId = setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
        }, 100);  // Pequeño retardo para permitir que el tab se renderice completamente
        return () => clearTimeout(timeoutId);
    }, [activeTab]);

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

    if (worker.emp_presente === false) {
        return (
            <Container className="mt-3 contAdmin">
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
    <Container className="mt-3 contAdmin">
        <Row>
            <Col md="12">
                <Col className="w-100">
                    <div className="text-center">
                        <h2>Jefe de Laboratorio</h2>
                    </div>
                    <div>
                        <Nav  fill tabs>
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
                                    Supervisores
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    className={activeTab === "3" ? "active" : ""}
                                    onClick={() => toggleTab("3")}
                                >
                                    Grafico por Actividades
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    className={activeTab === "4" ? "active" : ""}
                                    onClick={() => toggleTab("4")}
                                >
                                    Grafico por Trabajador
                                </NavLink>
                            </NavItem>
                        </Nav>
                        <TabContent activeTab={activeTab}>
                            <TabPane tabId="1">
                                <br></br>
                                <Row>
                                    <Col sm="12">
                                        <Card>
                                            <div className="text-center">
                                                <h4>
                                                    Lista de trabajadores
                                                </h4>
                                                <div>
                                                    {/* Botón para abrir el modal */}
                                                    <Button color="primary" onClick={toggleModal}>
                                                        Añadir Nuevo Trabajador
                                                    </Button>

                                                    {/* Modal */}
                                                    <Modal isOpen={isOpen} toggle={toggleModal}>
                                                        <ModalHeader toggle={toggleModal}>Nuevo Trabajador</ModalHeader>
                                                        <ModalBody>
                                                            <Form onSubmit={handleSubmitTrab}>
                                                                <FormGroup>
                                                                    <Label for="rutTrabajador">Rut</Label>
                                                                    <Input
                                                                        type="text"
                                                                        name="emp_rut"
                                                                        id="rutTrabajador"
                                                                        onChange={handleChangeTrab}
                                                                        value={añadirTrab.emp_rut}
                                                                    />
                                                                </FormGroup>
                                                                <FormGroup>
                                                                    <Label for="fullNameTrabajador">Nombre Completo</Label>
                                                                    <Input
                                                                        type="text"
                                                                        name="emp_nombre"
                                                                        id="fullNameTrabajador"
                                                                        onChange={handleChangeTrab}
                                                                        value={añadirTrab.emp_nombre}
                                                                    />
                                                                </FormGroup>
                                                                <FormGroup>
                                                                    <Label for="addressTrabajador">Dirección de Residencia</Label>
                                                                    <Input
                                                                        type="text"
                                                                        name="emp_direccion"
                                                                        id="addressTrabajador"
                                                                        onChange={handleChangeTrab}
                                                                        value={añadirTrab.emp_direccion}
                                                                    />
                                                                </FormGroup>
                                                                <FormGroup>
                                                                    <Label for="phoneTrabajador">Teléfono</Label>
                                                                    <Input
                                                                        type="text"
                                                                        name="emp_telefono"
                                                                        id="phoneTrabajador"
                                                                        onChange={handleChangeTrab}
                                                                        value={añadirTrab.emp_telefono}
                                                                    />
                                                                </FormGroup>
                                                                <FormGroup>
                                                                    <Label for="emailTrabajador">Correo Electrónico</Label>
                                                                    <Input
                                                                        type="email"
                                                                        name="emp_correo"
                                                                        id="emailTrabajador"
                                                                        onChange={handleChangeTrab}
                                                                        value={añadirTrab.emp_correo}
                                                                    />
                                                                </FormGroup>
                                                                <FormGroup>
                                                                    <Label for="contraseñaTrabajador">Contraseña</Label>
                                                                    <Input
                                                                        type="password"
                                                                        name="emp_contraseña"
                                                                        id="contraseñaTrabajador"
                                                                        onChange={handleChangeTrab}
                                                                        value={añadirTrab.emp_contraseña}
                                                                    />
                                                                </FormGroup>
                                                                <FormGroup>
                                                                    <Label for="EspecialidadTrabajador">Especialidad</Label>
                                                                    <Input
                                                                        type="text"
                                                                        name="emp_especialidad"
                                                                        id="EspecialidadTrabajador"
                                                                        onChange={handleChangeTrab}
                                                                        value={añadirTrab.emp_especialidad}
                                                                    />
                                                                </FormGroup>
                                                                <FormGroup>
                                                                    <Label for="supervisorSpinner">Supervisor a cargo </Label>
                                                                    <Input
                                                                        type="select"
                                                                        id="supervisorSpinner"
                                                                        value={supervisorSeleccionado}
                                                                        onChange={handleSupervisorChange}
                                                                    >
                                                                        <option value=""></option>
                                                                        {supervisores.map((supervisor) => (
                                                                            <option key={supervisor.emp_rut} value={supervisor.emp_nombre}>
                                                                                {supervisor.emp_nombre}
                                                                            </option>
                                                                        ))}
                                                                    </Input>
                                                                </FormGroup>
                                                                <FormGroup>
                                                                    <Label for="turnoTrabajador">Seleccione Turno</Label>
                                                                    <div>
                                                                        <Label>
                                                                            <Input
                                                                                type="radio"
                                                                                name="emp_turno"
                                                                                value="Día"
                                                                                checked={añadirTrab.emp_turno === "Día"}
                                                                                onChange={handleChangeTrab}
                                                                            />
                                                                            Día
                                                                        </Label>
                                                                        <Label>
                                                                            <Input
                                                                                type="radio"
                                                                                name="emp_turno"
                                                                                value="Noche"
                                                                                checked={añadirTrab.emp_turno === "Noche"}
                                                                                onChange={handleChangeTrab}
                                                                            />
                                                                            Noche
                                                                        </Label>
                                                                    </div>
                                                                </FormGroup>
                                                                <Button type="submit" color="primary" block>
                                                                    Guardar
                                                                </Button>
                                                            </Form>
                                                        </ModalBody>
                                                        <ModalFooter>
                                                            <Button color="secondary" onClick={toggleModal}>
                                                                Cancelar
                                                            </Button>
                                                        </ModalFooter>
                                                    </Modal>
                                                </div>
                                                <Table size="sm" striped>
                                                    <thead>
                                                        <tr>
                                                            <th>#</th>
                                                            <th>Nombre</th>
                                                            <th>Rut </th>
                                                            <th>Correo</th>
                                                            <th>Especialidad</th>
                                                            <th>Supervisor</th>
                                                            <th>Turno</th>
                                                            <th>Modificar</th>
                                                            <th>Eliminar</th>
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
                                                                <td>{trabajador.emp_supervisorAcargo}</td>
                                                                <td>{trabajador.emp_turno}</td>
                                                                <td>
                                                                    <Button color="primary" size="sm" onClick={() => handleModificar(trabajador)}>
                                                                        Modificar
                                                                    </Button>
                                                                </td>
                                                                <td>
                                                                    <Button color="danger" onClick={() => handleEliminar(trabajador)} className="btn-sm">
                                                                        Eliminar
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        </Card>

                                        <Modal isOpen={modalEliminar} toggle={toggleEliminar}>
                                            <ModalHeader toggle={toggleEliminar}>Confirmar eliminación</ModalHeader>
                                            <ModalBody>
                                                ¿Está seguro de que desea eliminar al trabajador {empleadoEliminar?.emp_nombre}?
                                            </ModalBody>
                                            <ModalFooter>
                                                <Button color="secondary" onClick={handleCancelar}>Cancelar</Button>
                                                <Button color="danger" onClick={confirmEliminar}>Eliminar</Button>
                                            </ModalFooter>
                                        </Modal>

                                        <Modal isOpen={modalModificar} toggle={() => setModalModificar(!modalModificar)}>
                                            <ModalHeader toggle={() => setModalModificar(!modalModificar)}>Modificar trabajador</ModalHeader>
                                            <ModalBody>
                                            <FormGroup>
                                                <Label for="nombreCompleto">Nombre Completo</Label>
                                                <Input
                                                type="text"
                                                id="nombreCompleto"
                                                value={nombreCompleto}
                                                onChange={(e) => setNombreCompleto(e.target.value)}
                                                />
                                            </FormGroup>
                                            <FormGroup>
                                                <Label for="direccionResidencia">Dirección</Label>
                                                <Input
                                                type="text"
                                                id="direccionResidencia"
                                                value={direccionResidencia}
                                                onChange={(e) => setDireccionResidencia(e.target.value)}
                                                />
                                            </FormGroup>
                                            <FormGroup>
                                                <Label for="telefono">Teléfono</Label>
                                                <Input
                                                type="text"
                                                id="telefono"
                                                value={telefono}
                                                onChange={(e) => setTelefono(e.target.value)}
                                                />
                                            </FormGroup>
                                            <FormGroup>
                                                <Label for="correo">Correo</Label>
                                                <Input
                                                type="email"
                                                id="correo"
                                                value={correo}
                                                onChange={(e) => setCorreo(e.target.value)}
                                                />
                                            </FormGroup>
                                            <FormGroup>
                                                <Label for="contraseña">Contraseña</Label>
                                                <Input
                                                type="password"
                                                id="contraseña"
                                                value={contraseña}
                                                onChange={(e) => setContraseña(e.target.value)}
                                                />
                                            </FormGroup>
                                            <FormGroup>
                                                <Label for="especialidad">Especialidad</Label>
                                                <Input
                                                type="text"
                                                id="especialidad"
                                                value={especialidad}
                                                onChange={(e) => setEspecialidad(e.target.value)}
                                                />
                                            </FormGroup>
                                            <FormGroup>
                                                <Label for="supervisorSpinner">Supervisor a cargo </Label>
                                                <Input
                                                    type="select"
                                                    id="supervisorSpinner"
                                                    value={supervisorSeleccionado}
                                                    onChange={handleSupervisorChange}
                                                >
                                                    <option value=""></option>
                                                    {supervisores.map((supervisor) => (
                                                        <option key={supervisor.emp_rut} value={supervisor.emp_nombre}>
                                                            {supervisor.emp_nombre}
                                                        </option>
                                                    ))}
                                                </Input>
                                            </FormGroup>
                                            <FormGroup>
                                                <Label for="turnoTrabajador">Seleccione Turno</Label>
                                                <div>
                                                    <Label>
                                                        <Input
                                                            type="radio"
                                                            name="emp_turno"
                                                            value="Día"
                                                            checked={turno === "Día"}
                                                            onChange={(e) => setEmpTurno(e.target.value)}
                                                        />
                                                        Día
                                                    </Label>
                                                    <Label>
                                                        <Input
                                                            type="radio"
                                                            name="emp_turno"
                                                            value="Noche"
                                                            checked={turno === "Noche"}
                                                            onChange={(e) => setEmpTurno(e.target.value)} // Maneja el cambio
                                                        />
                                                        Noche
                                                    </Label>
                                                </div>
                                            </FormGroup>
                                            </ModalBody>
                                            <ModalFooter>
                                            <Button color="secondary" onClick={handleCancelar}>Cancelar</Button>
                                            <Button color="primary" onClick={handleGuardarCambios}>Guardar cambios</Button>
                                            </ModalFooter>
                                        </Modal>

                                    </Col>
                                </Row>
                            </TabPane>
                            <TabPane tabId="2">
                                <br></br>
                                <Row>
                                    <Col sm="12">
                                        <Card>
                                            <div className="text-center">
                                                <h4>
                                                    Lista de Supervisores
                                                </h4>
                                                <div>
                                                    {/* Botón para abrir el modal */}
                                                    <Button color="primary" onClick={toggleModalSuper}>
                                                        Añadir Nuevo Supervisor
                                                    </Button>

                                                    {/* Modal */}
                                                    <Modal isOpen={isOpenSuper} toggle={toggleModalSuper}>
                                                        <ModalHeader toggle={toggleModalSuper}>Nuevo Supervisor</ModalHeader>
                                                        <ModalBody>
                                                            <Form onSubmit={handleSubmitSuper}>
                                                                <FormGroup>
                                                                    <Label for="rutSupervisor">Rut</Label>
                                                                    <Input
                                                                        type="text"
                                                                        name="emp_rut"
                                                                        id="rutSupervisor"
                                                                        value={añadirSuper.emp_rut} // Corregido
                                                                        onChange={handleChangeSuper}
                                                                    />
                                                                </FormGroup>
                                                                <FormGroup>
                                                                    <Label for="fullNameSupervisor">Nombre Completo</Label>
                                                                    <Input
                                                                        type="text"
                                                                        name="emp_nombre"
                                                                        id="fullNameSupervisor"
                                                                        value={añadirSuper.emp_nombre} // Corregido
                                                                        onChange={handleChangeSuper}
                                                                    />
                                                                </FormGroup>
                                                                <FormGroup>
                                                                    <Label for="addressSupervisor">Dirección de Residencia</Label>
                                                                    <Input
                                                                        type="text"
                                                                        name="emp_direccion"
                                                                        id="addressSupervisor"
                                                                        value={añadirSuper.emp_direccion} // Corregido
                                                                        onChange={handleChangeSuper}
                                                                    />
                                                                </FormGroup>
                                                                <FormGroup>
                                                                    <Label for="phoneSupervisor">Teléfono</Label>
                                                                    <Input
                                                                        type="text"
                                                                        name="emp_telefono"
                                                                        id="phoneSupervisor"
                                                                        value={añadirSuper.emp_telefono} // Corregido
                                                                        onChange={handleChangeSuper}
                                                                    />
                                                                </FormGroup>
                                                                <FormGroup>
                                                                    <Label for="emailSupervisor">Correo Electrónico</Label>
                                                                    <Input
                                                                        type="email"
                                                                        name="emp_correo"
                                                                        id="emailSupervisor"
                                                                        value={añadirSuper.emp_correo} // Corregido
                                                                        onChange={handleChangeSuper}
                                                                    />
                                                                </FormGroup>
                                                                <FormGroup>
                                                                    <Label for="contraseñaSupervisor">Contraseña</Label>
                                                                    <Input
                                                                        type="password"
                                                                        name="emp_contraseña"
                                                                        id="contraseñaSupervisor"
                                                                        value={añadirSuper.emp_contraseña} // Corregido
                                                                        onChange={handleChangeSuper}
                                                                    />
                                                                </FormGroup>
                                                                <FormGroup>
                                                                    <Label for="EspecialidadSupervisor">Especialidad</Label>
                                                                    <Input
                                                                        type="text"
                                                                        name="emp_especialidad"
                                                                        id="EspecialidadSupervisor"
                                                                        value={añadirSuper.emp_especialidad} // Corregido
                                                                        onChange={handleChangeSuper}
                                                                    />
                                                                </FormGroup>
                                                                <FormGroup>
                                                                <Label for="turnoSupervisor">Seleccione Turno</Label>
                                                                <div>
                                                                    <Label>
                                                                        <Input
                                                                            type="radio"
                                                                            name="emp_turno2"
                                                                            value="Día"
                                                                            checked={añadirSuper.emp_turno === "Día"}
                                                                            onChange={handleChangeSuper}
                                                                        />
                                                                        Día
                                                                    </Label>
                                                                    <Label>
                                                                        <Input
                                                                            type="radio"
                                                                            name="emp_turno2"
                                                                            value="Noche"
                                                                            checked={añadirSuper.emp_turno === "Noche"}
                                                                            onChange={handleChangeSuper}
                                                                        />
                                                                        Noche
                                                                    </Label>
                                                                </div>
                                                            </FormGroup>
                                                                <button type="submit" className="btn btn-primary">
                                                                    Guardar
                                                                </button>
                                                            </Form>
                                                        </ModalBody>
                                                    </Modal>
                                                </div>
                                                <Table size="sm" striped>
                                                    <thead>
                                                        <tr>
                                                            <th>#</th>
                                                            <th>Nombre</th>
                                                            <th>Rut </th>
                                                            <th>Correo</th>
                                                            <th>Especialidad</th>
                                                            <th>Turno</th>
                                                            <th>Modificar</th>
                                                            <th>Eliminar</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {empleadosSuper.map((supervisor, index) => (
                                                            <tr key={supervisor.emp_rut}>
                                                                <td>{index + 1}</td>
                                                                <td>{supervisor.emp_nombre}</td>
                                                                <td>{supervisor.emp_rut}</td>
                                                                <td>{supervisor.emp_correo}</td>
                                                                <td>{supervisor.emp_especialidad}</td>
                                                                <td>{supervisor.emp_turno}</td>
                                                                <td>
                                                                        <Button color="primary" size="sm" onClick={() => handleModificarSuper(supervisor)}>
                                                                            Modificar
                                                                        </Button>
                                                                    </td>
                                                                    <td>
                                                                        <Button color="danger" onClick={() => handleEliminar(supervisor)} className="btn-sm">
                                                                            Eliminar
                                                                        </Button>
                                                                    </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        </Card>

                                        <Modal isOpen={modalEliminar} toggle={toggleEliminar}>
                                                <ModalHeader toggle={toggleEliminar}>Confirmar eliminación</ModalHeader>
                                                <ModalBody>
                                                    ¿Está seguro de que desea eliminar al trabajador {empleadoEliminar?.emp_nombre}?
                                                </ModalBody>
                                                <ModalFooter>
                                                    <Button color="secondary" onClick={handleCancelar}>Cancelar</Button>
                                                    <Button color="danger" onClick={confirmEliminar}>Eliminar</Button>
                                                </ModalFooter>
                                            </Modal>

                                            <Modal isOpen={modalModificarSuper} toggle={toggleModificarSuper}>
                                                <ModalHeader toggle={toggleModificarSuper}>Modificar trabajador</ModalHeader>
                                                <ModalBody>
                                                <FormGroup>
                                                    <Label for="nombreCompleto">Nombre Completo</Label>
                                                    <Input
                                                    type="text"
                                                    id="nombreCompleto"
                                                    value={nombreCompleto}
                                                    onChange={(e) => setNombreCompleto(e.target.value)}
                                                    />
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="direccionResidencia">Dirección</Label>
                                                    <Input
                                                    type="text"
                                                    id="direccionResidencia"
                                                    value={direccionResidencia}
                                                    onChange={(e) => setDireccionResidencia(e.target.value)}
                                                    />
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="telefono">Teléfono</Label>
                                                    <Input
                                                    type="text"
                                                    id="telefono"
                                                    value={telefono}
                                                    onChange={(e) => setTelefono(e.target.value)}
                                                    />
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="correo">Correo</Label>
                                                    <Input
                                                    type="email"
                                                    id="correo"
                                                    value={correo}
                                                    onChange={(e) => setCorreo(e.target.value)}
                                                    />
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="contraseña">Contraseña</Label>
                                                    <Input
                                                    type="password"
                                                    id="contraseña"
                                                    value={contraseña}
                                                    onChange={(e) => setContraseña(e.target.value)}
                                                    />
                                                </FormGroup>
                                                <FormGroup>
                                                    <Label for="especialidad">Especialidad</Label>
                                                    <Input
                                                    type="text"
                                                    id="especialidad"
                                                    value={especialidad}
                                                    onChange={(e) => setEspecialidad(e.target.value)}
                                                    />
                                                </FormGroup>
                                                <FormGroup>
                                                <Label for="turnoTrabajador">Seleccione Turno</Label>
                                                <div>
                                                    <Label>
                                                        <Input
                                                            type="radio"
                                                            name="emp_turno"
                                                            value="Día"
                                                            checked={turno === "Día"}
                                                            onChange={(e) => setEmpTurno(e.target.value)}
                                                        />
                                                        Día
                                                    </Label>
                                                    <Label>
                                                        <Input
                                                            type="radio"
                                                            name="emp_turno"
                                                            value="Noche"
                                                            checked={turno === "Noche"}
                                                            onChange={(e) => setEmpTurno(e.target.value)} // Maneja el cambio
                                                        />
                                                        Noche
                                                    </Label>
                                                </div>
                                            </FormGroup>
                                                </ModalBody>
                                                <ModalFooter>
                                                <Button color="secondary" onClick={handleCancelar}>Cancelar</Button>
                                                <Button color="primary" onClick={handleGuardarCambios}>Guardar cambios</Button>
                                                </ModalFooter>
                                            </Modal>

                                    </Col>
                                </Row>
                            </TabPane>
                            <TabPane tabId="3">
                                <Row>
                                    <Col sm="12">
                                        <div className="text-center">
                                            <br />
                                            <h4>Cantidad de ART existentes por Actividades</h4>
                                            <br />
                                        </div>
                                        <div style={{ width: '100%', height: 555, minHeight: '100px' }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={dataArt}>
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
                            <TabPane tabId="4">
                                <div className="text-center">
                                    <br />
                                    <h4>Cantidad de ART existentes por Trabajador</h4>
                                    <br />
                                </div>
                                <Col sm="12">
                                    <Row className='filtroGrafAd'>
                                        <Col sm="4">
                                            <Label for="filtrarRut" className='tituloFiltrarRut'> Ingrese Rut del trabajador: </Label>
                                        </Col>
                                        <Col sm="6">
                                            <div>
                                                <Input
                                                    id='filtrarRut'
                                                    value={empRut}
                                                    onChange={handleRutChange}
                                                    placeholder="Ingrese el rut"
                                                />
                                            </div>
                                        </Col>
                                        <Col sm="2">
                                            <div>
                                                <Button onClick={fetchData}>Filtrar</Button>
                                            </div>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col>
                                    <Row>
                                        <Col sm="6">
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                {/* Gráfico a la izquierda */}
                                                <div>
                                                    <PieChart width={400} height={515}>
                                                        <Pie
                                                            data={data}
                                                            cx={200}
                                                            cy={200}
                                                            outerRadius={150}
                                                            fill="#8884d8"
                                                            dataKey="value"
                                                            labelLine={false}
                                                            label={renderCustomizedLabel}
                                                        >
                                                            {data.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip formatter={(value) => `${((value / totalValue) * 100).toFixed(2)}%`} />
                                                    </PieChart>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col sm="6">
                                            {/* Información a la derecha */}
                                            <div style={{ marginLeft: '20px', marginTop: '100px' }}>
                                                <h3>Información del gráfico</h3>
                                                <ul>
                                                    {data.map((entry, index) => (
                                                        <li key={`item-${index}`} style={{ color: COLORS[index % COLORS.length] }}>
                                                            {entry.name}: {entry.value} ({((entry.value / totalValue) * 100).toFixed(2)}%)
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </Col>
                                    </Row>
                                </Col>
                            </TabPane>
                            <TabPane tabId="5">
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
                            </TabPane>
                        </TabContent>
                    </div>
                </Col>
            </Col>
        </Row>
    </Container>
    );
}