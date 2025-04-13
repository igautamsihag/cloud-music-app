import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
const client = new DynamoDBClient({ region: "us-east-1" });
export const handler = async (event) => {
  try {
    const email = event.email;
    const song = event.song;
    if (!email || !song || !song.title || !song.artist || !song.album || !song.year) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Email and song are missing." }),
      };
    }
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
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Task to subscribe song was successful!" }),
    };
  } catch (error) {
    console.error("Task to subscribe song failed:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        errorType: error.name,
        errorMessage: error.message,
        trace: error.stack?.split("\n"),
      }),
    };
  }
};
