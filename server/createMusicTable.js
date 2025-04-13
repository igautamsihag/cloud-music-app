const { DynamoDBClient, CreateTableCommand } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({ region: 'us-east-1'});

const params = {
  TableName: 'music',
  KeySchema: [
    { AttributeName: 'artist', KeyType: 'HASH' }, 
    { AttributeName: 'title', KeyType: 'RANGE' }, 
  ],
  AttributeDefinitions: [
    { AttributeName: 'artist', AttributeType: 'S' },
    { AttributeName: 'title', AttributeType: 'S' },
    { AttributeName: 'year', AttributeType: 'S' },
    { AttributeName: 'album', AttributeType: 'S' },
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: 'AlbumYearIndex',
      KeySchema: [
        { AttributeName: 'album', KeyType: 'HASH' },
        { AttributeName: 'year', KeyType: 'RANGE' },
      ],
      Projection: { ProjectionType: 'ALL' },
      ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
    },
  ],
  ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
};

const createTable = async () => {
  try {
    const data = await client.send(new CreateTableCommand(params));
    console.log('Music table was created successfully:', data);
  } catch (err) {
    console.error('Music Table creation failed:', err);
  }
};

createTable();
