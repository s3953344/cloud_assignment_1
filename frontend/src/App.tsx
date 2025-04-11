import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { useAuth, USER_KEY } from "./context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { FieldValues, useForm } from "react-hook-form";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import creds from "frontend/src/credentials.json";

interface QueryParams {
  artist: string;
  title: string;
  album: string;
  year: number;
}

function App() {
  const [queryResults, setQueryResults] = useState<any>(null);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<QueryParams>();

  const client = new DynamoDBClient({
    region: "us-east-1",
    credentials: creds,
  });
  // Create the DynamoDB Document Client
  const docClient = DynamoDBDocumentClient.from(client);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // based on AWS docs
  // https://docs.aws.amazon.com/code-library/latest/ug/dynamodb_example_dynamodb_Query_section.html
  // https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Query.html#API_Query_Examples
  const handleQuery = async (data: QueryParams) => {
    // check if at least one query field is added
    // console.log(data);
    try {
      if (Object.values(data).every((val) => val === "")) {
        console.log("Must have at least one parameter to query");
        return;
      }

      // this one only works if only title is given! baby's first query.
      const command = new QueryCommand({
        TableName: "music",
        KeyConditionExpression: "title = :v1",
        ExpressionAttributeValues: {
          ":v1": data.title,
        },
        ConsistentRead: true,
      });

      const response = await docClient.send(command);
      console.log(response);
      return response;
    } catch (error) {
      console.error("Error fetching data:", error);
      // setErrorMsg(`Error fetching data: ${error}`);
    }
  };

  return (
    <>
      <NavBar handleLogout={handleLogout}></NavBar>
      <div className="home-page">
        <h1>Music Subscription</h1>

        <div className="even-columns">
          <div className="query-area">
            <h2>Query</h2>
            <form onSubmit={handleSubmit((data) => handleQuery(data))}>
              <div className="query-field">
                <label htmlFor="artist">Artist</label>
                <input {...register("artist")} id="artist" type="text" />
              </div>
              <div className="query-field">
                <label htmlFor="title">Title</label>
                <input {...register("title")} id="title" type="text" />
              </div>
              <div className="query-field">
                <label htmlFor="album">Album</label>
                <input {...register("album")} id="album" type="text" />
              </div>
              <div className="query-field">
                <label htmlFor="year">Year</label>
                <input {...register("year")} id="year" type="number" />
              </div>
              <button type="submit" className="btn btn-info">
                Query
              </button>
            </form>
            <div className="query-results">
              {queryResults !== null
                ? queryResults
                : "No result is retrieved. Please query again"}
            </div>
          </div>

          <div className="subscription-area">
            <h2>Subscriptions</h2>
          </div>
        </div>
      </div>
    </>
  );
}

const NavBar = ({ handleLogout }: any) => {
  const username = localStorage.getItem(USER_KEY);
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

export default App;
