import React from 'react';
import { Button, FloatingLabel, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import useFullHeightLayout from '../../hooks/useBodyClass';

type Props = {
  registerUser: (event: React.FormEvent<HTMLFormElement>) => void;
  registrationSuccess: boolean;
  email: string;
  password: string;
  username: string;
  onChangeEmail: React.ChangeEventHandler<HTMLInputElement>;
  onChangePassword: React.ChangeEventHandler<HTMLInputElement>;
  onChangeUsername: React.ChangeEventHandler<HTMLInputElement>;
};

const RegistrationForm: React.FC<Props> = ({
  registerUser,
  registrationSuccess,
  username,
  password,
  email,
  onChangeEmail,
  onChangePassword,
  onChangeUsername,
}) => {
  useFullHeightLayout();

  if (registrationSuccess) {
    return (
      <p className="text-center">
        Rekisteröityminen onnistui. Ole hyvä ja
        {' '}
        <Link to="/login">kirjaudu sisään</Link>
        {' '}
        jatkaaksesi
      </p>
    );
  }

  return (
    <div className="content-container-sm">
      <h1 className="h3 mb-3 text-center">Luo käyttäjä</h1>
      <Form onSubmit={registerUser}>
        <FloatingLabel className="mb-3" label="Käyttäjänimi">
          <Form.Control
            type="text"
            placeholder="Käyttäjänimi"
            value={username}
            onChange={onChangeUsername}
            required
          />
        </FloatingLabel>
        <FloatingLabel className="mb-3" label="Sähköpostiosoite">
          <Form.Control
            type="email"
            placeholder="Sähköpostiosoite"
            value={email}
            onChange={onChangeEmail}
            required
          />
        </FloatingLabel>
        <FloatingLabel className="mb-3" label="Salasana">
          <Form.Control
            type="password"
            placeholder="Salasana"
            value={password}
            onChange={onChangePassword}
            required
          />
          <Form.Text muted>
            Salasanan pitää olla vähintään kuusi (6) merkkiä pitkä.
          </Form.Text>
        </FloatingLabel>
        <Button variant="primary" className="w-100 mt-3" type="submit">Rekisteröidy</Button>
      </Form>
    </div>
  );
};

export default RegistrationForm;
