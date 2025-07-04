const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, BatchWriteCommand } = require('@aws-sdk/lib-dynamodb');


const client = new DynamoDBClient({
  region: "us-east-1", 
});

const dynamoDB = DynamoDBDocumentClient.from(client);

const TableName = "login";  

const insertRecords = async (items) => {
  const params = {
    RequestItems: {
      [TableName]: items.map(item => ({
        PutRequest: {
          Item: item
        }
      }))
    }
  };

  try {
    const data = await dynamoDB.send(new BatchWriteCommand(params));
    console.log("User records inserted successfully:", data);
  } catch (error) {
    console.error("User records insertion failed:", error);
  }
};

const userRecords = [
  { email: "s40710860@student.rmit.edu.au", username: "GautamSihag0", password: "012345" },
  { email: "s40710861@student.rmit.edu.au", username: "GautamSihag1", password: "123456" },
  { email: "s40710862@student.rmit.edu.au", username: "GautamSihag2", password: "234567" },
  { email: "s40710863@student.rmit.edu.au", username: "GautamSihag3", password: "345678" },
  { email: "s40710864@student.rmit.edu.au", username: "GautamSihag4", password: "456789" },
  { email: "s40710865@student.rmit.edu.au", username: "GautamSihag5", password: "567890" },
  { email: "s40710866@student.rmit.edu.au", username: "GautamSihag6", password: "678901" },
  { email: "s40710867@student.rmit.edu.au", username: "GautamSihag7", password: "789012" },
  { email: "s40710868@student.rmit.edu.au", username: "GautamSihag8", password: "890123" },
  { email: "s40710869@student.rmit.edu.au", username: "GautamSihag9", password: "901234" },
];

insertRecords(userRecords);

