import React, { useState } from 'react';
import EditListItemView from './EditListItemView';

interface Props {
  item: INewListItem;
  onItemRemoved: () => void;
  onItemChanged: (item: INewListItem) => void;
}

const EditListItem: React.FC<Props> = ({ item, onItemChanged, onItemRemoved }) => {
  const [id] = useState(item.id);
  const [name, setName] = useState(item.name);
  const [amount, setAmount] = useState<number | undefined>(item.amount);
  const [unit, setUnit] = useState<string | undefined>(item.unit);

  const onNameChange = (nameNew: string) => {
    setName(nameNew);
    onItemChanged({
      id, name: nameNew, amount, unit,
    });
  };

  const onAmountChange = (amountNew: number | undefined) => {
    setAmount(amountNew);
    onItemChanged({
      id, name, amount: amountNew, unit,
    });
  };

  const onUnitChange = (unitNew: string | undefined) => {
    setUnit(unitNew);
    onItemChanged({
      id, name, amount, unit: unitNew,
    });
  };

  return (
    <EditListItemView
      name={name}
      amount={amount}
      unit={unit}
      onNameChange={onNameChange}
      onAmountChange={onAmountChange}
      onUnitChange={onUnitChange}
      onItemRemoved={onItemRemoved}
    />
  );
};

export default EditListItem;
