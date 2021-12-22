import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import React, { useContext, useState } from 'react';
import {
  Button, Col, FloatingLabel, Form, Row,
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import listsService from '../../services/lists';
import AuthContext from '../../store/auth-context';
import EditListItem from './EditListItem';

export const NewShoppingListView: React.FC = () => {
  // True if form has been submitted
  const [submitted, setSubmitted] = useState(false);

  // Unique id for list items. Real id of the list item
  // is determined by API when list item is created.
  // This is only used to determine unique list items
  // when handling and looping them.
  const [uniqueListId, setUniqueListId] = useState(0);

  const [isTemplate, setIsTemplate] = useState(false);

  const [list, setList] = useState<INewList>({
    name: '',
    description: '',
    category: 'Päivittäis',
    items: [],
  });

  const authContext = useContext(AuthContext);

  const updateListItem = (item: INewListItem) => {
    // Find to be updated item's index
    const index = list.items.findIndex(({ id }) => id === item.id);

    // Copy original array of items
    const newItems = [...list.items];

    // Replace item with the new value
    newItems[index] = item;

    // Update list
    setList({ ...list, items: newItems });
  };

  const addEmptyItem = () => {
    // Copy original array of items
    const items = [...list.items];

    // Add new list item with unique id
    items.push({ id: uniqueListId, name: '' });

    // Update list
    setList({ ...list, items });

    // Increment unique list id
    setUniqueListId(uniqueListId + 1);
  };

  const removeItem = (itemId: number) => {
    setList({
      ...list,
      items: list.items.filter(({ id }) => id !== itemId),
    });
  };

  /**
   * Resets list properties back to initial state.
   */
  const reset = () => {
    setList({
      name: '',
      description: '',
      category: 'Päivittäis',
      items: [],
    });
    setSubmitted(false);
  };

  const validate = (event: any) => {
    setSubmitted(true);
    return event.currentTarget.checkValidity() as boolean;
  };

  const save = async (event: any) => {
    event.preventDefault();

    if (!validate(event)) {
      return;
    }

    const listItems = list.items
      // Remove items which don't have name
      .filter((item) => item.name.length > 0)
      // Remove items which have invalid amount (0 or smaller)
      .filter((item) => item.amount === undefined || item.amount >= 0)
      // Remove temporary id from item
      .map(({ name, amount, unit }) => ({
        name, amount, unit,
      }));

    await listsService.sendNewList(authContext?.id!, {
      ...list,
      items: listItems,
      isTemplate,
    });
    toast.info('Uusi lista luotu');

    reset();
  };

  const listInfoInput = (
    <Row className="mb-2">
      <Col xs={12}>

        {/* Name */}
        <FloatingLabel className="mb-3" label="Listan nimi">
          <Form.Control
            placeholder="Lisää listan nimi..."
            value={list.name}
            required
            onChange={(event) => {
              setList({
                ...list,
                name: event.target.value,
              });
            }}
          />
          <Form.Control.Feedback type="invalid">
            Aseta listalle nimi
          </Form.Control.Feedback>
        </FloatingLabel>

        {/* Description */}
        <FloatingLabel className="mb-3" label="Kuvaus">
          <Form.Control
            placeholder="Lisää listan kuvaus..."
            value={list.description}
            onChange={(event) => {
              setList({
                ...list,
                description: event.target.value,
              });
            }}
          />
        </FloatingLabel>

        {/* Category */}
        <FloatingLabel className="mb-3" label="Kategoria">
          <Form.Control
            as="select"
            defaultValue="Päivittäis"
            required
            onChange={(event) => {
              setList({
                ...list,
                category: event.target.value,
              });
            }}
          >
            <option value="Päivittäis">Päivittäis</option>
            <option value="Muut">Muut</option>
          </Form.Control>
        </FloatingLabel>
      </Col>
    </Row>
  );

  const editListItems = list.items.map((item) => (
    <EditListItem
      key={item.id}
      item={item}
      onItemRemoved={() => removeItem(item.id)}
      onItemChanged={updateListItem}
    />
  ));

  const addListButton = (
    <Row>
      <Col>
        <Button variant="link" className="text-decoration-none" onClick={addEmptyItem}>
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Lisää tuote...
        </Button>
      </Col>
    </Row>
  );

  return (
    <div className="content-container-md">
      <h1 className="h3 mb-3 text-center">Luo uusi ostoslista</h1>
      <Form noValidate validated={submitted} onSubmit={save}>
        {listInfoInput}

        <Form.Check
          checked={isTemplate}
          id="save-as-template"
          className="mb-3"
          label="Tallenna ostoslista listapohjaksi"
          onChange={() => setIsTemplate(!isTemplate)}
        />

        {editListItems}
        {addListButton}

        <Row className="mt-4">
          <Col xs={12} className="d-flex justify-content-end">
            <Button variant="primary" type="submit">
              Tallenna
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default NewShoppingListView;
