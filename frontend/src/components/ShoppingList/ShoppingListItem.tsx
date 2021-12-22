import React from 'react';

interface Props {
  item: IListItem,
  showState: boolean,
}

const ShoppingListItem: React.FC<Props> = ({ item, showState }) => {
  const showUnitAndAmount = !!item.unit && !!item.amount;
  const isSelected = showState && item.state === 'selected';
  return (
    <span className={isSelected ? 'text-decoration-line-through' : undefined}>
      {item.name}
      {showUnitAndAmount ? ` (${item.amount} ${item.unit})` : ''}
    </span>
  );
};

export default ShoppingListItem;
