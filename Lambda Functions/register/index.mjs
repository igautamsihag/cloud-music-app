import {DynamoDBClient, GetItemCommand, PutItemCommand,} from "@aws-sdk/client-dynamodb";
const client = new DynamoDBClient({ region: "us-east-1" });
const TableName = "login";
export const handler = async (event) => {

  const { email, username, password } = event;

  if (!email || !username || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Email, username, and password are required.",
      }),
    };
  }
  const editedEmail = email.trim().toLowerCase();
  const checkParams = {
    TableName,
    Key: {
      email: { S: editedEmail },
    },
  };
  try {
    const existing = await client.send(new GetItemCommand(checkParams));
    if (existing.Item) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "This user email already exists." }),
      };
    }
    const putParams = {
      TableName,
      Item: {
        email: { S: editedEmail },
        username: { S: username },
        password: { S: password },
      },
    };
    await client.send(new PutItemCommand(putParams));
    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Task to register the user was successful!" }),
    };
  } catch (error) {
    console.error("Task to register the user failed:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
