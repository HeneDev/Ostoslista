import React, { useState } from 'react';
import {
  Row, Col, Button, Form, FloatingLabel, Modal,
} from 'react-bootstrap';

interface Props {
  list: IList;
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  editFinished: () => void;
  setListToEdit: React.Dispatch<React.SetStateAction<IList | null | undefined>>
  updateList: (id: number, list: IList) => void
}

export const DetailsModal: React.FC<Props> = ({
  list, show, setShow, editFinished, updateList, setListToEdit,
}) => {
  // True if form has been submitted
  const [submitted, setSubmitted] = useState(false);

  const validate = (event: any) => {
    setSubmitted(true);
    return event.currentTarget.checkValidity() as boolean;
  };

  const handleCancel = () => {
    setShow(false);
    setSubmitted(false);
    editFinished();
  };

  const save = async (event: any) => {
    event.preventDefault();

    if (!validate(event)) {
      return;
    }

    setShow(false);
    setSubmitted(false);
    updateList(list.id, list);
    setSubmitted(false);
    editFinished();
  };

  return (
    <Modal show={show} onHide={() => setShow(false)}>
      <Form noValidate validated={submitted} onSubmit={save}>
        <Modal.Header closeButton>
          <Modal.Title>Muokkaa ostoslistaa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="mb-2">
            <Col xs={12}>
              {/* Name */}
              <FloatingLabel className="mb-3" label="Listan nimi">
                <Form.Control
                  placeholder="Listan nimi"
                  value={list.name}
                  required
                  onChange={(event) => {
                    const {
                      value,
                    } = event.target;
                    setListToEdit({ ...list, name: value });
                  }}
                />
                <Form.Control.Feedback type="invalid">
                  Aseta listalle nimi
                </Form.Control.Feedback>
              </FloatingLabel>

              {/* Description */}
              <FloatingLabel className="mb-3" label="Listan kuvaus">
                <Form.Control
                  placeholder="Listan kuvaus"
                  value={list.description}
                  onChange={(event) => {
                    const {
                      value,
                    } = event.target;
                    setListToEdit({ ...list, description: value });
                  }}
                />
              </FloatingLabel>

              {/* Category */}
              <FloatingLabel className="mb-3" label="Listan kategoria">
                <Form.Control
                  as="select"
                  defaultValue={list.category}
                  required
                  onChange={(event) => {
                    const {
                      value,
                    } = event.target;
                    setListToEdit({ ...list, category: value });
                  }}
                >
                  <option value="Päivittäis">Päivittäis</option>
                  <option value="Muut">Muut</option>
                </Form.Control>
              </FloatingLabel>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="me-2"
            variant="secondary"
            onClick={handleCancel}
          >
            Peruuta
          </Button>
          <Button type="submit">
            Tallenna
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default DetailsModal;
