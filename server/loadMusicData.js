const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const fs = require('fs');

// Initialize DynamoDB client and document client with custom endpoint
const dynamoDBClient = new DynamoDBClient({
  region: 'us-east-1'  // Specify DynamoDB Local endpoint
});
const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

// Read the data from JSON file
const data = JSON.parse(fs.readFileSync('2025a1.json', 'utf8'));

const run = async () => {
  for (const song of data.songs) {
    const params = {
      TableName: 'music',
      Item: {
        artist: song.artist.trim(),
        title: song.title.trim(),
        year: song.year,  
        album: song.album,
        image_url: song.img_url,  // Use img_url as image_url
      },
    };

    try {
      await docClient.send(new PutCommand(params));
      console.log(`Added song: ${song.title}`);
    } catch (err) {
      console.error('Error adding song:', err);
    }
  }
};

run();
