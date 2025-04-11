import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { useAuth, USER_KEY } from './context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

function App() {
  const [count, setCount] = useState(0);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) { navigate("/login") }
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  }
  

  return (
    <div className="home-page">
      <NavBar handleLogout={handleLogout}></NavBar>
      <h1>Music Subscription</h1>
    </div>
  )
}

const NavBar = ({handleLogout}: any) => {
  const username = localStorage.getItem(USER_KEY);
  return (
    <div className="navbar py-3 px-5">
      <div className="left d-flex gap-3">
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </div>
      <div className="right d-flex gap-3">
        <span>{username}</span>
        <button className='btn btn-danger' onClick={handleLogout}>Logout</button>
      </div>
    </div>
  )
}

export default App
