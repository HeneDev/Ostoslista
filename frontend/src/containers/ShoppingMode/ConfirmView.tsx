import React, { useContext, useState } from 'react';
import {
  Row, Col, Button, Form, Modal, FloatingLabel,
} from 'react-bootstrap';
import listsService from '../../services/lists';
import AuthContext from '../../store/auth-context';

interface Props {
  list: IList;
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  listFinished: () => void;
}

const ConfirmView: React.FC<Props> = ({
  list, show, setShow, listFinished,
}) => {
  const authContext = useContext(AuthContext);
  const [templateToggled, setTemplateToggled] = useState<boolean>(false);
  const [listPrice, setListPrice] = useState<number | undefined>(undefined);

  const saveAsTemplate = async () => {
    const createdList = list;
    createdList.isTemplate = true;
    await listsService.sendNewList(authContext?.id!, createdList);
  };

  const updateList = async () => {
    const updates = list;
    updates.price = listPrice;
    updates.finished = true;
    await listsService.updateListViaId(authContext?.id!, list.id, updates);
  };

  const finish = async (event: any) => {
    event.preventDefault();

    if (templateToggled) {
      await saveAsTemplate();
    }
    await updateList();
    setShow(false);
    listFinished();
  };

  const listPriceChanged = (event: any) => {
    const { value } = event.target;
    // Empty field -> empty value
    setListPrice(value === '' ? undefined : +value);
  };

  const toggleChanged = () => {
    setTemplateToggled(!templateToggled);
  };

  return (
    <Modal show={show} onHide={() => setShow(false)}>
      <Form noValidate onSubmit={finish}>
        <Modal.Header closeButton>
          <Modal.Title>Tallenna lista</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col>
              <FloatingLabel className="mb-3" label="Ostosten kokonaishinta">
                <Form.Control
                  placeholder="Ostosten kokonaishinta"
                  type="number"
                  value={listPrice ?? ''}
                  onChange={listPriceChanged}
                />
              </FloatingLabel>

              <Form.Check
                checked={templateToggled}
                id="save-as-template"
                label="Tallenna ostoslista listapohjaksi"
                onChange={toggleChanged}
              />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="me-2"
            variant="secondary"
            onClick={() => setShow(false)}
          >
            Peruuta
          </Button>
          <Button type="submit">
            OK
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ConfirmView;
