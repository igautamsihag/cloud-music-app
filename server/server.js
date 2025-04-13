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
    "http://localhost:3000", 
    "http://ec2-44-211-177-173.compute-1.amazonaws.com:3000", 
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
      console.error("Task to get user subscriptions failed:", error);
      res.status(500).json({ message: "Error occur while executing task of getting user subscriptions." });
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

    res.json({ message: "Task to subscribe song was successful!" });
  } catch (error) {
    console.error("Task to subscribe song failed:", error);
    res.status(500).json({ message: "Error occured while subscribing song." });
  }
});


app.delete("/api/unsubscribe", async (req, res) => {
    try {
      const { email, title } = req.query; 
  
      if (!email || !title) {
        return res.status(400).json({ message: "Invalid request data" });
      }
      console.log("Unsubscribe request for:", { email, title });
      const params = {
        TableName: "login",  
        Key: {
          email: { S: email },  
        },
      };
  
      const userSubscription = await client.send(new GetItemCommand(params));
  
      if (!userSubscription.Item) {
        console.log("User not found:", email);
        return res.status(404).json({ message: "User not found" });
      }
      console.log("Subscribed songs of user are:", userSubscription.Item.subscriptions);
  
      const updatedSongs = userSubscription.Item.subscriptions.L.filter(
        (song) => song.M.title.S !== title
      );
  
      if (updatedSongs.length === userSubscription.Item.subscriptions.L.length) {
        console.log("Song is  not present in the subscriptions list:", title);
        return res.status(404).json({ message: "Song is  not present in the subscriptions list" });
      }

      const updateParams = {
        TableName: "login",  
        Key: { email: { S: email } },  
        UpdateExpression: "SET subscriptions = :subscriptions",
        ExpressionAttributeValues: {
          ":subscriptions": { L: updatedSongs },
        },
        ReturnValues: "UPDATED_NEW",
      };
  
      await client.send(new UpdateItemCommand(updateParams));
  
      console.log("Task to unsubscribe the song was successful:", { email, title });
      res.json({ message: "Task to unsubscribe the song was successful" });
    } catch (error) {
      console.error("Task to unsubscribe the song failed:", error);
      res.status(500).json({ message: "Task to unsubscribe the song failed" });
    }
  });
  
app.post("/api/register", async (req, res) => {
    const { email, username, password } = req.body;

    const exists = await checkIfExists(TableName, email);
    if (exists) {
        return res.status(400).json({ message: "This user email already exists" });
    }

    const params = {
        TableName,
        Item: {
            email,     
            username,   
            password,   
        },
    };

    try {
        await putItem(TableName, params.Item);  
        res.status(201).json({ message: "Task to register the user was successful!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    const params = {
        TableName,
        Key: {
            email,  
        },
    };

    try {
        const data = await getItem(TableName, params.Key); 

        if (!data) {
            return res.status(400).json({ message: "Email or password is invalid!" });
        }

        if (password === data.password) {
            res.status(200).json({ message: "Login successful!", email: data.email, username: data.username  });
        } else {
            res.status(400).json({ message: "Email or password is invalid!" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('api/test', (req, res) => {
  res.json({message: 'API is working'});
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
