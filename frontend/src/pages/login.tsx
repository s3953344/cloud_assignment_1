import { FieldValues, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import creds from "frontend/src/credentials.json";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./formValidation.css";

// regex from https://regexr.com/3e48o
const emailPattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

export default function LoginPage() {
  const [errorMsg, setErrorMsg] = useState<string>("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const client = new DynamoDBClient({
    region: "us-east-1",
    credentials: creds,
  });
  // Create the DynamoDB Document Client
  const docClient = DynamoDBDocumentClient.from(client);

  const getLogin = async (data: FieldValues) => {
    try {
      const command = new GetCommand({
        TableName: "login",
        Key: {
          email: data.email,
        },
      });

      const response = await docClient.send(command);

      if (response.Item?.password === data.password) {
        // console.log(response);
        console.log("Login successful!");
        setErrorMsg("");
        login(response.Item?.user_name, response.Item?.email);
        navigate("/");
      } else {
        setErrorMsg("Login failed. Username or password is incorrect.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setErrorMsg(`Error fetching data: ${error}`);
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
        <div className="error-message | mb-4">
          {errorMsg !== "" && errorMsg}
        </div>
        <button type="submit" className="btn btn-primary">
          Login
        </button>
      </form>
    </div>
  );
}
