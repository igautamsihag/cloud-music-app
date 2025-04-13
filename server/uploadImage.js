const fs = require('fs');
const axios = require('axios');
const { S3Client, PutObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');

const jsonFilePath = './2025a1.json'; 
const s3BucketName = 'artist-img-url-assignment'; 

const s3Client = new S3Client({
  region: 'us-east-1', 
});

// function to download the image
async function downloadImage(url, filename) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');
    return buffer;
  } catch (error) {
    console.error(`Download image task failed: ${url}:`, error);
    return null;
  }
}

// function to upload the image
async function uploadImage(imageBuffer, filename) {
  try {
    const command = new PutObjectCommand({
      Bucket: s3BucketName,
      Key: `artist-images/${filename}`,
      Body: imageBuffer,
      ContentType: 'image/jpeg', 
    });
    const data = await s3Client.send(command);
    console.log(`Uploading of ${filename} image to S3 was successful`);
  } catch (error) {
    console.error(`Uploading of ${filename} image to S3 failed:`, error);
  }
}

// function to check duplicate images
async function checkDuplicate(filename) {
  const command = new ListObjectsV2Command({
    Bucket: s3BucketName,
    Prefix: `artist-images/${filename}`,
  });

  try {
    const data = await s3Client.send(command);
    return data.Contents && data.Contents.length > 0; 
  } catch (error) {
    console.error('Analysis of duplicate image failed:', error);
    return false;
  }
}

// function to call all the above functions, download image, upload image and check duplicate images
async function initiateTask() {
  try {
    const data = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
    for (const song of data.songs) {
      const { img_url, artist } = song; 
      if (!img_url) {
        console.log(`No image was found for the artist ${artist}`);
        continue;
      }

      const imageFilename = `${artist}.jpg`;

      const duplicateImage = await checkDuplicate(imageFilename);
      if (duplicateImage) {
        console.log(`Image of singer, ${artist} is already there in S3, ignoring the duplicate images.`);
        continue;
      }

      const imageBuffer = await downloadImage(img_url, imageFilename);
      if (imageBuffer) {
        await uploadImage(imageBuffer, imageFilename);
      }
    }
  } catch (error) {
    console.error('Image upload to s3 bucked failed:', error);
  }
}

initiateTask();
