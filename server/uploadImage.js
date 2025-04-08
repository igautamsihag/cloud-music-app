const fs = require('fs');
const axios = require('axios');
const { S3Client, PutObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');

// Load the JSON file
const jsonFilePath = './2025a1.json'; // Adjust the path as needed
const s3BucketName = 'artist-img-url-assignment'; // Replace with your S3 bucket name

// AWS S3 Client
const s3Client = new S3Client({
  region: 'us-east-1', // Specify your region
});

async function downloadImage(url, filename) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');
    return buffer;
  } catch (error) {
    console.error(`Error downloading image from ${url}:`, error);
    return null;
  }
}

async function uploadImageToS3(imageBuffer, filename) {
  try {
    const command = new PutObjectCommand({
      Bucket: s3BucketName,
      Key: `artist-images/${filename}`,
      Body: imageBuffer,
      ContentType: 'image/jpeg', // Assuming all images are JPEG
    });
    const data = await s3Client.send(command);
    console.log(`Successfully uploaded ${filename} to S3`);
  } catch (error) {
    console.error(`Error uploading image ${filename} to S3:`, error);
  }
}

// Check if the image already exists in S3 by listing the objects in the folder
async function checkImageExists(filename) {
  const command = new ListObjectsV2Command({
    Bucket: s3BucketName,
    Prefix: `artist-images/${filename}`,
  });

  try {
    const data = await s3Client.send(command);
    return data.Contents && data.Contents.length > 0; // If there is any object with the same filename
  } catch (error) {
    console.error('Error checking if image exists in S3:', error);
    return false;
  }
}

async function processImages() {
  try {
    // Read and parse the JSON file
    const data = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

    // Loop through the songs data and download/upload images
    for (const song of data.songs) {
      const { img_url, artist } = song; // Accessing the img_url and artist from the song object

      if (!img_url) {
        console.log(`No img_url found for artist ${artist}`);
        continue;
      }

      // Generate the image filename from the artist name
      const imageFilename = `${artist}.jpg`;

      // Check if the image already exists in S3
      const imageExists = await checkImageExists(imageFilename);
      if (imageExists) {
        console.log(`Image for ${artist} already exists in S3, skipping upload.`);
        continue;
      }

      // Download the image and upload to S3
      const imageBuffer = await downloadImage(img_url, imageFilename);
      if (imageBuffer) {
        await uploadImageToS3(imageBuffer, imageFilename);
      }
    }
  } catch (error) {
    console.error('Error processing images:', error);
  }
}

// Start the process
processImages();
