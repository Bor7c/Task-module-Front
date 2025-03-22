import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './redux/store';  // Импортируем store
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Provider store={store}>  {/* Подключаем Redux Store */}
      <App />
    </Provider>
  </React.StrictMode>
);

// Если вы хотите измерять производительность, передайте функцию
// для логирования результатов (например: reportWebVitals(console.log))
// или отправьте на аналитический endpoint. Узнайте больше: https://bit.ly/CRA-vitals
reportWebVitals();
