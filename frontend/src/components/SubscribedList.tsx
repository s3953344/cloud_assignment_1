import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  ScanCommand,
  QueryCommandInput,
  ScanCommandOutput,
  QueryCommandOutput,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import creds from "frontend/src/credentials.json";
import { USER_KEY } from "../context/AuthContext";
import { useState } from "react";

export type Subscription = {
  email?: string;
  sk?: string;
  year?: string;
  album?: string;
  artist?: string;
  img_url?: string;
  title?: string;
};

type SubscriptionListProps = {
  subscriptions: Subscription[];
};

// S3 bucket image permissions
// read-only public access
// https://docs.aws.amazon.com/AmazonS3/latest/userguide/example-bucket-policies.html#example-bucket-policies-anonymous-user

function SubscriptionItem({ subscription }: { subscription: Subscription }) {
  const [disableSubscribe, setDisableSubscribe] = useState<boolean>(false);
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
      // // user must be logged in
      // const user = localStorage.getItem(USER_KEY);
      // if (!user) { 
      //   console.log("User must be logged in to subscribe!")
      //   return;
      // }
      // const userEmail = JSON.parse(user).email;
  
      // const command = new PutCommand({
      //   TableName: "subscription",
      //   Item: {
      //     email: userEmail,
      //     // title::album creates the song primary key
      //     SK: createSongKey(subscription.title!, subscription.album!),
      //     title: subscription.title,
      //     album: subscription.album,
      //     artist: subscription.artist,
      //     year: subscription.year,
      //     img_url: subscription.img_url,
      //   }
      // })
      // const response = await docClient.send(command);
      // console.log("Put new subscription")
      // console.log(response);
      // if (response.$metadata.httpStatusCode === 200) {
      //   setDisableSubscribe(true);
      // }
    } catch (error) {
      console.error("Error unsubscribing:", error);
    }
  }

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
        <button onClick={handleUnubscribe} disabled={disableSubscribe} className="btn btn-danger">Unsubscribe</button>
      </div>
    </div>
  );
}

// const SongList: React.FC<SongListProps> = ({ songs }) => {
function SubscriptionList({ subscriptions }: SubscriptionListProps) {
  return (
    <div className="container my-4">
      {subscriptions.map((subscription) => {
        return <SubscriptionItem key={""} subscription={subscription}/>
      })}
    </div>
  );
}

// // title::album creates the song primary key
// function createSongKey(title: string, album: string) {
//   return `${title}::${album}`;
// }

export default SubscriptionList;
