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

export type Song = {
  year?: string;
  album?: string;
  artist?: string;
  img_url?: string;
  title?: string;
};

type SongListProps = {
  songs: Song[];
};

// S3 bucket image permissions
// read-only public access
// https://docs.aws.amazon.com/AmazonS3/latest/userguide/example-bucket-policies.html#example-bucket-policies-anonymous-user

function SongItem({ song }: { song: Song }) {
  const [disableSubscribe, setDisableSubscribe] = useState<boolean>(false);
  const S3_URL = "https://song-images-s3953344.s3.us-east-1.amazonaws.com/";
  const parts = song.img_url?.split("/");
  const last = parts?.[parts.length - 1];
  const fullUrl = S3_URL + last;

  const client = new DynamoDBClient({
    region: "us-east-1",
    credentials: creds,
  });
  // Create the DynamoDB Document Client
  const docClient = DynamoDBDocumentClient.from(client);

  const handleSubscribe = async () => {
    try {
      // user must be logged in
      const user = sessionStorage.getItem(USER_KEY);
      if (!user) { 
        console.log("User must be logged in to subscribe!")
        return;
      }
      const userEmail = JSON.parse(user).email;
  
      const command = new PutCommand({
        TableName: "subscription",
        Item: {
          email: userEmail,
          // title::album creates the song primary key
          SK: createSongKey(song.title!, song.album!),
          title: song.title,
          album: song.album,
          artist: song.artist,
          year: song.year,
          img_url: song.img_url,
        }
      })
      const response = await docClient.send(command);
      console.log("Put new subscription")
      console.log(response);
      if (response.$metadata.httpStatusCode === 200) {
        setDisableSubscribe(true);
      }
    } catch (error) {
      console.error("Error putting subscription data:", error);
    }
  }

  return (
    <div className="row align-items-center border mb-3 p-3">
      <div className="col-auto">
        <img
          src={fullUrl}
          alt={`${song.artist} album cover`}
          className="img-fluid rounded"
          style={{ width: "64px", height: "64px", objectFit: "cover" }}
        />
      </div>
      <div className="col">
        <h5 className="mb-1">{song.title}</h5>
        <p className="mb-0 text-muted">Artist: {song.artist}</p>
        <p className="mb-0 text-muted">Album: {song.album}</p>
        <p className="mb-0 text-muted">{song.year}</p>
      </div>
      <div className="col-auto">
        <button onClick={handleSubscribe} disabled={disableSubscribe} className="btn btn-success">Subscribe</button>
      </div>
    </div>
  );
}

// const SongList: React.FC<SongListProps> = ({ songs }) => {
function SongList({ songs }: SongListProps) {
  return (
    <div className="container my-4">
      {songs.map((song) => {
        return <SongItem key={createSongKey(song.title!, song.album!)} song={song}/>
      })}
    </div>
  );
}

// title::album creates the song primary key
function createSongKey(title: string, album: string) {
  return `${title}::${album}`;
}

export default SongList;
