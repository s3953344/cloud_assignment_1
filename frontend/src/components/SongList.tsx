import { API_URL, USER_KEY } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { Subscription } from "./SubscribedList";
import axios from "axios";

export type Song = {
  year?: string;
  album?: string;
  artist?: string;
  img_url?: string;
  title?: string;
};

type SongListProps = {
  songs: Song[],
  subscriptions: Subscription[],
  setSubscriptions: React.Dispatch<React.SetStateAction<Subscription[]>>,
};

type SongItemProps = {
  song: Song,
  subscriptions: Subscription[],
  setSubscriptions: React.Dispatch<React.SetStateAction<Subscription[]>>,
};

// S3 bucket image permissions
// read-only public access
// https://docs.aws.amazon.com/AmazonS3/latest/userguide/example-bucket-policies.html#example-bucket-policies-anonymous-user

function SongItem({ song, subscriptions, setSubscriptions }: SongItemProps) {
  const [disableSubscribe, setDisableSubscribe] = useState<boolean>(false);
  const S3_URL = "https://song-images-s3953344.s3.us-east-1.amazonaws.com/";
  const parts = song.img_url?.split("/");
  const last = parts?.[parts.length - 1];
  const fullUrl = S3_URL + last;

  // check if already subscribed, and if so, disable subscribe button
  useEffect(() => {
    const isAlreadySubscribed = subscriptions.some(sub => 
      sub.title === song.title && sub.album === song.album
    );
    setDisableSubscribe(isAlreadySubscribed);
  }, [subscriptions, song]);

  const handleSubscribe = async () => {
    try {
      // user must be logged in
      const user = sessionStorage.getItem(USER_KEY);
      if (!user) { 
        console.log("User must be logged in to subscribe!")
        return;
      }
      const userEmail = JSON.parse(user).email;
  
      const subscription = {
          email: userEmail,
          // title::album creates the song primary key
          SK: createSongKey(song.title!, song.album!),
          title: song.title,
          album: song.album,
          artist: song.artist,
          year: song.year,
          img_url: song.img_url,
      }
      setDisableSubscribe(true);
      const putResponse = await axios.post(API_URL, {
        type: "updateSubscription",
        item: subscription,
      });
      console.log("Put new subscription")
      console.log(putResponse);
      if (putResponse.data.statusCode == 200) {
        setDisableSubscribe(true);
        setSubscriptions(prev => [...prev, subscription]);
      }
    } catch (error) {
      console.error("Error putting subscription data:", error);
      setDisableSubscribe(false);
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

function SongList({ songs, subscriptions, setSubscriptions }: SongListProps) {
  return (
    <div className="container my-4">
      {songs.map((song) => {
        return <SongItem key={createSongKey(song.title!, song.album!)} song={song} subscriptions={subscriptions} setSubscriptions={setSubscriptions}/>
      })}
    </div>
  );
}

// title::album creates the song primary key
function createSongKey(title: string, album: string) {
  return `${title}::${album}`;
}

export default SongList;
