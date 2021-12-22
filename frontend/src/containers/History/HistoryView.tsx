import React, {
  useState, useEffect, useContext,
} from 'react';
import { Col, Row } from 'react-bootstrap';

import listsService from '../../services/lists';
import AuthContext from '../../store/auth-context';
import HistoryList from './HistoryList';
import MonthSelection from '../../components/DateSelectors/MonthSelection';
import YearSelection from '../../components/DateSelectors/YearSelection';

interface Props {

}

const HistoryView: React.FC<Props> = () => {
  // Lists
  const [lists, setLists] = useState<IList[]>([]);
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');

  const authContext = useContext(AuthContext);

  // Set starting year and month to current month, only on first load
  useEffect(() => {
    setMonth((new Date().getMonth() + 1).toString());
    setYear(new Date().getFullYear().toString());
  }, []);

  // Fetch lists for selected month whenever user changes year or month
  useEffect(() => {
    const fetchLists = async () => {
      if (authContext) {
        const response = await listsService.getAll(authContext?.id!, { isFinished: true, stringYearMonth: `${year}-${month}` });
        if (response) {
          setLists(response.objects);
        }
      } else {
        throw new Error('No user id set!');
      }
    };

    fetchLists();
  }, [authContext, year, month]);

  return (
    <>
      <Row className="mb-5 mb-md-4">
        <Col sm={6} md={3} xl={2} className="mb-3 mb-md-0">
          <MonthSelection month={month} handleChange={(e: any) => setMonth(e)} />
        </Col>
        <Col sm={6} md={3} xl={2}>
          <YearSelection year={year} handleChange={(e: any) => setYear(e)} />
        </Col>
      </Row>
      <Row className="row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4 mb-5">
        {lists.map((list) => (
          <Col key={list.id}>
            <HistoryList list={list} />
          </Col>
        ))}
      </Row>
    </>
  );
};

export default HistoryView;
