import { useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import "./formValidation.css";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

// regex from https://regexr.com/3e48o
const emailPattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

// code adapted from https://docs.aws.amazon.com/code-library/latest/ug/dynamodb_example_dynamodb_GetItem_section.html

const creds = { 
  
}

const client = new DynamoDBClient({region: "us-east-1", "credentials": creds});
// Create the DynamoDB Document Client
const docClient = DynamoDBDocumentClient.from(client);

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate()
  
  const getLogin = async (data: FieldValues) => {
    try {
      const command = new GetCommand({
        TableName: "login",
        Key: {
          "email": data.email,
        },
      });
    
      const response = await docClient.send(command);
      if (response.Item?.password === data.password) {
        console.log("Login successful!");
        navigate("/");
      } else {
        console.log("Login failed. Username or password is incorrect.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      return null;
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



