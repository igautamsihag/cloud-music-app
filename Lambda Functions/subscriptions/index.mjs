import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
const client = new DynamoDBClient({ region: "us-east-1" });
const TableName = "login";
export const handler = async (event) => {
  const params = event.queryStringParameters || {};
  const email = params.email;

  if (!email) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Email is missing." }),
    };
  }

  try {
    const getItemParams = {
      TableName,
      Key: {
        email: { S: email },
      },
    };
    const data = await client.send(new GetItemCommand(getItemParams));
    if (!data.Item || !data.Item.subscriptions) {
      return {
        statusCode: 200,
        body: JSON.stringify([]),
      };
    }
    const subscriptions = data.Item.subscriptions.L.map((item) => ({
      title: item.M.title.S,
      artist: item.M.artist.S,
      album: item.M.album.S,
      year: item.M.year.S,
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(subscriptions),
    };
  } catch (error) {
    console.error("Task to get user subscriptions failed:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Task to get user subscriptions failed.", error: error.message }),
    };
  }
};
