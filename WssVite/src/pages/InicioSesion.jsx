import React, { useState } from 'react';
import { Form, FormGroup, Label, Input, Button, FormFeedback, ListGroup, ListGroupItem, Container, Row, Col, Alert } from 'reactstrap'
import './InicioSesion.css'
import 'bootstrap/dist/css/bootstrap.min.css'

export function InicioSesion() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Rut:', rut);
        console.log('Password:', password);
    };
    return (
        <div className='formulario'>
            <Container className="align-items-center">
            <Row className="justify-content-center row">
                <Col md="6" >
                    <h2>Inicio de Sesión</h2>
                    {error && <Alert color="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <FormGroup>
                            <Label for="username">Rut</Label>
                            <Input
                                type="text"
                                name="username"
                                id="username"
                                placeholder="12345678-9"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="passwordInput">Contraseña</Label>
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                id="passwordInput"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </FormGroup>
                        <FormGroup check className="text-start my-3">
                            <Input
                                type="checkbox"
                                id="showPasswordCheck"
                                onChange={() => setShowPassword(!showPassword)}
                            />
                            <Label for="showPasswordCheck" check>
                                Mostrar contraseña
                            </Label>
                        </FormGroup>
                        <Button color="primary" type="submit" block>
                            Iniciar Sesión
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>           
        </div>
        );
}