import React from "react";
import { useAuth } from "./AuthContext";
import { useRouter } from "next/router";
import { useState, useEffect} from "react";
import Image from "next/image";
import styles from "../styles/dashboard.module.css";


interface Song {
  title: string;
  artist: string;
  album: string;
  year: string;
  img_url: string;
}


export default function Dashboard(){
    const [title, setTitle] = useState("");
    const [year, setYear] = useState("");
    const [artist, setArtist] = useState("");
    const [album, setAlbum] = useState("");
    const [queryResults, setQueryResults] = useState<Song[]>([]);
    const [subscribedSongs, setSubscribedSongs] = useState<Song[]>([]);
    const [error, setError] = useState("");
    const { user, logout } = useAuth();
    const router = useRouter();


    const getImageUrlFromS3 = (artistName: string) => {
      const bucketName = "artist-img-url-assignment"; // S3 bucket name
      const region = "us-east-1"; // The region where the bucket is hosted
      const encodedArtistName = artistName.replace(/\s+/g, '+').replace(/&/g, '%26');; // Remove spaces and encode
      const imageUrl = `https://${bucketName}.s3.${region}.amazonaws.com/artist-images/${encodedArtistName}.jpg`;
    
      return imageUrl;
    };
    

    useEffect(() => {
      const fetchSubscribedSongs = async () => {
        if (!user?.email) return;
    
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/subscriptions?email=${user.email}`);
          const data = await response.json();
          setSubscribedSongs(data);
        } catch (error) {
          console.error("Error fetching subscriptions:", error);
        }
      };
    
      fetchSubscribedSongs();
    }, [user]); // Only dependent on `user`
    


    const handleLogout = () => {
        logout();  
        router.push("/login");  
      };


      const handleQuery = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!title && !year && !artist && !album) {
          setError("Please enter at least one search field.");
          setQueryResults([]);
          return;
        }
    
        setError("");
    
        try {
          console.log("Sending request to:", `${process.env.NEXT_PUBLIC_API_BASE}/api/query`);
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/query`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ title, year, artist, album }),
          });
    
          const data = await response.json();
          if (data.length === 0) {
            setError("No result is retrieved. Please query again.");
            setQueryResults([]);
          } else {
            setQueryResults(data);
          }

          setTitle("");
          setYear("");
          setArtist("");
          setAlbum("");
        } catch (error) {
          setError("Error fetching data.");
          setQueryResults([]);
          console.error(error);
        }
      };


      const handleSubscribe = async (song: Song) => {
        if (!user?.email) {
          setError("User not authenticated.");
          return;
        }
      
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/subscribe`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: user.email,  // Ensure user has an email property
              song: {
                title: song.title,
                artist: song.artist,
                album: song.album,
                year: song.year,
              },
            }),
          });
      
          const data = await response.json();
          if (!response.ok) {
            setError(data.message || "Subscription failed.");
          } else {
            setError("");
            alert("Successfully subscribed to the song!");
            setSubscribedSongs((prevSongs) => [...prevSongs, song]);
          }
        } catch (error) {
          console.error(error);
          setError("Error subscribing.");
        }
      };

      const handleUnsubscribe = async (song: Song) => {
        if (!user?.email) {
          setError("User not authenticated.");
          return;
        }
      
        const queryParams = new URLSearchParams({
          email: user.email,
          title: song.title,
        });
      
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/unsubscribe?${queryParams}`, {
            method: "DELETE",
          });
      
          const data = await response.json();
      
          if (!response.ok) {
            setError(data.message || "Unsubscription failed.");
          } else {
            setError("");
            alert("Successfully unsubscribed!");
      
            // Remove the unsubscribed song from state
            setSubscribedSongs((prevSongs) =>
              prevSongs.filter((s) => s.title !== song.title)
            );
          }
        } catch (error) {
          console.error("Error unsubscribing:", error);
          setError("Error unsubscribing.");
        }
      };
      
      
      
    return(
        <>
        <div className={styles.header}>
            <h1>Welcome {user?.username}</h1>
            <button onClick={handleLogout}>Log Out</button>
            </div>
        <div className={styles.query}>
            <h1>Query Songs</h1>
            <form>
            <label>Title:</label>
            <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <label>Year:</label>
        <input
          type="text"
          placeholder="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
        <label>Artist:</label>
        <input
          type="text"
          placeholder="Artist"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
        />
        <label>Album:</label>
        <input
          type="text"
          placeholder="Album"
          value={album}
          onChange={(e) => setAlbum(e.target.value)}
        />
        <button onClick={handleQuery} type="submit">Query</button>
        </form>

        {error && <p>{error}</p>}

        {queryResults.length > 0 && (
          <div className={styles.querySection}>
            <h2>Results:</h2>
            <table className={styles.queryResult}>
  <thead>
    <tr>
      <th>Title</th>
      <th>Artist</th>
      <th>Year</th>
      <th>Album</th>
      <th>Image</th>
      <th>Susbscribe</th>
    </tr>
  </thead>
  <tbody>
    {queryResults.map((song, index) => {
      return(
      <tr key={index}>
        <td>{song.title}</td>
        <td>{song.artist}</td>
        <td>{song.year}</td>
        <td>{song.album}</td>
        <td> <Image src={getImageUrlFromS3(song.artist)} alt="singer" width={50} height={50}/>
</td>


        <td>
          <button className={styles.subscribeButton} onClick={()=> handleSubscribe(song)}>
            Subscribe
          </button>
        </td>
      </tr>
          );
    })}
  </tbody>
</table>
          </div>
        )}

        </div>
        {subscribedSongs.length > 0 && (
  <div className={styles.subscribeSection}>
    <h2>Subscribed Songs:</h2>
    <table className={styles.queryResult}>
      <thead>
        <tr>
          <th>Title</th>
          <th>Artist</th>
          <th>Year</th>
          <th>Album</th>
          <th>Image</th>
          <th>Delete Subscription</th>
        </tr>
      </thead>
      <tbody>
        {subscribedSongs.map((song, index) => (
          <tr key={index}>
            <td>{song.title}</td>
            <td>{song.artist}</td>
            <td>{song.year}</td>
            <td>{song.album}</td>
            <td><Image src={getImageUrlFromS3(song.artist)} alt="singer" width={50} height={50}/></td>
            <td><button className={styles.subscribeButton} onClick={()=> handleUnsubscribe(song)}>Remove</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}
</>
    )
}