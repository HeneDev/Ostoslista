import React, {
  useContext, useEffect, useCallback, useState,
} from 'react';
import {
  Button, Col, Form, ListGroup, ListGroupItem, Row,
} from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import listsService from '../../services/lists';
import listItemsService from '../../services/listItems';
import AuthContext from '../../store/auth-context';
import ConfirmView from './ConfirmView';
import NewListItemView from './NewListItemView';
import ShoppingListItem from '../../components/ShoppingList/ShoppingListItem';

type Props = {
  listId: number | null
  setListId: (id: number | null) => void,
  redirect: string | null,
  requestRedirect: (path: string) => void
};

const EMPTYLISTITEM = {
  name: '',
  amount: undefined,
  unit: undefined,
};

const ShoppingMode: React.FC<Props> = ({
  listId, setListId, redirect, requestRedirect,
}) => {
  const authContext = useContext(AuthContext);
  const [list, setList] = useState<IList | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newListItem, setNewListItem] = useState<any>(EMPTYLISTITEM);
  const [editingListItem, setEditingListItem] = useState<boolean>(false);

  const fetchList = useCallback(async () => {
    if (listId !== null) {
      const response = await listsService.getListViaId(authContext?.id!, listId);
      if (response) {
        setList(response);
      }
    }
  },
  [listId, authContext]);

  const toggleLocalItemState = (updates: IListItem, item: IListItem) => {
    const updatedListItems = [...list!.items];
    updatedListItems.map((oldItem) => {
      if (oldItem.id === item.id) {
        return updates;
      }
      return oldItem;
    });
    setList({ ...list, items: updatedListItems } as IList);
  };

  const toggleItemState = async (item: IListItem, selected: boolean) => {
    const updates = item;
    updates.state = selected ? 'selected' : 'none';
    toggleLocalItemState(updates, item);

    if (listId !== null) {
      await listItemsService.updateListItemViaId(authContext?.id!, listId, item.id, updates);
    }
  };

  const addNewItem = async () => {
    if (listId !== null) {
      const response = await listItemsService.sendNewListItem(authContext?.id!, listId, newListItem);
      if (response) {
        fetchList();
      }
    }
  };

  const exit = () => {
    setListId(null);
    requestRedirect('/lists');
  };

  const toggleEditingListItem = () => {
    setEditingListItem(!editingListItem);
  };

  const onNameChange = (name: string) => {
    setNewListItem({ ...newListItem, name });
  };

  const onAmountChange = (amount: number | undefined) => {
    setNewListItem({ ...newListItem, amount });
  };

  const onUnitChange = (unit: string | undefined) => {
    setNewListItem({ ...newListItem, unit });
  };

  const onItemAdded = async () => {
    await addNewItem();
    setNewListItem(EMPTYLISTITEM);
    toggleEditingListItem();
  };

  const onItemRemoved = () => {
    toggleEditingListItem();
  };

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const listItemEditing = (
    <ListGroup.Item>

      {editingListItem ? (
        <NewListItemView
          name={newListItem.name}
          amount={newListItem.amount}
          unit={newListItem.unit}
          onNameChange={onNameChange}
          onAmountChange={onAmountChange}
          onUnitChange={onUnitChange}
          onItemAdded={onItemAdded}
          onItemRemoved={onItemRemoved}
        />
      )
        : (
          <Button variant="link" className="text-decoration-none" onClick={toggleEditingListItem}>
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            Lisää tuote...
          </Button>
        )}
    </ListGroup.Item>
  );

  const shoppingListEdit = (
    <>
      <Row>
        <Col>
          <h1 className="h3 mb-2">{list?.name}</h1>
          <p className="text-muted mb-4">{list?.description}</p>
        </Col>
      </Row>
      <Row>
        <ListGroup className="shopping-mode-items list-group-flush">
          {list?.items?.map((item) => (
            <ListGroupItem className="py-3 py-md-2" key={item.id}>
              <Form.Check type="checkbox" id={`list-item-${item.id}`}>
                <Form.Check.Input
                  type="checkbox"
                  checked={item.state === 'selected'}
                  className="me-2"
                  onChange={(e) => toggleItemState(item, e.target.checked)}
                />
                <Form.Check.Label>
                  <ShoppingListItem item={item} showState={false} />
                </Form.Check.Label>
              </Form.Check>
            </ListGroupItem>
          ))}
          {listItemEditing}
        </ListGroup>
      </Row>
      <Row>
        <Col className="d-flex justify-content-end">
          <Button variant="secondary" onClick={exit}>Sulje</Button>
          <Button className="ms-2" onClick={() => { setShowModal(true); }}>Valmis</Button>
        </Col>
      </Row>
    </>
  );

  return (
    <>
      {redirect !== null ? <Redirect to={`${redirect}`} /> : null}
      <div className="content-container-md">
        {listId !== null ? shoppingListEdit : null}
      </div>
      <ConfirmView
        list={list!}
        show={showModal}
        setShow={setShowModal}
        listFinished={exit}
      />
    </>
  );
};

export default ShoppingMode;
