const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { dynamoDB, TableName, getItem, putItem, checkIfExists } = require("./dynamodb");  
const { DynamoDBClient, UpdateItemCommand, GetItemCommand } = require("@aws-sdk/client-dynamodb");
const app = express();
const queryRoutes = require("./query");
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: [
    "http://localhost:3000", // Local frontend
    "http://ec2-52-87-243-1.compute-1.amazonaws.com", // EC2 frontend
  ],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use("/api", queryRoutes);

const client = new DynamoDBClient({
    region: "us-east-1",
  });
  
  app.get("/api/subscriptions", async (req, res) => {
    const email = req.query.email;
  
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }
  
    try {
      const params = {
        TableName: "login",
        Key: {
          email: { S: email },
        },
      };
  
      const data = await client.send(new GetItemCommand(params));
  
      if (!data.Item || !data.Item.subscriptions) {
        return res.json([]);
      }
  
      const subscriptions = data.Item.subscriptions.L.map((item) => ({
        title: item.M.title.S,
        artist: item.M.artist.S,
        album: item.M.album.S,
        year: item.M.year.S,
      }));
  
      res.json(subscriptions);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      res.status(500).json({ message: "Error retrieving subscriptions." });
    }
  });

  app.post("/api/subscribe", async (req, res) => {
    const { email, song } = req.body;
  
    if (!email || !song) {
      return res.status(400).json({ message: "Invalid request." });
    }
  
    try {
      const params = {
        TableName: "login",
        Key: {
          email: { S: email },
        },
        UpdateExpression: "SET subscriptions = list_append(if_not_exists(subscriptions, :empty_list), :new_sub)",
        ExpressionAttributeValues: {
          ":new_sub": { L: [{ M: {
            title: { S: song.title },
            artist: { S: song.artist },
            album: { S: song.album },
            year: { S: song.year }
          }}]},
          ":empty_list": { L: [] }
        },
        ReturnValues: "UPDATED_NEW",
      };

      await client.send(new UpdateItemCommand(params));

    res.json({ message: "Subscription successful!" });
  } catch (error) {
    console.error("Subscription error:", error);
    res.status(500).json({ message: "Error subscribing to song." });
  }
});


app.delete("/api/unsubscribe", async (req, res) => {
    try {
      const { email, title } = req.query; // Accept query parameters
  
      if (!email || !title) {
        return res.status(400).json({ message: "Invalid request data" });
      }
  
      // Log email and title received
      console.log("Unsubscribe request for:", { email, title });
  
      // Fetch the user's subscription list from the 'login' table
      const params = {
        TableName: "login",  // Correct table name
        Key: {
          email: { S: email },  // Use email as the partition key
        },
      };
  
      const userSubscription = await client.send(new GetItemCommand(params));
  
      if (!userSubscription.Item) {
        console.log("User not found:", email);
        return res.status(404).json({ message: "User not found" });
      }
  
      // Log the user's subscription data
      console.log("User subscriptions:", userSubscription.Item.subscriptions);
  
      // Filter out the song that needs to be removed
      const updatedSongs = userSubscription.Item.subscriptions.L.filter(
        (song) => song.M.title.S !== title
      );
  
      if (updatedSongs.length === userSubscription.Item.subscriptions.L.length) {
        console.log("Song not found in subscriptions:", title);
        return res.status(404).json({ message: "Song not found in subscriptions" });
      }
  
      // Update the database with the filtered list
      const updateParams = {
        TableName: "login",  // Correct table name
        Key: { email: { S: email } },  // Use email as the partition key
        UpdateExpression: "SET subscriptions = :subscriptions",
        ExpressionAttributeValues: {
          ":subscriptions": { L: updatedSongs },
        },
        ReturnValues: "UPDATED_NEW",
      };
  
      await client.send(new UpdateItemCommand(updateParams));
  
      console.log("Unsubscribed successfully:", { email, title });
      res.json({ message: "Unsubscribed successfully" });
    } catch (error) {
      console.error("Error deleting subscription:", error);
      res.status(500).json({ message: "Error unsubscribing" });
    }
  });
  

// User Registration (Sign Up) without password encryption
app.post("/api/register", async (req, res) => {
    const { email, username, password } = req.body;

    // Check if email already exists in the DynamoDB table
    const exists = await checkIfExists(TableName, email);
    if (exists) {
        return res.status(400).json({ message: "The email already exists" });
    }

    const params = {
        TableName,
        Item: {
            email,      // Primary Key (email)
            username,   // Username
            password,   // Store password as plain text
        },
    };

    try {
        // Use the putItem function to add the item
        await putItem(TableName, params.Item);  // Call the updated putItem function
        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// User Login without password encryption
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    const params = {
        TableName,
        Key: {
            email,  // Primary Key (email)
        },
    };

    try {
        // Use the getItem function to retrieve the item
        const data = await getItem(TableName, params.Key);  // Call the updated getItem function

        if (!data) {
            return res.status(400).json({ message: "Email or password is invalid!" });
        }

        // Compare password (direct match, without hashing)
        if (password === data.password) {
            res.status(200).json({ message: "Login successful!", email: data.email, username: data.username  });
        } else {
            res.status(400).json({ message: "Email or password is invalid!" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
