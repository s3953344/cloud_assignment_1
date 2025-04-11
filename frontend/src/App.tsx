import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { useAuth, USER_KEY } from "./context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { FieldValues, useForm } from "react-hook-form";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  QueryCommandInput,
} from "@aws-sdk/lib-dynamodb";
import creds from "frontend/src/credentials.json";

interface QueryParams {
  artist: string;
  title: string;
  album: string;
  year: number;
}

export default function App() {
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
    setQueryResults(null);
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
        return null;
      }

      const command = createQueryCommand(data);
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
        <small>Please note, search is case sensitive!</small>

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

// music table has PK title and SK album
// current GSI created are:
// album-title-index
// artist-title-index
// CONTRACT: at least one of title, album or artist is filled
const createQueryCommand = (data: QueryParams) => {
  const command: QueryCommandInput = {
    TableName: "music",
    ConsistentRead: true,
  };

  // if a title is supplied, always use that to search
  if (data.title) {
    console.log("Using base table query");
    command.KeyConditionExpression = "title = :titleVal";
    command.ExpressionAttributeValues = {":titleVal": data.title};
    if (data.album) {
      command.KeyConditionExpression += " AND album = :albumVal";
      command.ExpressionAttributeValues[":albumVal"] = data.album;
    }
    if (data.artist) {
      command.FilterExpression = "artist = :artistVal";
      command.ExpressionAttributeValues[":artistVal"] = data.artist;
      // command.ExpressionAttributeValues
    }
    
  } else if (data.artist) {
    console.log("Using artist index");
    command.IndexName = "artist-title-index"
    command.KeyConditionExpression = "artist = :artistVal";
    command.ExpressionAttributeValues = {":artistVal": data.artist };
    
    if (data.album) {
      command.FilterExpression = "album = :albumVal";
      command.ExpressionAttributeValues[":albumVal"] = data.album;
    }
  } else if (data.album) {
    console.log("Using album index");
    command.IndexName = "album-title-index"
    command.KeyConditionExpression = "album = :albumVal";
    command.ExpressionAttributeValues = {":albumVal": data.album };
  }
  
  if (data.year) {
    command.FilterExpression = "#year = :yearVal";
    command.ExpressionAttributeValues![":yearVal"] = data.year;
    command.ExpressionAttributeNames = {"#year": data.year.toString()}

  }

  console.log(command);
  return new QueryCommand(command);
};
