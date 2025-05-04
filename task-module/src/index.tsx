import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Определяем, находимся ли мы в development-режиме
const isDevelopment = process.env.NODE_ENV === 'development';

const AppWrapper = (
  <BrowserRouter>
    <Provider store={store}>
      {isDevelopment ? <App /> : <React.StrictMode><App /></React.StrictMode>}
    </Provider>
  </BrowserRouter>
);

root.render(AppWrapper);
