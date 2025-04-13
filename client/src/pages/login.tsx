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
    console.log("API Base URL:", process.env.NEXT_PUBLIC_API_BASE);
  
    const requestBody = JSON.stringify({
      body: JSON.stringify({ email, password })
    });
  
    const res = await fetch(`https://0mxozuzf4i.execute-api.us-east-1.amazonaws.com/Production/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: requestBody,
    });
  
    const rawData = await res.json();
    console.log("Login raw response data:", rawData);
  
    if (res.status !== 200) {
      setError(rawData.message || "Login failed");
      return;
    }
  
    let data;
    try {
      data = typeof rawData.body === "string" ? JSON.parse(rawData.body) : rawData.body;
    } catch {
      console.error("Failed to convert rawData.body:", rawData.body);
      setError("Invalid response from server");
      return;
    }
  
    console.log("Converted login data:", data);
  
    if (data?.username) {
      const userData = {
        email: data.email,
        username: data.username,
      };
      login(userData); 
      router.push("/dashboard");
    } else {
      setError("Task to login user was failed");
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
