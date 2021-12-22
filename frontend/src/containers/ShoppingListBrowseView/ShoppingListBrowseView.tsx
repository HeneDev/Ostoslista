import React, {
  useState, useEffect, useCallback, useContext,
} from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import ShoppingList from '../../components/ShoppingList/ShoppingList';
import DetailsModal from './DetailsView';
import listsService from '../../services/lists';
import AppPagination from '../../components/Pagination/Pagination';
import Footer from './Footer';
import AuthContext from '../../store/auth-context';

type Props = {
  redirect: string | null,
  requestRedirect: (path: string) => void,
  requestSettingShoppingModeListId: (id: number | null) => void
  // Dictates if component shows templates or normal lists
  templates: boolean;
};

const ShoppingListBrowseViewNew: React.FC<Props> = ({
  redirect,
  requestRedirect,
  requestSettingShoppingModeListId,
  templates,
}) => {
  const [listToEdit, setListToEdit] = useState<IList | null>();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredList, setFilteredList] = useState<IList[]>([]);

  // Lists
  const [lists, setLists] = useState<IList[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Checked lists
  const [checkedListIds, setCheckedListIds] = useState<number[]>([]);

  // Pagination
  const [pageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [offset, setOffset] = useState<number>(0);

  // Edit modal
  const [showModal, setShowModal] = useState(false);

  const authContext = useContext(AuthContext);

  const userId = authContext?.id!;

  const fetchLists = async () => {
    const response = await listsService.getAll(userId, { limit: pageSize, offset, isTemplate: templates });
    if (response) {
      setLists(response.objects);
      setTotalCount(response.totalCount);
    }
  };

  const handleListChecked = (listId: number, checked: boolean) => {
    if (checked) {
      setCheckedListIds(checkedListIds.filter((id) => id !== listId));
    } else {
      setCheckedListIds([...checkedListIds, listId]);
    }
  };

  // Ensures that the function is only re-created when its dependencies change
  const memoizedFetch = useCallback(fetchLists, [offset, pageSize, userId, templates]);

  const updateList = async (id: number, listUpdates: any) => {
    const result = await listsService.updateListViaId(authContext?.id!, id, listUpdates);
    if (result) {
      await fetchLists();
    }
  };

  const deleteList = async (id: number) => {
    const result = await listsService.deleteListViaId(authContext?.id!, id);
    if (result) {
      await fetchLists();
    }
  };

  const handleEditList = (list: IList) => {
    setListToEdit(list);
    setShowModal(true);
  };

  const handleAllFilter = () => {
    setSearchQuery(''); // Näyttää kaikki tavarat
  };

  const handleDailyFilter = () => {
    setSearchQuery('Päivittäis');
  };

  const handleOtherFilter = () => {
    setSearchQuery('Muut');
  };

  useEffect(() => {
    const filteredData = lists.filter((list) => list.category?.toLowerCase().includes(searchQuery.toLowerCase()));
    setFilteredList(filteredData);
  }, [lists, searchQuery]);
  // Load lists on component mount or when dependencies of
  // memoizedFetch function changes
  useEffect(() => { memoizedFetch(); }, [memoizedFetch]);

  // Uncheck checkedLists if viewing lists
  useEffect(() => {
    if (!templates) {
      setCheckedListIds([]);
    }
  }, [templates, setCheckedListIds]);

  return (
    <>
      {redirect !== null ? <Redirect to={`${redirect}`} /> : null}
      <Row className="mb-4">
        <Col>
          <Button variant="outline-secondary" className="me-2" onClick={handleAllFilter} active={searchQuery === ''}>Kaikki</Button>
          <Button variant="outline-secondary" className="me-2" onClick={handleDailyFilter} active={searchQuery === 'Päivittäis'}>Päivittäistavarat</Button>
          <Button variant="outline-secondary" className="me-2" onClick={handleOtherFilter} active={searchQuery === 'Muut'}>Muut</Button>
        </Col>
      </Row>
      <Row className="row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4 mb-5">
        {filteredList.length === 0 ? <p className="text-center">Ei näytettäviä listoja</p>
          : filteredList.map((list) => (
            <Col key={list.id}>
              <ShoppingList
                list={list}
                showItemState={false}
                deleteList={deleteList}
                editList={handleEditList}
                handleListChecked={handleListChecked}
                requestRedirect={requestRedirect}
                requestSettingShoppingModeListId={requestSettingShoppingModeListId}
              />
            </Col>
          ))}
      </Row>
      <Row>
        <Col>
          <AppPagination
            currentPage={page}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={({ page: _page, offset: _offset }) => {
              setPage(_page);
              setOffset(_offset);
            }}
          />
        </Col>
      </Row>

      {/* Edit modal */}
      {
        listToEdit ? (
          <DetailsModal
            list={listToEdit!}
            show={showModal}
            setShow={setShowModal}
            editFinished={() => {}}
            setListToEdit={setListToEdit}
            updateList={updateList}
          />
        ) : ''
      }

      {/* Sticky footer displayed when atleast one list is checked and templates is set to true */}
      {(checkedListIds.length > 0 && templates)
        ? (
          <Footer
            requestRedirect={requestRedirect}
            requestSettingShoppingModeListId={requestSettingShoppingModeListId}
            checkedLists={lists
              .filter((list) => checkedListIds.includes(list.id))
              .map((list) => list)}
          />
        )
        : null}
    </>
  );
};

export default ShoppingListBrowseViewNew;
