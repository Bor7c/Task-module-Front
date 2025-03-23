import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage';
import TaskDetail from './components/TaskDetail/TaskDetail';
import './App.css';

const App: React.FC = () => {
  return (
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tasks/:id" element={<TaskDetail />} />
      </Routes>
  );
};

export default App;