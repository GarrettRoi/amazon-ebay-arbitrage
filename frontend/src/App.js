import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import { loadUser } from './actions/auth';
import setAuthToken from './utils/setAuthToken';

// Components
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/pages/Home';
import Products from './components/pages/Products';
import Orders from './components/pages/Orders';
import Inventory from './components/pages/Inventory';
import SystemStatus from './components/pages/SystemStatus';
import Settings from './components/pages/Settings';
import PrivateRoute from './components/routing/PrivateRoute';

// Material UI
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';

if (localStorage.token) {
  setAuthToken(localStorage.token);
}

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif'
    ].join(','),
  },
});

const App = () => {
  useEffect(() => {
    store.dispatch(loadUser());
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route exact path="/login" element={<Login />} />
            <Route exact path="/register" element={<Register />} />
            <Route path="/" element={
              <div className="app">
                <Navbar />
                <div className="container">
                  <Sidebar />
                  <main className="content">
                    <Container maxWidth="lg">
                      <Routes>
                        <Route exact path="/" element={<PrivateRoute component={Dashboard} />} />
                        <Route exact path="/products" element={<PrivateRoute component={Products} />} />
                        <Route exact path="/orders" element={<PrivateRoute component={Orders} />} />
                        <Route exact path="/inventory" element={<PrivateRoute component={Inventory} />} />
                        <Route exact path="/system" element={<PrivateRoute component={SystemStatus} />} />
                        <Route exact path="/settings" element={<PrivateRoute component={Settings} />} />
                        <Route path="*" element={<Navigate to="/" />} />
                      </Routes>
                    </Container>
                  </main>
                </div>
              </div>
            } />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
