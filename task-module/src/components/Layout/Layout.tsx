import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { checkUserSession, logoutUser } from '../../redux/authSlice';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { authAPI } from '../../api/auth';
import './Layout.css';
import { 
  FaUser, 
  FaBars, 
  FaTimes, 
  FaHome, 
  FaClipboardList, 
  FaCog,
  FaSignOutAlt 
} from 'react-icons/fa';

const Layout: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const profilePictureUrl = user?.profile_picture_url 
    ? `http://localhost:8000${user.profile_picture_url}`
    : null;

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(checkUserSession());
    }, 300000); 
    
    return () => clearInterval(interval);
  }, [dispatch]);
  
  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
    setAvatarError(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await authAPI.logout(); // удаляет сессии / куки на сервере
    } catch (err) {
      console.error('Ошибка выхода:', err);
      // даже если серверная ошибка — всё равно удалим локальные данные
    } finally {
      dispatch(logoutUser()); // очищает Redux
      window.location.reload(); // перезагружает страницу, сбрасывает состояние
    }
  };
  

  const handleProfileClick = () => {
    navigate('/user-profile');
    setUserMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="stm-layout">
      <header className="stm-header">
        <div className="stm-header-container">
          <div className="stm-header-left">
            <button 
              className="stm-menu-toggle" 
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
            
            <Link to="/" className="stm-logo">
              <span className="stm-logo-text">Simple Task Manager</span>
            </Link>
          </div>
          
          {isAuthenticated && (
            <div className="stm-header-right">
              <div className="stm-user">
                <button 
                  className="stm-user-button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-expanded={userMenuOpen}
                >
                  <div className="stm-avatar">
                    {profilePictureUrl && !avatarError ? (
                      <img 
                        src={profilePictureUrl} 
                        alt={`Аватар ${user?.username}`}
                        className="stm-avatar-image"
                        onError={() => setAvatarError(true)}
                      />
                    ) : (
                      <div className="stm-avatar-fallback">
                        {user?.username?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="stm-username">{user?.username}</span>
                </button>
                
                {userMenuOpen && (
                  <div className="stm-user-menu">
                    <button 
                      className="stm-user-menu-item" 
                      onClick={handleProfileClick}
                    >
                      <FaUser /> Профиль
                    </button>
                    <button 
                      className="stm-user-menu-item" 
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
      
      <div className="stm-body">
        {isAuthenticated && (
          <nav className={`stm-nav ${menuOpen ? 'stm-nav-open' : ''}`}>
            <div className="stm-nav-content">
              <div className="stm-nav-menu">
                <Link 
                  to="/" 
                  className={`stm-nav-item ${isActive('/') ? 'stm-nav-item-active' : ''}`}
                >
                  <FaHome className="stm-nav-icon" />
                  <span className="stm-nav-text">Главная</span>
                </Link>
                <Link 
                  to="/tasks" 
                  className={`stm-nav-item ${isActive('/tasks') ? 'stm-nav-item-active' : ''}`}
                >
                  <FaClipboardList className="stm-nav-icon" />
                  <span className="stm-nav-text">Задачи</span>
                </Link>
                <Link 
                  to="/settings" 
                  className={`stm-nav-item ${isActive('/settings') ? 'stm-nav-item-active' : ''}`}
                >
                  <FaCog className="stm-nav-icon" />
                  <span className="stm-nav-text">Настройки</span>
                </Link>
              </div>
            </div>
          </nav>
        )}
        
        <main className="stm-main">
          <Outlet />
        </main>
      </div>
      
      {menuOpen && (
        <div className="stm-overlay" onClick={() => setMenuOpen(false)} />
      )}
    </div>
  );
};

export default Layout;
