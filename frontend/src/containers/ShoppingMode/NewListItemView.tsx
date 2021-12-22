import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import {
  Button, Col, Form, Row,
} from 'react-bootstrap';

interface Props {
  name: string
  amount: number | undefined,
  unit: string | undefined,
  onNameChange: (name: string) => void,
  onAmountChange: (amount: number | undefined) => void,
  onUnitChange: (unit: string | undefined) => void,
  onItemAdded: () => void,
  onItemRemoved: () => void
}

const NewListItemView: React.FC<Props> = ({
  name,
  amount,
  unit,
  onNameChange,
  onAmountChange,
  onUnitChange,
  onItemAdded,
  onItemRemoved,
}) => (
  <Row className="mb-2 gx-3">
    <Col xs={4}>
      <Form.Control
        value={name}
        placeholder="Tuotteen nimi"
        onChange={(event) => onNameChange(event.target.value)}
      />
    </Col>
    <Col xs={3}>
      <Form.Control
        type="number"
        placeholder="Määrä"
        value={amount ?? ''}
        onChange={(event) => {
          const { value } = event.target;
          // Empty field -> empty value
          onAmountChange(value === '' ? undefined : +value);
        }}
      />
    </Col>
    <Col xs={3}>
      <Form.Control
        as="select"
        value={unit ?? ''}
        onChange={(event) => onUnitChange(event.target.value)}
      >
        <option value="" hidden disabled>-</option>
        <option value="litra">litra</option>
        <option value="pussi">pussi</option>
        <option value="kg">kg</option>
        <option value="kpl">kpl</option>
        <option value="purkki">purkki</option>
        <option value="tölkki">tölkki</option>
      </Form.Control>
    </Col>
    <Col className="d-flex align-items-center justify-content-end">
      <Button className="me-2" variant="link" size="sm" onClick={onItemAdded}>
        <FontAwesomeIcon icon={faPlus} />
      </Button>
      <Button variant="link" size="sm" onClick={onItemRemoved}>
        <FontAwesomeIcon icon={faTrashAlt} />
      </Button>
    </Col>
  </Row>
);

export default NewListItemView;
