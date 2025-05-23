import { useEffect, useState } from "react";
import { useAuth, USER_KEY } from "./context/AuthContext";
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
} from "@aws-sdk/lib-dynamodb";
import creds from "frontend/src/credentials.json";
import NavBar from "./components/NavBar";
import SongList, { Song } from "./components/SongList";
import SubscriptionList, { Subscription } from "./components/SubscribedList";

interface QueryParams {
  artist: string;
  title: string;
  album: string;
  year: number;
}

const QUERY_RESULT_DEFAULT: Song[] = [];
const SUB_RESULT_DEFAULT: Subscription[] = [];

export default function App() {
  const [subscriptionResults, setSubscriptionResults] =
    useState<Subscription[]>(SUB_RESULT_DEFAULT);
  const [queryResults, setQueryResults] =
    useState<Song[]>(QUERY_RESULT_DEFAULT);
  const [queryError, setQueryError] = useState<string>("");

  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm<QueryParams>();

  const client = new DynamoDBClient({
    region: "us-east-1",
    credentials: creds,
  });
  // Create the DynamoDB Document Client
  const docClient = DynamoDBDocumentClient.from(client);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchSubscriptions = async () => {
      try {
        if (!isAuthenticated) return; // super just in case!
        const userObj = sessionStorage.getItem(USER_KEY)!;
        const email = JSON.parse(userObj).email;
        const getSubsCommand = new QueryCommand({
          TableName: "subscription",
          KeyConditionExpression: "email = :emailVal",
          ExpressionAttributeValues: { ":emailVal": email },
        });
        const response = await docClient.send(getSubsCommand);
        console.log(response);
        if (response.Items === undefined) {
          setSubscriptionResults(SUB_RESULT_DEFAULT);
        } else {
          setSubscriptionResults(response.Items);
        }
      } catch (error) {
        console.error("Error fetching subscription data:", error);
        setSubscriptionResults(SUB_RESULT_DEFAULT);
        // too lazy to create a new error element for subscription haha
        setQueryError(`${error}`);
      }
    };

    fetchSubscriptions();
  }, []);

  const handleLogout = () => {
    setQueryResults(QUERY_RESULT_DEFAULT);
    setSubscriptionResults(SUB_RESULT_DEFAULT);
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
      if (response.Items === undefined) {
        setQueryResults(QUERY_RESULT_DEFAULT);
      } else {
        setQueryResults(response.Items);
        setQueryError("");
      }
    } catch (error) {
      console.error("Error fetching song data:", error);
      setQueryResults(QUERY_RESULT_DEFAULT);
      setQueryError(`${error}`);
    }
  };

  return (
    <>
      <NavBar handleLogout={handleLogout}></NavBar>
      <div className="home-page">
        <h1>Music Subscription</h1>
        <div className="error-message">{queryError && queryError}</div>

        <div className="even-columns">
          <div className="query-area">
            <h2>Query</h2>
            <small className="mb-4">
              Please note, search is case sensitive!
            </small>
            <form
              className="mb-4"
              onSubmit={handleSubmit((data) => handleQuery(data))}
            >
              <div className="query-field">
                <label htmlFor="artist">Artist</label>
                <input
                  {...register("artist")}
                  className="form-control"
                  id="artist"
                  type="text"
                />
              </div>
              <div className="query-field">
                <label htmlFor="title">Title</label>
                <input
                  {...register("title")}
                  className="form-control"
                  id="title"
                  type="text"
                />
              </div>
              <div className="query-field">
                <label htmlFor="album">Album</label>
                <input
                  {...register("album")}
                  className="form-control"
                  id="album"
                  type="text"
                />
              </div>
              <div className="query-field">
                <label htmlFor="year">Year</label>
                <input
                  {...register("year")}
                  className="form-control"
                  id="year"
                  type="number"
                />
              </div>
              <button type="submit" className="submit-query-btn btn btn-info">
                Query
              </button>
            </form>
            <div className="query-results | px-2 border">
              {queryResults === QUERY_RESULT_DEFAULT &&
                "No result is retrieved. Please query again"}
              {queryResults.length > 0 && (
                <SongList
                  songs={queryResults}
                  subscriptions={subscriptionResults}
                  setSubscriptions={setSubscriptionResults}
                />
              )}
            </div>
          </div>

          <div className="subscription-area">
            <h2>Subscriptions</h2>
            <div className="subscription-results | px-2 border">
              {subscriptionResults.length === 0 &&
                "No result is retrieved. Subscribe to some music first!"}
              {subscriptionResults.length > 0 && (
                <SubscriptionList
                  subscriptions={subscriptionResults}
                  setSubscriptions={setSubscriptionResults}
                />
              )}
            </div>
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

  // if a title is supplied, always use that to query
  // because titles are not likely to be the same,
  // fully utilises hashing and reduces the amount dynamodb has to scan
  if (data.title) {
    console.log("Using base table query");
    command.KeyConditionExpression = "title = :titleVal";
    command.ExpressionAttributeValues = { ":titleVal": data.title };
    command.ConsistentRead = true;
    if (data.album) {
      command.KeyConditionExpression += " AND album = :albumVal";
      command.ExpressionAttributeValues[":albumVal"] = data.album;
    }
    if (data.artist) {
      command.FilterExpression = "artist = :artistVal";
      command.ExpressionAttributeValues[":artistVal"] = data.artist;
    }
    // I anticipate artist as the next most-queried attribute.
    // so I made a GSI for it. SK is so titles are returned sorted
    // so user can find the songs they want faster
  } else if (data.artist) {
    console.log("Using artist index");
    command.IndexName = "artist-title-index";
    command.KeyConditionExpression = "artist = :artistVal";
    command.ExpressionAttributeValues = { ":artistVal": data.artist };

    if (data.album) {
      command.FilterExpression = "album = :albumVal";
      command.ExpressionAttributeValues[":albumVal"] = data.album;
    }
    // next most queried attribute i anticipate to be album
  } else if (data.album) {
    console.log("Using album index");
    command.IndexName = "album-title-index";
    command.KeyConditionExpression = "album = :albumVal";
    command.ExpressionAttributeValues = { ":albumVal": data.album };
  }
  // add year as a filter if provided
  if (data.year) {
    command.FilterExpression = "#year = :yearVal";
    command.ExpressionAttributeValues![":yearVal"] = data.year;
    command.ExpressionAttributeNames = { "#year": "year" };
  }

  console.log(command);
  return new QueryCommand(command);
};

// if ONLY year is queried, scan the table
// i don't think anyone is searching just for the year very often
// so no GSI created for this to avoid over-indexing
const createScanCommand = (data: QueryParams) => {
  console.log("Using table scan");
  return new ScanCommand({
    TableName: "music",
    FilterExpression: "#year = :yearVal",
    ExpressionAttributeValues: { ":yearVal": data.year.toString() },
    ExpressionAttributeNames: { "#year": "year" },
  });
};
