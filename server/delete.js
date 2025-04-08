const { DynamoDBClient, DeleteTableCommand } = require('@aws-sdk/client-dynamodb');

// Initialize DynamoDB client with your endpoint (Local DynamoDB)
const client = new DynamoDBClient({ region: 'us-east-1', endpoint: 'http://localhost:8000' });

const deleteTable = async () => {
  const params = {
    TableName: 'music',  // Name of the table you want to delete
  };

  try {
    const data = await client.send(new DeleteTableCommand(params));
    console.log("Table 'music' deleted successfully:", data);
  } catch (err) {
    console.error("Error deleting table:", err);
  }
};

deleteTable();
