import React from 'react';
import TaskList from '../../components/TaskList/TaskList';
import './HomePage.css';

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <TaskList />
    </div>
  );
};

export default HomePage;