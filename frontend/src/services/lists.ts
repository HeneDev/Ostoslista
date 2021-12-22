import axios from 'axios';
import { toast } from 'react-toastify';

const baseUrl = `${process.env.REACT_APP_API_URL || ''}/lists`; // backendin alkuosa on määritelly package.json proxyssa, joten tähän riittää vain listojen kohde

interface ListApiParams {
  limit?: number;
  offset?: number;
  category?: string;
  isTemplate?: boolean;
  isFinished?: boolean;
  stringYearMonth?: string;
}

// Get all lists
const getAll = async (userId: number, params?: ListApiParams) => {
  if (userId) {
    const response = await axios.get<IApiResponse<IList>>(baseUrl, {
      params,
      headers: {
        'user-id': userId?.toString(),
      },
    });
    return response.data;
  }
  return Promise.reject();
};

// Get list :id
const getListViaId = async (userId: number, id: number) => {
  if (userId) {
    const response = await axios.get<IList>(`${baseUrl}/${id}`, {
      headers: {
        'user-id': userId?.toString(),
      },
    });
    return response.data;
  }
  toast.info('Tapahtui virhe');
  return Promise.reject();
};

// Delete list :id
const deleteListViaId = async (userId: number, id: number) => {
  if (userId) {
    const response = await axios.delete<any>(`${baseUrl}/${id}`, {
      headers: {
        'user-id': userId.toString(),
      },
    });
    return response.data;
  }
  toast.info('Tapahtui virhe');
  return Promise.reject();
};

// New list
const sendNewList = async (userId: number, list: any) => {
  if (userId) {
    const response = await axios.post<any>(baseUrl, list, {
      headers: {
        'user-id': userId.toString(),
      },
    });
    return response.data;
  }
  toast.info('Tapahtui virhe');
  return Promise.reject();
};

// Update list
const updateListViaId = async (userId: number, id: number, listUpdates: any) => {
  if (userId) {
    const response = await axios.put<any>(`${baseUrl}/${id}`, listUpdates, {
      headers: {
        'user-id': userId.toString(),
      },
    });
    return response.data;
  }
  toast.info('Tapahtui virhe');
  return Promise.reject();
};

export default {
  getAll, deleteListViaId, sendNewList, updateListViaId, getListViaId,
};
