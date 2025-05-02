import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { checkUserSession, logoutUser } from '../../redux/authSlice';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../api/auth';
import './Layout.css'; // Обновленное название CSS файла
import { 
  FaUser, 
  FaBars, 
  FaTimes, 
  FaHome, 
  FaClipboardList, 
  FaCog,
  FaSignOutAlt 
} from 'react-icons/fa';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  useEffect(() => {
    dispatch(checkUserSession());
    
    const interval = setInterval(() => {
      dispatch(checkUserSession());
    }, 300000); // Проверка сессии каждые 5 минут
    
    return () => clearInterval(interval);
  }, [dispatch]);
  
  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      dispatch(logoutUser());
      navigate('/login');
    } catch (err) {
      console.error('Ошибка выхода:', err);
    }
  };

  const handleProfileClick = () => {
    navigate('/user-profile'); // Обновлено на /user-profile
    setUserMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="tm-layout">
      <header className="tm-header">
        <div className="tm-header-container">
          <div className="tm-header-left">
            <button 
              className="tm-menu-toggle" 
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
            
            <Link to="/" className="tm-logo">
              <span className="tm-logo-text">Simple Task Manager</span>
            </Link>
          </div>
          
          {isAuthenticated && (
            <div className="tm-header-right">
              <div className="tm-user">
                <button 
                  className="tm-user-button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="tm-avatar">
                    {user?.profile_picture_url ? (
                      <img src={user.profile_picture_url} alt="Avatar" className="tm-avatar-image" />
                    ) : (
                      user?.username?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="tm-username">{user?.username}</span>
                </button>
                
                {userMenuOpen && (
                  <div className="tm-user-menu">
                    <button 
                      className="tm-user-menu-item" 
                      onClick={handleProfileClick}
                    >
                      <FaUser /> Профиль
                    </button>
                    <button 
                      className="tm-user-menu-item" 
                      onClick={handleLogout}
                    >
                      <FaSignOutAlt /> Выйти
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
      
      <div className="tm-body">
        {isAuthenticated && (
          <nav className={`tm-nav ${menuOpen ? 'tm-nav-open' : ''}`}>
            <div className="tm-nav-content">
              <div className="tm-nav-menu">
                <Link 
                  to="/" 
                  className={`tm-nav-item ${isActive('/') ? 'tm-nav-item-active' : ''}`}
                >
                  <FaHome className="tm-nav-icon" />
                  <span className="tm-nav-text">Главная</span>
                </Link>
                <Link 
                  to="/tasks" 
                  className={`tm-nav-item ${isActive('/tasks') ? 'tm-nav-item-active' : ''}`}
                >
                  <FaClipboardList className="tm-nav-icon" />
                  <span className="tm-nav-text">Задачи</span>
                </Link>
                {/* <Link 
                  to="/user-profile" // Обновлено на /user-profile
                  className={`tm-nav-item ${isActive('/user-profile') ? 'tm-nav-item-active' : ''}`}
                >
                  <FaUser className="tm-nav-icon" />
                  <span className="tm-nav-text">Профиль</span>
                </Link> */}
                <Link 
                  to="/settings" 
                  className={`tm-nav-item ${isActive('/settings') ? 'tm-nav-item-active' : ''}`}
                >
                  <FaCog className="tm-nav-icon" />
                  <span className="tm-nav-text">Настройки</span>
                </Link>
              </div>
            </div>
          </nav>
        )}
        
        <main className="tm-main">
          {children}
        </main>
      </div>
      
      {menuOpen && (
        <div className="tm-overlay" onClick={() => setMenuOpen(false)} />
      )}
    </div>
  );
};

export default Layout;
