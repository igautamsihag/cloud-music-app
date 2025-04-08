import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import { useRouter } from "next/router";
import styles from '../styles/login.module.css';

const Login = () => {
  const {login} = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({  email, password }),
    });

    const data = await response.json();
    if (response.ok) {
      login({ email: data.email, username: data.username });
      router.push("/dashboard");
    } else {
      setError(data.message);
    }
  };

  return (
    <div className={styles.box}>
      <div className={styles.formbox}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
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
        <button type="submit">Login</button>
        {error && <p className={styles.errorText}>{error}</p>}
      </form>
      <p>
        Do not have an account? <a href="signup">Sign up</a>
      </p>
    </div>
    </div>
  );
};

export default Login;
