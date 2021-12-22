import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { Link, useLocation } from 'react-router-dom';
import React, { useContext, useEffect, useState } from 'react';
import {
  Container, Navbar, Nav, Dropdown, NavLink, NavItem,
} from 'react-bootstrap';
import AuthContext from '../../store/auth-context';

type Props = {
  user: IUser | null;
};

interface NavbarItem {
  label: string;
  path?: string;
  onClick?: () => void;
  isVisible?: boolean;
}

const AppNavbar: React.FC<Props> = ({ user }) => {
  const authContext = useContext(AuthContext);
  const [currentUrl, setCurrentUrl] = useState();
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();

  // User navigation items
  const userNavItems: NavbarItem[] = [
    {
      label: 'Kirjaudu sisään',
      path: '/login',
      isVisible: user === null,
    },
    {
      label: 'Rekisteröidy',
      path: '/register',
      isVisible: user === null,
    },
    {
      label: 'Kirjaudu ulos',
      onClick: authContext?.onLogout,
      isVisible: authContext?.isLoggedIn && user !== null,
    },
  ].filter((item) => item.isVisible);

  // Update current url and collapse navbar when location changes
  useEffect(() => {
    setCurrentUrl(location.pathname);
    setExpanded(false);
  }, [location]);

  const handleOnToggle = (toggled: boolean) => {
    setExpanded(toggled);
  };

  return (
    <Navbar sticky="top" expand="md" expanded={expanded} onToggle={handleOnToggle}>
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="me-auto me-md-2">Ostoslista++</Navbar.Brand>

        {/* Navbar toggler on mobile */}
        <Navbar.Toggle>
          <FontAwesomeIcon icon={expanded ? faTimes : faBars} />
        </Navbar.Toggle>

        <Navbar.Collapse>
          <Nav className="flex-fill" activeKey={currentUrl}>
            {/* Visible on all devices */}
            {authContext?.isLoggedIn && (
            <>
              <Nav.Item>
                <Nav.Link as={Link} to="/lists" eventKey="/lists">Ostoslistat</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as={Link} to="/templates" eventKey="/templates">Listapohjat</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as={Link} to="/newlist" eventKey="/newlist">
                  Uusi lista
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as={Link} to="/history" eventKey="/history">Ostoshistoria</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link as={Link} to="/shoppingmode" eventKey="/shoppingmode">
                  Ostosten tila
                </Nav.Link>
              </Nav.Item>
            </>
            )}

            {/* Visible in mobile only */}
            {userNavItems.map((item) => (
              <Nav.Item key={item.label}>
                <Nav.Link
                  as={item.path ? Link : undefined}
                  to={item.path}
                  eventKey={item.path}
                  onClick={item.onClick}
                  className="d-md-none"
                >
                  {item.label}
                </Nav.Link>
              </Nav.Item>
            ))}

            {/* User dropdown for desktop */}
            <Nav.Item className="d-none ms-md-auto d-md-flex align-items-center">
              <Dropdown as={NavItem} align="end">
                <Dropdown.Toggle as={NavLink} className="hide-caret p-1">
                  <FontAwesomeIcon icon={faUserCircle} size="lg" />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {authContext?.isLoggedIn && (
                  <>
                    <Dropdown.ItemText>
                      Hei,
                      {' '}
                      {authContext?.user?.username}
                      !
                    </Dropdown.ItemText>
                    <Dropdown.Divider />
                  </>
                  )}
                  {userNavItems.map((item) => (
                    <Dropdown.Item
                      as={item.path ? Link : undefined}
                      to={item.path}
                      eventKey={item.path}
                      key={item.label}
                      onClick={item.onClick}
                    >
                      {item.label}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </Nav.Item>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
