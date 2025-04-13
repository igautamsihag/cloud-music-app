import { DynamoDBClient, GetItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
const client = new DynamoDBClient({ region: 'us-east-1' });
export const handler = async (event) => {
  let body;
  try {
    body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid JSON format' }),
    };
  }
  const { email, title } = body;
  if (!email || !title) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Email and title are missing' }),
    };
  }
  const params = {
    TableName: 'login', 
    Key: {
      email: { S: email }, 
    },
  };
  try {
    const userSubscription = await client.send(new GetItemCommand(params));
    if (!userSubscription.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'User missing from the table' }),
      };
    }
    const subscriptions = userSubscription.Item.subscriptions ? userSubscription.Item.subscriptions.L : [];
    const updatedSongs = subscriptions.filter(
      (song) => song.M.title.S !== title
    );

    if (updatedSongs.length === subscriptions.length) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Song missing from the user subscriptions list' }),
      };
    }
    const updateParams = {
      TableName: 'login',
      Key: { email: { S: email } },
      UpdateExpression: 'SET subscriptions = :subscriptions',
      ExpressionAttributeValues: {
        ':subscriptions': { L: updatedSongs },
      },
      ReturnValues: 'UPDATED_NEW',
    };
    await client.send(new UpdateItemCommand(updateParams));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Task to unsubscribe song was successful' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Task to unsubscribe song failed' }),
    };
  }
};
