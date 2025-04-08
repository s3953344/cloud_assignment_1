import { FieldValues, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./formValidation.css";

// regex from https://regexr.com/3e48o
const emailPattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

const PORT = 3000;

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();

  const getLogin = async (data: FieldValues) => {
    try {
      const res = await axios.get(`http://localhost:${PORT}/api/login`, {
        params: { email: data.email, password: data.password },
      });

      if (res.data.password === data.password) {
        navigate("/");
      }

      // console.log(res.data);

      // data looks like this:
      // data = {
      //   email: email,
      //   username: username,
      //   password: password,
      // }

    } catch (error) {
      console.error("Error fetching data:", error);
      // TODO: set error message
    }
  };

  return (
    <div className="login-page d-flex flex-column">
      <h1 className="text-4xl font-bold mb-4">Login</h1>
      <form onSubmit={handleSubmit((data) => getLogin(data))}>
        <div className="mb-4 d-flex flex-column">
          <label className="mb-2" htmlFor="email">
            Email
          </label>
          <input
            {...register("email", { required: true, pattern: emailPattern })}
            type="text"
            id="email"
            className="form-control"
            placeholder="Enter your email"
          />
          {errors.email && (
            <span role="alert" className="error-message">
              Enter a valid email address
            </span>
          )}
        </div>
        <div className="mb-4 d-flex flex-column">
          <label className="mb-2" htmlFor="password">
            Password
          </label>
          <input
            {...register("password", {
              required: "Please enter your password",
            })}
            type="password"
            id="password"
            className="form-control"
            placeholder="Enter your password"
          />
          {errors.password && (
            <span role="alert" className="error-message">
              {errors.password.message?.toString()}
            </span>
          )}
        </div>
        <p className="mb-4">
          Don't have an account? Register <Link to="/register">here</Link>
        </p>
        <button type="submit" className="btn btn-primary">
          Login
        </button>
      </form>
    </div>
  );
}
