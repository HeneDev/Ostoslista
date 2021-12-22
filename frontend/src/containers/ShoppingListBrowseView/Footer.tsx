import React, { useContext } from 'react';
import { Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import listsService from '../../services/lists';
import AuthContext from '../../store/auth-context';

interface Props {
  checkedLists: IList[],
  requestRedirect: (path: string) => void,
  requestSettingShoppingModeListId: (id: number | null) => void
}

const Footer: React.FC<Props> = ({
  checkedLists, requestRedirect, requestSettingShoppingModeListId,
}) => {
  const authContext = useContext(AuthContext);

  const toastOnClick = (newListId: number) => {
    requestSettingShoppingModeListId(newListId);
    requestRedirect('/shoppingmode');
  };

  const ToastWithRedirect = (newListId: number) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>Ostoslista luotu</div>
      <Button type="button" onClick={() => toastOnClick(newListId)}>Käytä</Button>
    </div>
  );

  const handleClick = async () => {
    const allItems = checkedLists.map(({ items }) => items).flat();
    // Remove temporary Ids
    const listItems = allItems
      .map(({ name, amount, unit }) => ({
        name, amount, unit,
      }));

    const newList: INewList = {
      name: 'Lista luotu listapohjista: ',
      description: `${checkedLists.map(({ name }) => name).join(', ').toUpperCase()}`,
      category: '',
      items: [],
    };

    const response = await listsService.sendNewList(authContext?.id!, {
      ...newList,
      items: listItems,
      isTemplate: false,
    });

    if (response.name === newList.name) {
      toast.info(ToastWithRedirect(response.id));
    }
  };

  return (
    <>
      <div className="footer">
        <Button onClick={handleClick}>Luo ostoslista valituista listapohjista</Button>
      </div>
    </>
  );
};
export default Footer;
