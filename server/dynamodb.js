const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

// Initialize DynamoDB client
const client = new DynamoDBClient({
  region: "us-east-1", // Set your region here
 // Use the local DynamoDB instance if running locally
});

// Create DynamoDB DocumentClient
const dynamoDB = DynamoDBDocumentClient.from(client);

// Function to get an item from DynamoDB
const getItem = async (TableName, key) => {
  const params = {
    TableName,
    Key: key, // The key to retrieve the item
  };

  try {
    const data = await dynamoDB.send(new GetCommand(params));
    return data.Item; // Return the item retrieved
  } catch (error) {
    console.error("Error retrieving item:", error);
    throw error; // Propagate error
  }
};

// Function to put an item into DynamoDB
const putItem = async (TableName, item) => {
  const params = {
    TableName,
    Item: item, // The item to store in the table
  };

  try {
    await dynamoDB.send(new PutCommand(params));
    console.log("Item added successfully");
  } catch (error) {
    console.error("Error adding item:", error);
    throw error; // Propagate error
  }
};

// Function to check if an item exists
const checkIfExists = async (TableName, email) => {
  const params = {
    TableName,
    Key: {
      email, // Primary Key (email)
    },
  };

  try {
    const data = await dynamoDB.send(new GetCommand(params));
    return data.Item !== undefined; // Return true if item exists
  } catch (error) {
    console.error("Error checking item existence:", error);
    throw error;
  }
};

module.exports = { dynamoDB, TableName: "login", getItem, putItem, checkIfExists };
