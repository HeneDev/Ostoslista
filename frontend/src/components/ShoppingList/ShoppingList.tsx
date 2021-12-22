import {
  faCheckSquare,
  faPen, faPlay, faTrashAlt, faListAlt,
} from '@fortawesome/free-solid-svg-icons';
import { faSquare } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import {
  Button, Card, ListGroup, ListGroupItem, OverlayTrigger, ToggleButton, Tooltip,
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import ShoppingListItem from './ShoppingListItem';

interface Props {
  list: IList,
  showItemState: boolean,
  deleteList: (id: number) => Promise<void>,
  editList: (editList: IList) => void,
  handleListChecked: (listId: number, checked: boolean) => void
  requestRedirect: (path: string) => void,
  requestSettingShoppingModeListId: (id: number | null) => void
}

const ShoppingList: React.FC<Props> = ({
  list, deleteList, editList, requestRedirect,
  requestSettingShoppingModeListId, handleListChecked,
  showItemState,
}) => {
  const [checked, setChecked] = useState(false);
  const [toggleShowMore, setToggleShowMore] = useState(false);
  const LISTS_TO_SHOW = 4;
  const handleDeleteList = () => {
    if (window.confirm('Haluatko varmasti poistaa tämän listan?')) {
      deleteList(list.id);
      toast.info('Lista poistettu');
    }
  };

  const handleEditList = () => {
    editList(list);
  };

  const onChecked = () => {
    handleListChecked(list.id, checked);
    setChecked(!checked);
  };

  const handleUseList = () => {
    requestSettingShoppingModeListId(list.id);
    requestRedirect('/shoppingmode');
  };

  const handleShowMore = () => {
    setToggleShowMore(!toggleShowMore);
  };

  return (
    <Card className="shopping-list">
      <Card.Body>
        {/* Title */}
        <Card.Title>{list.name}</Card.Title>

        {/* Description */}
        <Card.Subtitle className="text-muted">{list.description}</Card.Subtitle>
      </Card.Body>

      {/* Items */}
      <ListGroup className="list-group-flush">
        {toggleShowMore ? list.items.map((item) => (
          <ListGroupItem key={item.id}>
            <ShoppingListItem item={item} showState={showItemState} />
          </ListGroupItem>
        )) : list.items.slice(0, LISTS_TO_SHOW).map((item) => (
          <ListGroupItem key={item.id}>
            <ShoppingListItem item={item} showState={showItemState} />
          </ListGroupItem>
        ))}
        {}
      </ListGroup>

      {/* Actions */}
      <Card.Footer>

        {/* Edit */}
        <OverlayTrigger
          placement="bottom"
          delay={250}
          trigger={['hover', 'focus']}
          overlay={(<Tooltip>Muokkaa</Tooltip>)}
        >
          <Button variant="link" className="me-2" onClick={handleEditList}>
            <FontAwesomeIcon fixedWidth icon={faPen} />
          </Button>
        </OverlayTrigger>

        {/* Select or use */}
        {list.isTemplate ? (
          <OverlayTrigger
            placement="bottom"
            delay={250}
            trigger={['hover', 'focus']}
            overlay={(<Tooltip>{checked ? 'Poista valinta' : 'Valitse'}</Tooltip>)}
          >
            <ToggleButton
              type="checkbox"
              value="1"
              variant="link"
              className="me-2"
              checked={checked}
              onClick={onChecked}
            >
              {checked ? (<FontAwesomeIcon fixedWidth icon={faCheckSquare} />) : (<FontAwesomeIcon fixedWidth icon={faSquare} />)}
            </ToggleButton>
          </OverlayTrigger>
        ) : (
          <OverlayTrigger
            placement="bottom"
            delay={250}
            trigger={['hover', 'focus']}
            overlay={(<Tooltip>Käytä</Tooltip>)}
          >
            <Button variant="link" className="me-2" onClick={handleUseList}>
              <FontAwesomeIcon fixedWidth icon={faPlay} />
            </Button>
          </OverlayTrigger>
        )}

        {/* Remove */}
        <OverlayTrigger
          placement="bottom"
          delay={250}
          trigger={['hover', 'focus']}
          overlay={(<Tooltip>Poista</Tooltip>)}
        >
          <Button variant="link" onClick={handleDeleteList}>
            <FontAwesomeIcon fixedWidth icon={faTrashAlt} />
          </Button>
        </OverlayTrigger>

        { list.items.length > LISTS_TO_SHOW && (
        <OverlayTrigger
          placement="bottom"
          delay={250}
          trigger={['hover', 'focus']}
          overlay={(<Tooltip>Näytä kaikki tuotteet</Tooltip>)}
        >
          <Button variant="link" onClick={handleShowMore}>
            <FontAwesomeIcon fixedWidth icon={faListAlt} />
          </Button>
        </OverlayTrigger>
        )}

      </Card.Footer>
    </Card>
  );
};

export default ShoppingList;
