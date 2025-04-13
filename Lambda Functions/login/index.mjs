import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: "us-east-1" });
const TableName = "login";
export const handler = async (event) => {
  try {
    const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const { email, password } = body;
    if (!email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Email and password are required" }),
      };
    }
    const params = {
      TableName,
      Key: {
        email: { S: email },
      },
    };
    const data = await client.send(new GetItemCommand(params));
    if (!data.Item || data.Item.password.S !== password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Email or password is invalid!" }),
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Task to login user was successful!",
        email: data.Item.email.S,
        username: data.Item.username.S,
      }),
    };
  } catch (error) {
    console.error("Task to login user failed:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
