import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { useAuth, USER_KEY } from './context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { FieldValues, useForm } from 'react-hook-form';

function App() {
  const [queryResults, setQueryResults] = useState<any>(null);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm();

  useEffect(() => {
    if (!isAuthenticated) { navigate("/login") }
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  }

  const handleQuery = (data: FieldValues) => {

  }
  

  return (
    <>
    <NavBar handleLogout={handleLogout}></NavBar>
    <div className="home-page">
      <h1>Music Subscription</h1>

      <div className="even-columns">
        <div className="query-area">
          <h2>Query</h2>
          <form onSubmit={handleSubmit((data) => handleQuery(data))}>
            <div className="query-field"><label htmlFor="artist">Artist</label><input type="text" /></div>
            <div className="query-field"><label htmlFor="title">Title</label><input type="text" /></div>
            <div className="query-field"><label htmlFor="album">Album</label><input type="text" /></div>
            <div className="query-field"><label htmlFor="year">Year</label><input type="number" /></div>
            <button type='submit' className='btn btn-info'>Query</button>
          </form>
          <div className="query-results">
            {
              queryResults !== null ?
              queryResults
              :
              "No result is retrieved. Please query again"
            }
          </div>
        </div>

        <div className="subscription-area">
          <h2>Subscriptions</h2>
        </div>
      </div>
    </div>

    </>
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
