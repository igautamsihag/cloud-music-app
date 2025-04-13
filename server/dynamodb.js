const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({
  region: "us-east-1", 
});

const dynamoDB = DynamoDBDocumentClient.from(client);

const getItem = async (TableName, key) => {
  const params = {
    TableName,
    Key: key,
  };

  try {
    const data = await dynamoDB.send(new GetCommand(params));
    return data.Item; 
  } catch (error) {
    console.error("Task to get item failed:", error);
    throw error; 
  }
};

const putItem = async (TableName, item) => {
  const params = {
    TableName,
    Item: item, 
  };

  try {
    await dynamoDB.send(new PutCommand(params));
    console.log("Task to add item was successful");
  } catch (error) {
    console.error("Task to add item failed:", error);
    throw error; 
  }
};

const checkIfExists = async (TableName, email) => {
  const params = {
    TableName,
    Key: {
      email, 
    },
  };

  try {
    const data = await dynamoDB.send(new GetCommand(params));
    return data.Item !== undefined; 
  } catch (error) {
    console.error("Task to check duplicate item failed:", error);
    throw error;
  }
};

module.exports = { dynamoDB, TableName: "login", getItem, putItem, checkIfExists };
