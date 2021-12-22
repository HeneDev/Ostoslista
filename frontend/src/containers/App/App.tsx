import React, {
  useState, useContext, useEffect,
} from 'react';
import {
  BrowserRouter as Router, Route, Switch, Redirect,
} from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
import LoginForm from '../../components/LoginForm/LoginForm';
import RegistrationForm from '../../components/RegistrationForm/RegistrationForm';
import Header from '../../components/Header/Header';
import NewShoppingListView from '../../components/NewShoppingListView/NewShoppingListView';
import ShoppingListBrowseView from '../ShoppingListBrowseView/ShoppingListBrowseView';
import authService from '../../services/authentication';
import AuthContext from '../../store/auth-context';
import HistoryView from '../History/HistoryView';
import 'react-toastify/dist/ReactToastify.css';
import ShoppingMode from '../ShoppingMode/ShoppingMode';

const App: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [registrationSuccess, setRegistrationSuccess] = useState<boolean>(false);
  const [redirect, setRedirect] = useState<string | null>(null);
  const [shoppingModeListId, setShoppingModeListId] = useState<number | null>(null);

  const authContext = useContext(AuthContext);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const loggedUser: IUser = await authService.login({
        email,
        username,
        password,
      });
      authContext?.onLogin(loggedUser);
      setEmail('');
      setPassword('');
    } catch (x) {
      toast.error('Sähköposti ja salasana eivät täsmää');
    }
  };

  const registerUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const newUser: IUser = await authService.registerUser({
        email,
        username,
        password,
      });
      console.log(`User ${newUser.username} registered successfully`);
      setRegistrationSuccess(true);
      setUsername('');
      setPassword('');
      setEmail('');
    } catch (x) {
      toast.error('Rekisteröinti epäonnistui');
    }
  };

  const requestRedirect = (path: string) => {
    setRedirect(path);
  };

  // Reset redirect after
  useEffect(() => {
    if (redirect !== null) {
      setRedirect(null);
    }
  }, [redirect, setRedirect]);

  const requestSettingShoppingModeListId = (id: number | null) => {
    setShoppingModeListId(id);
  };

  return (
    <>
      <ToastContainer position={toast.POSITION.TOP_CENTER} />
      <Router>
        <Header user={authContext!.user} />
        <Container className="py-3">
          <Switch>
            {/* Main page */}
            <Route exact path="/">
              {authContext?.isLoggedIn ? (<Redirect to="/lists" />) : (<Redirect to="/login" />)}
            </Route>

            {/* Login */}
            <Route path="/login">
              {!authContext?.isLoggedIn ? (
                <LoginForm
                  password={password}
                  email={email}
                  onChangeEmail={({ target }) => setEmail(target.value)}
                  onChangePassword={({ target }) => setPassword(target.value)}
                  handleLogin={handleLogin}
                />
              ) : (<Redirect to="/lists" />)}
            </Route>

            {/* Registration */}
            <Route path="/register">
              <RegistrationForm
                registerUser={registerUser}
                email={email}
                password={password}
                username={username}
                registrationSuccess={registrationSuccess}
                onChangeEmail={({ target }) => setEmail(target.value)}
                onChangePassword={({ target }) => setPassword(target.value)}
                onChangeUsername={({ target }) => setUsername(target.value)}
              />
            </Route>
          </Switch>
          {!authContext?.isLoggedIn ? (
            <Switch>
              {/* User is redirected to frontpage if not logged in and tries to access protected pages */}
              <Route path="*">
                <Redirect to="/login" />
              </Route>
            </Switch>
          ) : (
            <Switch>
              {/* New list */}
              <Route path="/newlist">
                <NewShoppingListView />
              </Route>

              {/* Templates */}
              <Route path="/templates">
                <ShoppingListBrowseView
                  templates
                  redirect={redirect}
                  requestRedirect={requestRedirect}
                  requestSettingShoppingModeListId={requestSettingShoppingModeListId}
                />
              </Route>

              {/* History */}
              <Route path="/history">
                <HistoryView />
              </Route>

              {/* Shopping mode */}
              <Route path="/shoppingmode">
                <ShoppingMode
                  listId={shoppingModeListId}
                  setListId={requestSettingShoppingModeListId}
                  redirect={redirect}
                  requestRedirect={requestRedirect}
                />
              </Route>

              {/* Lists */}
              <Route path="/lists">
                <ShoppingListBrowseView
                  templates={false}
                  redirect={redirect}
                  requestRedirect={requestRedirect}
                  requestSettingShoppingModeListId={requestSettingShoppingModeListId}
                />
              </Route>
            </Switch>
          )}
        </Container>
      </Router>
    </>
  );
};

export default App;
