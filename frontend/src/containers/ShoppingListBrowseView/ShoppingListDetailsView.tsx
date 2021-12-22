import React from 'react';
import {
  Row,
  Col,
  Container,
  Button,
  Form,
} from 'react-bootstrap';

export default function ShoppingListDetailsView(props: any) {
  const {
    lists,
    setLists,
    selectedListId,
    setSelectedListId,
    deleteList,
    updateList,
  } = props;

  const selectedList = lists.find((list: IList) => list.id === selectedListId);
  const selectedListName = selectedList.name;
  const selectedListDescription = selectedList.description;
  const listId = selectedList.id;

  let itemsOrderNumber = 0;
  const itemList = selectedList.items.map((item: IListItem) => {
    const {
      name,
      amount,
      unit,
      price,
      state,
    } = item;

    const rowItem = (
      <Row
        id={`selectedList-items-item-${itemsOrderNumber}`}
        key={`selectedList-items-item-${itemsOrderNumber}`}
      >
        <Col>
          {name || '-'}
        </Col>
        <Col>
          {amount || '-'}
        </Col>
        <Col>
          {unit || '-'}
        </Col>
        <Col>
          {price || '-'}
        </Col>
        <Col>
          {state || '-'}
        </Col>
      </Row>
    );

    itemsOrderNumber += 1;

    return rowItem;
  });

  return (
    <Container className="content-container-md">
      <h1 className="h3 mb-3 text-center">Listan tiedot</h1>
      <h2 className="h3 mb-3 text-center">
        <Form.Control
          className="flex-fill me-3"
          placeholder="Listan nimi"
          value={selectedListName}
          onChange={(event) => {
            const {
              value,
            } = event.target;

            const modifiedLists = lists.map((list: any) => {
              if (list.id === selectedListId) {
                const modifiedList = {
                  ...list,
                  name: value,
                };
                return modifiedList;
              }
              return list;
            });

            setLists(modifiedLists);
          }}
        />
      </h2>
      <Row className="mb-2">
        <Col>
          <Form.Control
            className="flex-fill me-3"
            placeholder="Listan nimi"
            value={selectedListDescription}
            onChange={(event) => {
              const {
                value,
              } = event.target;

              const modifiedLists = lists.map((list: any) => {
                if (list.id === selectedListId) {
                  const modifiedList = {
                    ...list,
                    description: value,
                  };
                  return modifiedList;
                }
                return list;
              });

              setLists(modifiedLists);
            }}
          />
        </Col>
        <Col>
          <Button
            onClick={() => {
              setSelectedListId(null);
            }}
          >
            Takaisin
          </Button>
        </Col>
        <Col>
          <Button
            onClick={() => {
              const sentList = {
                name: selectedListName,
                description: selectedListDescription,
              };
              updateList(selectedListId, sentList);
            }}
          >
            Tallenna muutokset
          </Button>
        </Col>
        <Col>
          <Button
            onClick={() => {
              deleteList(listId);
            }}
          >
            Poista lista
          </Button>
        </Col>
      </Row>
      <Row className="mb-2">
        {itemList}
      </Row>
    </Container>
  );
}
