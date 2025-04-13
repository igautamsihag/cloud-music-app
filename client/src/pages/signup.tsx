import React from "react";
import { useState } from "react";
import styles from "../styles/signup.module.css";
import Link from "next/link";

const Signup = () => {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const response = await fetch(
        `https://am3isx9i9j.execute-api.us-east-1.amazonaws.com/Production/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
        }
      );
  
      const data = await response.json();
      console.log("Signup raw response data:", data);
  
      if (response.ok) {
        alert("Signup successful");
      } else {
        setError(data.error || data.message || "Signup failed.");
      }
    } catch (err) {
      console.error("Task to signup user failed:", err);
      setError("Please try again. Signup failed.");
    }
  };
  

  return (
    <div className={styles.box}>
      <div className={styles.formbox}>
    <h2>Signup</h2>
    <form onSubmit={handleSignup}>
      <div>
        <label>Username:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit">Sign Up</button>
      {error && <p className={styles.errorText}>{error}</p>}
    </form>
    <p>
        Already have an account? <Link href="/"> Log in</Link>
      </p>
  </div>
  </div>
  );
};

export default Signup;
