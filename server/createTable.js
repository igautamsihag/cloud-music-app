const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { CreateTableCommand } = require('@aws-sdk/client-dynamodb');

// Initialize DynamoDB client for local setup
const client = new DynamoDBClient({
  region: "us-east-1",  // Region is arbitrary for local testing  // Point to local DynamoDB instance
});

// Function to create the table
const createTable = async () => {
  const params = {
    TableName: "login",  // Table name
    KeySchema: [
      { AttributeName: "email", KeyType: "HASH" },  // Partition key (email)
    ],
    AttributeDefinitions: [
      { AttributeName: "email", AttributeType: "S" },  // String type for email
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  };

  try {
    const data = await client.send(new CreateTableCommand(params));
    console.log("Table created successfully:", data);
  } catch (error) {
    console.error("Error creating table:", error);
  }
};

createTable();
