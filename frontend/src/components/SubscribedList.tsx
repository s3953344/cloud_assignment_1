import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import creds from "frontend/src/credentials.json";
import { API_URL, USER_KEY } from "../context/AuthContext";
import { useState } from "react";
import axios from "axios";

export type Subscription = {
  email?: string;
  SK?: string;
  year?: string;
  album?: string;
  artist?: string;
  img_url?: string;
  title?: string;
};

type SubscriptionListProps = {
  subscriptions: Subscription[];
  setSubscriptions: React.Dispatch<React.SetStateAction<Subscription[]>>;
};

// S3 bucket image permissions
// read-only public access
// https://docs.aws.amazon.com/AmazonS3/latest/userguide/example-bucket-policies.html#example-bucket-policies-anonymous-user

function SubscriptionItem({ subscription, setSubscriptions }: { subscription: Subscription, setSubscriptions: React.Dispatch<React.SetStateAction<Subscription[]>> }) {
  const [disableUnsubscribe, setDisableUnsubscribe] = useState<boolean>(false);
  const S3_URL = "https://song-images-s3953344.s3.us-east-1.amazonaws.com/";
  const parts = subscription.img_url?.split("/");
  const last = parts?.[parts.length - 1];
  const fullUrl = S3_URL + last;

  const client = new DynamoDBClient({
    region: "us-east-1",
    credentials: creds,
  });
  // Create the DynamoDB Document Client
  const docClient = DynamoDBDocumentClient.from(client);

  const handleUnubscribe = async () => {
    try {
      // user must be logged in
      const user = sessionStorage.getItem(USER_KEY);
      if (!user) {
        console.log("User must be logged in to unsubscribe!");
        return;
      }

      // const command = new DeleteCommand({
      //   TableName: "subscription",
      //   Key: {
      //     email: subscription.email,
      //     SK: subscription.SK,
      //   },
      // });
      // const command = {
      //   TableName: "subscription",
      //   Key: {
      //     email: subscription.email,
      //     SK: subscription.SK,
      //   },
      // };

      // console.log(command);
      // const response = await docClient.send(command);
      setDisableUnsubscribe(true);
      const response = await axios.post(API_URL, {
        type: "deleteSubscription",
        email: subscription.email,
        SK: subscription.SK
      });
      console.log("Remove subscription");
      console.log(response);
      if (response.data.statusCode == 200) {
        setDisableUnsubscribe(true);
        setSubscriptions(prev =>
          prev.filter(s => !(s.email === subscription.email && s.SK === subscription.SK))
        );
      }
    } catch (error) {
      console.error("Error unsubscribing:", error);
      setDisableUnsubscribe(false);
    }
  };

  return (
    <div className="row align-items-center border mb-3 p-3">
      <div className="col-auto">
        <img
          src={fullUrl}
          alt={`${subscription.artist} album cover`}
          className="img-fluid rounded"
          style={{ width: "64px", height: "64px", objectFit: "cover" }}
        />
      </div>
      <div className="col">
        <h5 className="mb-1">{subscription.title}</h5>
        <p className="mb-0 text-muted">Artist: {subscription.artist}</p>
        <p className="mb-0 text-muted">Album: {subscription.album}</p>
        <p className="mb-0 text-muted">{subscription.year}</p>
      </div>
      <div className="col-auto">
        <button
          onClick={handleUnubscribe}
          disabled={disableUnsubscribe}
          className="btn btn-danger"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

function SubscriptionList({ subscriptions, setSubscriptions }: SubscriptionListProps) {
  return (
    <div className="container my-4">
      {subscriptions.map((subscription) => {
        return (
          <SubscriptionItem
            key={subscription.SK}
            subscription={subscription}
            setSubscriptions={setSubscriptions}
          />
        );
      })}
    </div>
  );
}

export default SubscriptionList;
