import { useEffect, useState } from "react";
import { useAuth } from "./context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

import "./App.css";
import "./pages/formValidation.css";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  ScanCommand,
  QueryCommandInput,
  ScanCommandOutput,
  QueryCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import creds from "frontend/src/credentials.json";
import NavBar from "./components/NavBar";
import SongList, { Song } from "./components/SongList";

interface QueryParams {
  artist: string;
  title: string;
  album: string;
  year: number;
}

type QueryResults = ScanCommandOutput | QueryCommandOutput | { Count: number, Items: Array<Song> };
const QUERY_RESULT_DEFAULT = {Count: -1, Items: []};

export default function App() {
  const [queryResults, setQueryResults] = useState<QueryResults>(QUERY_RESULT_DEFAULT);
  const [queryError, setQueryError] = useState<string>("");

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
    setQueryResults(QUERY_RESULT_DEFAULT);
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

      let command;
      if (data.title || data.album || data.artist) {
        // all of these three have an index (main table or GSI)
        command = createQueryCommand(data);
      } else {
        // if only year is selected, then we do a scan
        command = createScanCommand(data);
      }

      const response = await docClient.send(command);
      console.log(response);
      // return response;
      setQueryResults(response);
      setQueryError("");
    } catch (error) {
      console.error("Error fetching data:", error);
      setQueryResults(QUERY_RESULT_DEFAULT);
      setQueryError(`${error}`);

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
            <form className="mb-4" onSubmit={handleSubmit((data) => handleQuery(data))}>
              <div className="query-field">
                <label htmlFor="artist">Artist</label>
                <input {...register("artist")} className="form-control" id="artist" type="text" />
              </div>
              <div className="query-field">
                <label htmlFor="title">Title</label>
                <input {...register("title")} className="form-control" id="title" type="text" />
              </div>
              <div className="query-field">
                <label htmlFor="album">Album</label>
                <input {...register("album")} className="form-control" id="album" type="text" />
              </div>
              <div className="query-field">
                <label htmlFor="year">Year</label>
                <input {...register("year")} className="form-control" id="year" type="number" />
              </div>
              <button type="submit" className="submit-query-btn btn btn-info">
                Query
              </button>
              <div className="error-message">
                {
                  queryError && queryError
                }
              </div>
            </form>
            <div className="query-results | px-2 border">
              {queryResults === QUERY_RESULT_DEFAULT && "Enter at least one field and press query to search for music"}
              {queryResults.Count === 0 && "No result is retrieved. Please query again"}
              {
                (queryResults.Count! > 0 && queryResults.Items) && 
                <SongList songs={queryResults.Items} />
              }
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



// music table has PK title and SK album
// current GSI created are:
// album-title-index
// artist-title-index
// CONTRACT: at least one of title, album or artist is filled
const createQueryCommand = (data: QueryParams) => {
  const command: QueryCommandInput = {
    TableName: "music",
  };

  // if a title is supplied, always use that to search
  if (data.title) {
    console.log("Using base table query");
    command.KeyConditionExpression = "title = :titleVal";
    command.ExpressionAttributeValues = {":titleVal": data.title};
    command.ConsistentRead = true;
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
    command.ExpressionAttributeNames = {"#year": "year"}
  }

  console.log(command);
  return new QueryCommand(command);
};

// if ONLY year is queried
const createScanCommand = (data: QueryParams) => {
  console.log("Using table scan");
  return new ScanCommand({
    TableName: "music",
    FilterExpression: "#year = :yearVal",
    ExpressionAttributeValues: {":yearVal": data.year.toString()},
    ExpressionAttributeNames: {"#year": "year"}
  })
}
