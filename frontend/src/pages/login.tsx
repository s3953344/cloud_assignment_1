import { useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import "./formValidation.css";

// interface FormData {
//   email: string;
//   password: string;
// }

const emailPattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  // const [data, setData] = useState("");
  const onSubmit = (data: FieldValues) => {
    console.log(data);
  }

  return (
    <div className="login-page d-flex flex-column">
      <h1 className="text-4xl font-bold mb-4">Login</h1>
      <form onSubmit={handleSubmit((data) => onSubmit(data))}>
        <div className="mb-4 d-flex flex-column">
          <label className="mb-2" htmlFor="email">
            Email
          </label>
          <input
            {...register("email", {required: true, pattern: emailPattern})}
            type="text"
            id="email"
            className="form-control"
            placeholder="Enter your email"
          />
          {errors.email && <span role="alert" className="error-message">Enter a valid email address</span>}
        </div>
        <div className="mb-4 d-flex flex-column">
          <label className="mb-2" htmlFor="password">
            Password
          </label>
          <input
            {...register("password", {required: "Please enter your password"})}
            type="password"
            id="password"
            className="form-control"
            placeholder="Enter your password"
          />
          {errors.password && <span role="alert" className="error-message">{errors.password.message?.toString()}</span>}
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