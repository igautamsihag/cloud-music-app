const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const fs = require('fs');

const dynamoDBClient = new DynamoDBClient({
  region: 'us-east-1'  
});
const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

const data = JSON.parse(fs.readFileSync('2025a1.json', 'utf8'));

const loadMusicData = async () => {
  for (const song of data.songs) {
    const params = {
      TableName: 'music',
      Item: {
        artist: song.artist.trim(),
        title: song.title.trim(),
        year: song.year,  
        album: song.album,
        image_url: song.img_url,  
      },
    };

    try {
      await docClient.send(new PutCommand(params));
      console.log(`Inserted song: ${song.title}`);
    } catch (err) {
      console.error('Song insertion failed:', err);
    }
  }
};

loadMusicData();
