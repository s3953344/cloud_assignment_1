import { Link } from "react-router-dom";
import { USER_KEY } from "../context/AuthContext";

const NavBar = ({ handleLogout }: any) => {
  const user = sessionStorage.getItem(USER_KEY)!
  if (!user) return;
  const username = JSON.parse(user).username;
  return (
    <div className="navbar py-3 px-5">
      <div className="left d-flex gap-3">
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </div>
      <div className="right d-flex gap-3">
        <span>{username}</span>
        <button className="btn btn-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default NavBar;