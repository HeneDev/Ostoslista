import React from 'react';
import { Button, FloatingLabel, Form } from 'react-bootstrap';
import useFullHeightLayout from '../../hooks/useBodyClass';
import './login.scss';

interface Props {
  email: string;
  password: string;
  onChangeEmail: React.ChangeEventHandler<HTMLInputElement>;
  onChangePassword: React.ChangeEventHandler<HTMLInputElement>;
  handleLogin: (event: React.FormEvent<HTMLFormElement>) => void;
}

const LoginForm: React.FC<Props> = ({
  email,
  password,
  onChangeEmail,
  onChangePassword,
  handleLogin,
}) => {
  useFullHeightLayout();
  return (
    <div className="content-container-sm">
      <h1 className="h3 mb-3 text-center">Kirjaudu sisään</h1>
      <Form noValidate className="form-login" onSubmit={handleLogin}>
        <FloatingLabel label="Sähköpostiosoite">
          <Form.Control
            type="email"
            id="emailInput"
            placeholder="Sähköpostiosoite"
            value={email}
            onChange={onChangeEmail}
            required
          />
        </FloatingLabel>
        <FloatingLabel label="Salasana">
          <Form.Control
            type="password"
            id="passwordInput"
            placeholder="Salasana"
            value={password}
            onChange={onChangePassword}
            required
          />
        </FloatingLabel>
        <Button variant="primary" className="w-100 mt-3" type="submit">Kirjaudu sisään</Button>
      </Form>
    </div>
  );
};

export default LoginForm;
