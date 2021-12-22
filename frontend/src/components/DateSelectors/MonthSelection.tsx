import React from 'react';
import { Form } from 'react-bootstrap';

interface Props {
  handleChange(e: any): any;
  month: any;
}

const MonthSelection: React.FC<Props> = ({ handleChange, month }) => {
  const monthDropDown = () => {
    const m = 1;
    return (
      Array.from(new Array(12), (e, i) => <option key={i} value={m + i}>{m + i}</option>)
    );
  };

  return (
    <div>
      <Form.Label>Kuukausi</Form.Label>
      <Form.Control as="select" value={month} onChange={(e) => handleChange(e.target.value)}>
        {monthDropDown()}
      </Form.Control>
    </div>
  );
};

export default MonthSelection;
