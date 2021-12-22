import axios from 'axios';

const baseUrl = `${process.env.REACT_APP_API_URL || ''}/lists`; // backendin alkuosa on määritelly package.json proxyssa, joten tähän riittää vain listojen kohde

// Update list item :id
const updateListItemViaId = async (userId: number, listId: number, itemId: number, itemUpdates: any) => {
  if (userId) {
    // /lists/:listId/items
    const response = await axios.put<any>(`${baseUrl}/${listId}/items/${itemId}`, itemUpdates, {
      headers: {
        'user-id': userId.toString(),
      },
    });
    return response.data;
  }
  throw new Error('No user id set!');
};

// New list
const sendNewListItem = async (userId: number, listId: number, item: any) => {
  if (userId) {
    const response = await axios.post<any>(`${baseUrl}/${listId}/items`, item, {
      headers: {
        'user-id': userId.toString(),
      },
    });
    return response.data;
  }
  const response = 'No user id set!';
  return response;
};

export default {
  updateListItemViaId, sendNewListItem,
};
