import { Link, useNavigate } from 'react-router-dom';
import { FiLogOut, FiPlusCircle, FiSearch, FiLayers } from 'react-icons/fi';
import './Navbar.css';

const Navbar = ({ user, logout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar glass">
      <div className="nav-brand">
        <FiLayers className="brand-icon" />
        <span>Lost & Found</span>
      </div>
      <div className="nav-links">
        {user ? (
          <>
            <span className="welcome-text">Welcome, {user.name}</span>
            <button onClick={handleLogout} className="logout-btn">
              <FiLogOut /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link btn-primary">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
