const express = require("express");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");

const router = express.Router();
const dynamoDBClient = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

router.post("/query", async (req, res) => {
  console.log("Query request arrived:", req.body);
  const { title, year, artist, album } = req.body;

  try {
    let filterExpression = [];
    let expressionAttributeValues = {};
    let expressionAttributeNames = {}; 

    if (artist) {
      filterExpression.push("artist = :artist");
      expressionAttributeValues[":artist"] = artist;
    }
    if (title) {
      filterExpression.push("title = :title");
      expressionAttributeValues[":title"] = title;
    }
    if (year) {
      filterExpression.push("#yr = :year");
      expressionAttributeValues[":year"] = year;
      expressionAttributeNames["#yr"] = "year"; 
    }
    if (album) {
      filterExpression.push("album = :album");
      expressionAttributeValues[":album"] = album;
    }

    let params = {
      TableName: "music",
      FilterExpression: filterExpression.join(" AND "),
      ExpressionAttributeValues: expressionAttributeValues,
    };

    if (year) {
      params.ExpressionAttributeNames = expressionAttributeNames;
    }

    const { Items } = await docClient.send(new ScanCommand(params));

    res.status(200).json(Items || []);
  } catch (error) {
    console.error("Data query failed:", error);
    res.status(500).json({ error: "Failed to retrieve data" });
  }
});

module.exports = router;
