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

const SongList: React.FC<SongListProps> = ({ songs }) => {
  const S3_URL = "https://song-images-s3953344.s3.us-east-1.amazonaws.com/";
  return (
    <div className="container my-4">
      {songs.map((song, index) => {
        const parts = song.img_url?.split("/");
        const last = parts?.[parts.length - 1];
        const fullUrl = S3_URL + last;

        return (
          <div key={index} className="row align-items-center border mb-3 p-3">
            <div className="col-auto">
              <img
                src={fullUrl}
                // src={song.img_url}
                alt={`${song.artist} album cover`}
                className="img-fluid rounded"
                style={{ width: "64px", height: "64px", objectFit: "cover" }}
              />
            </div>
            <div className="col">
              <h5 className="mb-1">{song.title}</h5>
              <p className="mb-0 text-muted">
                {song.artist} · {song.album} · {song.year}
              </p>
            </div>
            <div className="col-auto">
              <button className="btn btn-success">Subscribe</button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SongList;
