import React, { useEffect, useState } from 'react';

import {
  Card, Col, ListGroup, ListGroupItem,
} from 'react-bootstrap';
import ShoppingListItem from '../../components/ShoppingList/ShoppingListItem';

interface Props {
  list: IList;
}

const HistoryList: React.FC<Props> = ({ list }) => {
  const [finished, setFinished] = useState<any>('');

  useEffect(() => {
    setFinished(list.finishedAt?.toLocaleString().slice(0, 10).split('-').reverse()
      .join('/'));
  }, [list, finished]);

  return (
    <Col>
      <Card className="shopping-list">
        <Card.Body>
          {/* Title */}
          <Card.Title>{list.name}</Card.Title>

          {/* Description */}
          <Card.Subtitle className="text-muted">{list.description}</Card.Subtitle>

          <Card.Text className="text-muted mt-3 d-flex justify-content-between">
            <span>{finished}</span>
            <span>{list.price ? `Hinta: ${list.price} €` : ''}</span>
          </Card.Text>
        </Card.Body>

        {/* Items */}
        <ListGroup className="list-group-flush">
          {list.items.map((item) => (
            <ListGroupItem key={item.id}>
              <ShoppingListItem item={item} showState />
            </ListGroupItem>
          ))}
        </ListGroup>
      </Card>
    </Col>
  );
};

export default HistoryList;
