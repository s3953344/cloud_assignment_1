import { Link } from "react-router-dom";

export default function LoginPage() {

  return (
    <div className="login-page d-flex flex-column">
      <h1 className="text-4xl font-bold mb-4">Login</h1>
      <form>
        <div className="mb-4 d-flex flex-column">
          <label className="mb-2" htmlFor="username">
            Username
          </label>
          <input
            type="text"
            id="username"
            placeholder="Enter your username"
          />
        </div>
        <div className="mb-4 d-flex flex-column">
          <label className="mb-2" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="password"
            placeholder="Enter your password"
          />
        </div>
        <p className="mb-4">
          Don't have an account? Register <Link to="/register">here</Link>
        </p>
        <button
          type="submit"
          className="btn btn-primary"
        >
          Login
        </button>
      </form>
    </div>
  )
}