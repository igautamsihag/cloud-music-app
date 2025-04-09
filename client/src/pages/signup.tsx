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

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();
    if (response.ok) {
      alert(data.message);
    } else {
      setError(data.error || data.message);
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
