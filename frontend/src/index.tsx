import React from 'react';
import ReactDOM from 'react-dom';
import './scss/app.scss';
import App from './containers/App/App';
import { AuthContextProvider } from './store/auth-context';

ReactDOM.render(
  <AuthContextProvider>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </AuthContextProvider>,
  document.getElementById('root'),
);
