const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { CreateTableCommand } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({
  region: "us-east-1",  
});

const createTable = async () => {
  const params = {
    TableName: "login",  
    KeySchema: [
      { AttributeName: "email", KeyType: "HASH" },  
    ],
    AttributeDefinitions: [
      { AttributeName: "email", AttributeType: "S" },  
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  };

  try {
    const data = await client.send(new CreateTableCommand(params));
    console.log("Login table was created successfully:", data);
  } catch (error) {
    console.error("Login table creation failed:", error);
  }
};

createTable();
