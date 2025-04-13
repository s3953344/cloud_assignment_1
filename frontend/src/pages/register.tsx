import { FieldValues, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import "./formValidation.css";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import creds from "frontend/src/credentials.json";
import { useState } from "react";

// regex from https://regexr.com/3e48o
const emailPattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

export default function RegisterPage() {
  const [errorMsg, setErrorMsg] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();

  const client = new DynamoDBClient({
    region: "us-east-1",
    credentials: creds,
  });
  // Create the DynamoDB Document Client
  const docClient = DynamoDBDocumentClient.from(client);

  const getLogin = async (data: FieldValues) => {
    try {
      const getCommand = new GetCommand({
        TableName: "login",
        Key: {
          email: data.email,
        },
      });
      const getResponse = await docClient.send(getCommand);
      if (getResponse.Item?.email === data.email) {
        setErrorMsg("Registration failed. Email must be unique.");
        return;
      }

      // if email is unique, put request
      const putCommand = new PutCommand({
        TableName: "login",
        Item: {
          email: data.email,
          user_name: data.user_name,
          password: data.password,
        },
      });
      const putResponse = await docClient.send(putCommand);
      console.log(putResponse);
      if (putResponse.$metadata.httpStatusCode == 200) {
        setErrorMsg("");
        alert("Registration success!");
        navigate("/login");
      } else {
        setErrorMsg(`Registration failed: something went wrong.`);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      setErrorMsg(`Error fetching data: ${error}`);
    }
  };

  return (
    <div className="register-page d-flex flex-column">
      <h1 className="text-4xl font-bold mb-4">Register</h1>
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
          <label className="mb-2" htmlFor="user_name">
            Username
          </label>
          <input
            {...register("user_name", { required: true })}
            type="text"
            id="user_name"
            className="form-control"
            placeholder="Enter your username"
          />
          {errors.user_name && (
            <span role="alert" className="error-message">
              Enter a valid username
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
        <div className="error-message | mb-4">
          {errorMsg !== "" && errorMsg}
        </div>
        <button type="submit" className="btn btn-primary">
          Register
        </button>
      </form>
    </div>
  );
}
