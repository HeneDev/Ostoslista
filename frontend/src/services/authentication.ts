import axios from 'axios';

const baseUrl = `${process.env.REACT_APP_API_URL || ''}/users`;

const registerUser = async (credentials: IUser) => {
  const response = await axios.post<IUser>(`${baseUrl}/register`, credentials);
  return response.data;
};

const login = async (credentials: IUser) => {
  const response = await axios.post<IUser>(`${baseUrl}/login`, credentials);
  return response.data;
};

export default { registerUser, login };
