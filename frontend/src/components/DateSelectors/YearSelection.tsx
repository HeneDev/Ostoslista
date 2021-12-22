import React from 'react';
import { Form } from 'react-bootstrap';

interface Props {
  handleChange(e: any): any;
  year: any;
}

const YearSelection: React.FC<Props> = ({ handleChange, year }) => {
  const yearDropDown = () => {
    const y = new Date().getFullYear();
    return (
      Array.from(new Array(5), (e, i) => <option key={i} value={y - i}>{y - i}</option>)
    );
  };

  return (
    <div>
      <Form.Label>Vuosi</Form.Label>
      <Form.Control as="select" value={year} onChange={(e) => handleChange(e.target.value)}>
        {yearDropDown()}
      </Form.Control>
    </div>
  );
};

export default YearSelection;
