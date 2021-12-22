import React from 'react';
import Navbar from '../Navbar/Navbar';

type Props = {
  user: IUser | null;
};

const Header: React.FC<Props> = ({ user }) => (
  <Navbar user={user} />
);

export default Header;
