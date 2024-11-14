import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, FormGroup, Label, Input, Card, CardBody, Button } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// Componente para Preguntas Transversales
const PreguntasTransversales = ({ handleChange }) => {
    const preguntas = [
        "¿Conozco el estándar, procedimiento y/o instructivo del trabajo que ejecutaré?",
        "¿Cuento con las competencias y salud compatible para ejecutar el trabajo?",
        "¿Cuento con la autorización para ingresar al área a ejecutar el trabajo?",
        "¿Segregué y señalicé el área de trabajo con los elementos según diseño?",
        "¿Conozco el número de teléfono o frecuencia radial para dar aviso en caso de emergencia, según protocolo del área?",
        "¿Uso los EPP definidos para el trabajo y se encuentran en buenas condiciones?"
    ];

    return (
        <>
            <h2>Preguntas Transversales del Trabajador</h2>
            {preguntas.map((pregunta, index) => (
                <FormGroup key={index}>
                    <Label>{pregunta}</Label>
                    <div>
                        <Input type="radio" name={`pregunta${index + 1}`} value="si" onChange={handleChange} /> Sí
                        <Input type="radio" name={`pregunta${index + 1}`} value="no" className="ms-2" onChange={handleChange} /> No
                    </div>
                </FormGroup>
            ))}
        </>
    );
};

// Componente para Riesgo Crítico
const RiesgoCritico = ({ idx, formData, handleChange, handleRiesgoChange }) => (
    <Card className="mb-4">
        <CardBody>
            <h5>Riesgo Crítico {idx + 1}</h5>
            <FormGroup>
                <Label>Nombre del Riesgo</Label>
                <Input
                    type="text"
                    name={`riesgo${idx + 1}_nombre`}
                    placeholder="Nombre del Riesgo Crítico"
                    value={formData[`riesgo${idx + 1}_nombre`]}
                    onChange={handleChange}
                />
            </FormGroup>
            <FormGroup>
                <Label>Código del Riesgo</Label>
                <Input
                    type="text"
                    name={`riesgo${idx + 1}_codigo`}
                    placeholder="Código"
                    value={formData[`riesgo${idx + 1}_codigo`]}
                    onChange={handleChange}
                />
            </FormGroup>
            {[...Array(8)].map((_, questionIndex) => (
                <FormGroup key={questionIndex}>
                    <Label>N°{questionIndex + 1}</Label>
                    <div>
                        <Input
                            type="radio"
                            name={`riesgo${idx}_pregunta${questionIndex}`}
                            value="si"
                            onChange={() => handleRiesgoChange(questionIndex, idx, 'si')}
                        /> Sí
                        <Input
                            type="radio"
                            name={`riesgo${idx}_pregunta${questionIndex}`}
                            value="no"
                            className="ms-2"
                            onChange={() => handleRiesgoChange(questionIndex, idx, 'no')}
                        /> No
                    </div>
                </FormGroup>
            ))}
        </CardBody>
    </Card>
);

// Componente para Riesgos y Medidas de Control
const RiesgosMedidas = ({ riesgos }) => (
    <Row>
        {riesgos.map((riesgo, index) => (
            <Col md={6} key={index}>
                <Card className="mb-4">
                    <CardBody>
                        <Row>
                            <Col md={6}>
                                <h6>RIESGO</h6>
                                <p>{riesgo.nombre}</p>
                            </Col>
                            <Col md={6}>
                                <h6>MEDIDA DE CONTROL</h6>
                                <p>{riesgo.medida_control}</p>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </Col>
        ))}
    </Row>
);

export function FormularioART() {
    const [formData, setFormData] = useState({
        pregunta1: '', pregunta2: '', pregunta3: '', pregunta4: '', pregunta5: '', pregunta6: '',
        riesgo1_nombre: '', riesgo1_codigo: '', riesgo1_respuestas: Array(8).fill(''),
        riesgo2_nombre: '', riesgo2_codigo: '', riesgo2_respuestas: Array(8).fill('')
    });
    const [riesgos, setRiesgos] = useState([]);

    useEffect(() => {
        const fetchRiesgos = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/riesgos/');
                setRiesgos(response.data);
            } catch (error) {
                console.error('Error al cargar los riesgos:', error);
            }
        };
        fetchRiesgos();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleRiesgoChange = (index, riesgoIndex, value) => {
        const riesgoKey = `riesgo${riesgoIndex + 1}_respuestas`;
        const updatedRespuestas = [...formData[riesgoKey]];
        updatedRespuestas[index] = value;
        setFormData({ ...formData, [riesgoKey]: updatedRespuestas });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/api/formulario-art/', formData);
            console.log('Formulario enviado exitosamente:', response.data);
        } catch (error) {
            console.error('Error al enviar el formulario:', error);
        }
    };

    return (
        <Container>
            <h1>Formulario ART</h1>
            <Form onSubmit={handleSubmit}>
                <PreguntasTransversales handleChange={handleChange} />
                
                <h2>Riesgos Críticos</h2>
                <Row>
                    {[0, 1].map(idx => (
                        <Col md={6} key={idx}>
                            <RiesgoCritico
                                idx={idx}
                                formData={formData}
                                handleChange={handleChange}
                                handleRiesgoChange={handleRiesgoChange}
                            />
                        </Col>
                    ))}
                </Row>

                <h2>Riesgos y Medidas de Control</h2>
                <RiesgosMedidas riesgos={riesgos} />

                <Button type="submit" color="primary" className="mt-3">Enviar Formulario</Button>
            </Form>
        </Container>
    );
}
